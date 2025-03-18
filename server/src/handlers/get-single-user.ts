import { APIGatewayProxyHandler } from "aws-lambda";
import { supabase } from "../config/db";
import { successResponse, errorResponse } from "../utils/response";

export const handler: APIGatewayProxyHandler = async (event) => {
	try {
		const token = event.headers.Authorization?.split(" ")[1];
		if (!token) {
			return errorResponse("No authorization token provided", 401);
		}

		// Get user ID from path parameters
		const userId = event.pathParameters?.userId;
		if (!userId) {
			return errorResponse("User ID is required");
		}

		// Fetch user from database
		const { data: user, error } = await supabase
			.from("users")
			.select("id, email, role, credit_limit, available_credit, created_at")
			.eq("id", userId)
			.single();

		if (error) throw error;

		if (!user) {
			return errorResponse("User not found", 404);
		}

		return successResponse({ user });
	} catch (error) {
		console.error("Error fetching user:", error);
		return errorResponse((error as Error).message, 500);
	}
};
