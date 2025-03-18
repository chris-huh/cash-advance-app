import React from "react";
import { BorderLogin } from "../components/ui/border-login";

interface LoginTemplateProps {
	isSignIn: boolean;
	error: string;
	handleSubmit: (e: React.FormEvent) => Promise<void>;
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleToggle: () => void;
}

export const LoginTemplate: React.FC<LoginTemplateProps> = ({
	isSignIn,
	error,
	handleSubmit,
	handleChange,
	handleToggle,
}) => (
	<div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center p-4">
		<div className="w-full max-w-md">
			<BorderLogin
				onSubmit={handleSubmit}
				onChange={handleChange}
				onToggle={handleToggle}
				isSignIn={isSignIn}
				error={error}
			/>
		</div>
	</div>
);
