import { APIGatewayProxyHandler } from "aws-lambda";
import { supabase } from "../config/db";
import bcrypt from "bcryptjs";
import { PostgrestError } from "@supabase/supabase-js";
import { createdResponse, errorResponse } from "../utils/response";

interface SignupBody {
	email: string;
	password: string;
	isAdmin?: boolean;
}

export const handler: APIGatewayProxyHandler = async (event) => {
	try {
		if (!event.body) {
			throw new Error("Missing request body");
		}

		const { email, password, isAdmin }: SignupBody = JSON.parse(event.body);

		if (!email || !password) {
			return errorResponse("Email and password are required");
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const { data, error } = await supabase
			.from("users")
			.insert([
				{
					email,
					password: hashedPassword,
					created_at: new Date().toISOString(),
					role: isAdmin ? "admin" : "user",
				},
			])
			.select();

		if (error) throw error;

		return createdResponse(
			{
				user: {
					id: data[0].id,
					email: data[0].email,
					role: data[0].role,
					created_at: data[0].created_at,
					credit_limit: data[0].credit_limit,
					available_credit: data[0].available_credit,
				},
			},
			"User created successfully"
		);
	} catch (error) {
		console.error("Error signing up:", error, typeof error);
		if ((error as PostgrestError)?.code === "23505") {
			return errorResponse("Email already exists", 409);
		}
		return errorResponse((error as Error).message, 500);
	}
};
