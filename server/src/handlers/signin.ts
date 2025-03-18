import { APIGatewayProxyHandler } from "aws-lambda";
import { supabase } from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { errorResponse, successResponse } from "../utils/response";

interface SigninBody {
	email: string;
	password: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret_key";
const TOKEN_TTL = "24h"; // Token expires in 24 hours

export const handler: APIGatewayProxyHandler = async (event) => {
	try {
		if (!event.body) {
			throw new Error("Missing request body");
		}

		const { email, password }: SigninBody = JSON.parse(event.body);

		if (!email || !password) {
			return errorResponse("Email and password are required");
		}

		// Get user from database
		const { data: users, error: fetchError } = await supabase
			.from("users")
			.select("*")
			.eq("email", email)
			.single();

		if (fetchError || !users) {
			return errorResponse("Invalid credentials", 401);
		}

		// Verify password
		const isValidPassword = await bcrypt.compare(password, users.password);
		if (!isValidPassword) {
			return errorResponse("Invalid credentials", 401);
		}

		// Generate JWT token
		const token = jwt.sign(
			{
				userId: users.id,
				email: users.email,
				role: users.role,
				credit_limit: users.credit_limit,
				available_credit: users.available_credit,
			},
			JWT_SECRET,
			{ expiresIn: TOKEN_TTL }
		);

		return successResponse(
			{
				token,
				user: {
					id: users.id,
					email: users.email,
					role: users.role,
					created_at: users.created_at,
					credit_limit: users.credit_limit,
					available_credit: users.available_credit,
				},
			},
			"Login successful"
		);
	} catch (error) {
		return errorResponse((error as Error).message, 500);
	}
};
