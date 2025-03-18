interface ResponseBody {
	message?: string;
	error?: string;
	application?: any;
	[key: string]: any;
}

interface ResponseOptions {
	statusCode: number;
	body: ResponseBody;
}

export const createResponse = ({ statusCode, body }: ResponseOptions) => ({
	statusCode,
	headers: {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Credentials": true,
	},
	body: JSON.stringify(body),
});

export const successResponse = (data: any, message: string = "Success") =>
	createResponse({
		statusCode: 200,
		body: { message, ...data },
	});

export const createdResponse = (
	data: any,
	message: string = "Created successfully"
) =>
	createResponse({
		statusCode: 201,
		body: { message, ...data },
	});

export const errorResponse = (error: string, statusCode: number = 400) =>
	createResponse({
		statusCode,
		body: { error },
	});
