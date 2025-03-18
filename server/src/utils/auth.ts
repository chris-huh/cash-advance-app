import jwt from "jsonwebtoken";
import { errorResponse } from "./response";

interface JWTPayload {
	userId: string;
	role: string;
	email: string;
}

export const verifyToken = (token: string): JWTPayload => {
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
		return decoded;
	} catch (error) {
		throw new Error("Invalid or expired token");
	}
};

export const extractTokenFromHeader = (event: any): string => {
	const authHeader = event.headers.Authorization || event.headers.authorization;
	if (!authHeader) {
		throw new Error("No authorization header");
	}

	const [type, token] = authHeader.split(" ");
	if (type !== "Bearer" || !token) {
		throw new Error("Invalid authorization header format");
	}

	return token;
};

export const requireRole = (event: any, requiredRole: string) => {
	try {
		const token = extractTokenFromHeader(event);
		const decoded = verifyToken(token);

		if (decoded.role !== requiredRole) {
			throw new Error(`Access denied: ${requiredRole} role required`);
		}

		return decoded;
	} catch (error) {
		throw error;
	}
};
