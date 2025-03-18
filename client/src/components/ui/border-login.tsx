import { Button } from "./button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { BorderBeam } from "../magicui/border-beam";

interface BorderLoginProps {
	onSubmit: (e: React.FormEvent) => Promise<void>;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onToggle: () => void;
	isSignIn: boolean;
	error?: string;
}

export function BorderLogin({
	onSubmit,
	onChange,
	onToggle,
	isSignIn,
	error,
}: BorderLoginProps) {
	return (
		<Card className="relative w-[350px] overflow-hidden">
			<CardHeader>
				<CardTitle>{isSignIn ? "Login" : "Register"}</CardTitle>
				<CardDescription>
					Enter your credentials to access your account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={onSubmit}>
					<div className="grid w-full items-center gap-4">
						<div className="flex flex-col space-y-1.5">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="Enter your email"
								onChange={onChange}
								className="border-gray-300"
							/>
						</div>
						<div className="flex flex-col space-y-1.5">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								name="password"
								type="password"
								placeholder="Enter your password"
								onChange={onChange}
								className="border-gray-300"
							/>
						</div>
						{error && <div className="text-sm text-red-500">{error}</div>}
					</div>
				</form>
			</CardContent>
			<CardFooter className="flex justify-between">
				<Button onClick={onToggle} className="border-gray-300 bg-white">
					{isSignIn ? "Register" : "Login"}
				</Button>
				<Button
					onClick={onSubmit}
					className="bg-black hover:bg-black/90 text-white"
				>
					{isSignIn ? "Login" : "Register"}
				</Button>
			</CardFooter>
			<BorderBeam
				duration={6}
				size={400}
				className="from-transparent via-red-500 to-transparent"
			/>
			<BorderBeam
				duration={6}
				delay={3}
				size={400}
				className="from-transparent via-blue-500 to-transparent"
			/>
		</Card>
	);
}
