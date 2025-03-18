import { APIGatewayProxyHandler } from "aws-lambda";
import { supabase } from "../config/db";
import { ApplicationState } from "../types/application-state";
import { successResponse, errorResponse } from "../utils/response";
import { requireRole, verifyToken } from "../utils/auth";

interface UpdateStateBody {
	action: "disburse" | "repay" | "cancel" | "reject";
	amount?: number; // For repay action
}

const validateStateTransition = (
	currentState: ApplicationState,
	action: UpdateStateBody["action"]
): boolean => {
	const validTransitions: Record<
		ApplicationState,
		UpdateStateBody["action"][]
	> = {
		[ApplicationState.OPEN]: ["disburse", "cancel", "reject"],
		[ApplicationState.OUTSTANDING]: ["repay"],
		[ApplicationState.CANCELLED]: [],
		[ApplicationState.REPAID]: [],
		[ApplicationState.REJECTED]: [],
	};

	return validTransitions[currentState].includes(action);
};

export const handler: APIGatewayProxyHandler = async (event) => {
	try {
		if (!event.body) {
			throw new Error("Missing request body");
		}

		const update: UpdateStateBody = JSON.parse(event.body);

		// Validate required fields
		const applicationId = event.pathParameters?.id;
		if (!applicationId || !update.action) {
			return errorResponse("Application ID and action are required");
		}

		// Get current application state
		const { data: application, error: fetchError } = await supabase
			.from("applications")
			.select("*")
			.eq("id", applicationId)
			.single();
		if (!application) {
			return errorResponse("Application not found", 404);
		}
		if (fetchError) throw fetchError;

		// Validate state transition
		if (!validateStateTransition(application.state, update.action)) {
			return errorResponse(
				`Invalid state transition from ${application.state} to ${update.action}`
			);
		}

		// Verify user token and get user info
		const token = event.headers.Authorization?.split(" ")[1];
		if (!token) {
			return errorResponse("No authorization token provided", 401);
		}
		const decoded = verifyToken(token);

		// Get user with lock
		let { data: user, error: userError } = await supabase.rpc("lock_row", {
			user_id: application.user_id,
		});

		if (userError) {
			if (userError.message.includes("could not obtain lock")) {
				// Retry up to 3 more times if locked
				for (let i = 0; i < 3; i++) {
					// Wait 100ms between retries
					await new Promise((resolve) => setTimeout(resolve, 100));

					const { data: retryUser, error: retryError } = await supabase.rpc(
						"lock_row",
						{ user_id: application.user_id }
					);

					if (!retryError) {
						// Successfully got lock, continue with original user data
						user = retryUser;
						break;
					}

					if (!retryError.message.includes("could not obtain lock")) {
						throw retryError;
					}

					if (i === 2) {
						return errorResponse(
							"User record is locked, please try again",
							409
						);
					}
				}
			}
			throw userError;
		}

		switch (update.action) {
			case "disburse": {
				requireRole(event, "admin");

				// Check user's credit limit
				const { data: user } = await supabase
					.from("users")
					.select("available_credit")
					.eq("id", application.user_id)
					.single();

				if (!user || application.requested_amount > user.available_credit) {
					return errorResponse("Amount exceeds the available credit limit");
				}

				// Update application state
				const { error: updateError } = await supabase
					.from("applications")
					.update({
						state: ApplicationState.OUTSTANDING,
						outstanding_amount: application.requested_amount,
						updated_at: new Date().toISOString(),
					})
					.eq("id", applicationId);
				if (updateError) throw updateError;

				// Update user's available credit
				const { error: updateCreditError } = await supabase
					.from("users")
					.update({
						available_credit:
							user.available_credit - application.requested_amount,
					})
					.eq("id", application.user_id);
				if (updateCreditError) throw updateCreditError;

				// Log the transaction
				const { error: logError } = await supabase
					.from("transactions")
					.insert({
						application_id: applicationId,
						amount: application.requested_amount,
						type: "disburse",
						created_at: new Date().toISOString(),
					})
					.select();
				if (logError) throw logError;

				break;
			}

			case "repay": {
				const { data: user } = await supabase
					.from("users")
					.select("available_credit")
					.eq("id", application.user_id)
					.single();

				if (!user) throw new Error("User not found");

				if (!update.amount) {
					return errorResponse("Repayment amount is required");
				}

				if (update.amount <= 0) {
					return errorResponse("Repayment amount must be positive");
				}

				// Verify the user owns this application
				if (decoded.userId !== application.user_id) {
					return errorResponse(
						"Unauthorized: Can only repay your own applications",
						403
					);
				}

				const newOutstandingAmount =
					application.outstanding_amount - update.amount;
				if (newOutstandingAmount < 0) {
					return errorResponse("Repayment amount exceeds outstanding balance");
				}

				const { error: updateError } = await supabase
					.from("applications")
					.update({
						outstanding_amount: newOutstandingAmount,
						state:
							newOutstandingAmount === 0
								? ApplicationState.REPAID
								: ApplicationState.OUTSTANDING,
						updated_at: new Date().toISOString(),
					})
					.eq("id", applicationId);
				if (updateError) throw updateError;

				// Update user's available credit
				const { error: updateCreditError } = await supabase
					.from("users")
					.update({
						available_credit: user.available_credit + update.amount,
					})
					.eq("id", application.user_id);
				if (updateCreditError) throw updateCreditError;

				// Log the transaction
				const { error: logError } = await supabase
					.from("transactions")
					.insert({
						application_id: applicationId,
						amount: update.amount,
						type: "repay",
						created_at: new Date().toISOString(),
					})
					.select();
				if (logError) throw logError;

				break;
			}

			case "cancel": {
				// Verify the user owns this application
				if (decoded.userId !== application.user_id) {
					return errorResponse(
						"Unauthorized: Can only cancel your own applications",
						403
					);
				}

				const { error: updateError } = await supabase
					.from("applications")
					.update({
						state: ApplicationState.CANCELLED,
						updated_at: new Date().toISOString(),
					})
					.eq("id", applicationId);

				if (updateError) throw updateError;
				break;
			}

			case "reject": {
				requireRole(event, "admin");

				const { error: updateError } = await supabase
					.from("applications")
					.update({
						state: ApplicationState.REJECTED,
						updated_at: new Date().toISOString(),
					})
					.eq("id", applicationId);
				if (updateError) throw updateError;

				break;
			}
		}

		// Get updated application
		const { data: updatedApplication, error: getError } = await supabase
			.from("applications")
			.select("*")
			.eq("id", applicationId)
			.single();

		if (getError) throw getError;

		return successResponse(
			{ application: updatedApplication },
			`Application ${update.action} successful`
		);
	} catch (error) {
		console.error("Error updating application state:", error);
		return errorResponse((error as Error).message, 500);
	}
};
