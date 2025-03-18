import { APIGatewayProxyHandler } from "aws-lambda";
import { supabase } from "../config/db";
import { successResponse, errorResponse } from "../utils/response";
import { verifyToken } from "../utils/auth";

export const handler: APIGatewayProxyHandler = async (event) => {
	try {
		const token = event.headers.Authorization?.split(" ")[1];
		if (!token) {
			return errorResponse("No authorization token provided", 401);
		}

		const decoded = verifyToken(token);

		// Check if user has admin role
		const { data: user, error: userError } = await supabase
			.from("users")
			.select("role")
			.eq("id", decoded.userId)
			.single();

		if (userError) throw userError;

		// If admin, remove the user_id filter to fetch all applications
		if (user.role === "admin") {
			const { data: allApplications, error: adminError } = await supabase
				.from("applications")
				.select("*")
				.order("created_at", { ascending: false });

			if (adminError) throw adminError;

			return successResponse({ applications: allApplications });
		}

		const { data, error } = await supabase
			.from("applications")
			.select("*")
			.eq("user_id", decoded.userId)
			.order("created_at", { ascending: false });

		if (error) throw error;

		return successResponse({ applications: data });
	} catch (error) {
		console.error("Error fetching applications:", error);
		return errorResponse((error as Error).message, 500);
	}
};
