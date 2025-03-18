import { APIGatewayProxyHandler } from "aws-lambda";
import { supabase } from "../config/db";
import { ApplicationState } from "../types/application-state";
import { createdResponse, errorResponse } from "../utils/response";
import { verifyToken } from "../utils/auth";

interface ApplicationBody {
	amount: number;
	is_express: boolean;
	tip_amount?: number;
}

const EXPRESS_DUE_DATE_IN_DAYS = 3;
const NORMAL_DUE_DATE_IN_DAYS = 7;

export const handler: APIGatewayProxyHandler = async (event) => {
	try {
		if (!event.body) {
			throw new Error("Missing request body");
		}

		const token = event.headers.Authorization?.split(" ")[1];
		if (!token) {
			return errorResponse("No authorization token provided", 401);
		}

		const decoded = verifyToken(token);
		const application: ApplicationBody = JSON.parse(event.body);

		// Validate required fields
		if (!application.amount) {
			return errorResponse("Requested amount is required");
		}

		// Validate amounts
		if (application.amount <= 0) {
			return errorResponse("Amounts must be greater than 0");
		}

		if (application.tip_amount && application.tip_amount <= 0) {
			return errorResponse("Tip amount must be greater than 0");
		}

		// Check user's credit limit
		const { data: user } = await supabase
			.from("users")
			.select("available_credit")
			.eq("id", decoded.userId)
			.single();

		if (!user || application.amount > user.available_credit) {
			return errorResponse("Amount exceeds available credit limit");
		}

		const { data, error } = await supabase
			.from("applications")
			.insert([
				{
					user_id: decoded.userId,
					state: ApplicationState.OPEN,
					requested_amount: application.amount,
					is_express: application.is_express,
					due_date: application.is_express
						? new Date(
								Date.now() + EXPRESS_DUE_DATE_IN_DAYS * 24 * 60 * 60 * 1000
						  )
						: new Date(
								Date.now() + NORMAL_DUE_DATE_IN_DAYS * 24 * 60 * 60 * 1000
						  ),
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				},
			])
			.select();

		if (error) throw error;

		// Log transaction for the tip
		if (application.tip_amount) {
			const { error: tipError } = await supabase.from("transactions").insert({
				application_id: data[0].id,
				amount: application.tip_amount,
				type: "tip",
			});
			if (tipError) throw tipError;
		}

		return createdResponse(
			{ application: data[0] },
			"Application created successfully"
		);
	} catch (error) {
		console.error("Error creating application:", error);
		return errorResponse((error as Error).message, 500);
	}
};
