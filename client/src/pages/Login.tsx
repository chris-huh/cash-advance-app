import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginTemplate } from "./Login.template";

interface LoginFormData {
	email: string;
	password: string;
}

const Login: React.FC = () => {
	const [isSignIn, setIsSignIn] = useState(true);
	const [formData, setFormData] = useState<LoginFormData>({
		email: "",
		password: "",
	});
	const [error, setError] = useState<string>("");
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		try {
			const endpoint = isSignIn ? "/signin" : "/signup";
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}${endpoint}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				}
			);

			if (response.ok) {
				const data = await response.json();
				localStorage.setItem("token", data.token);
				localStorage.setItem("user", JSON.stringify(data.user));
				navigate("/dashboard", { replace: true });
				navigate(0);
			}
		} catch (err) {
			setError((err as Error).message);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleToggle = () => setIsSignIn(!isSignIn);

	return (
		<LoginTemplate
			isSignIn={isSignIn}
			error={error}
			handleSubmit={handleSubmit}
			handleChange={handleChange}
			handleToggle={handleToggle}
		/>
	);
};

export default Login;
