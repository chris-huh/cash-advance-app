import React, { useEffect, useState } from "react";
import { CardContent } from "../../components/ui/card";

interface UserInfoProps {
	user: {
		id: string;
		email: string;
		credit_limit: number;
		available_credit: number;
	};
	refreshTrigger?: number;
}

export const UserInfo: React.FC<UserInfoProps> = ({
	user: initialUser,
	refreshTrigger,
}) => {
	const [user, setUser] = useState(initialUser);
	const isAdmin =
		JSON.parse(localStorage.getItem("user") || "{}")?.role === "admin";

	useEffect(() => {
		const fetchUserInfo = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/users/${user.id}`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					}
				);
				if (!response.ok) throw new Error("Failed to fetch user info");
				const data = await response.json();
				setUser(data.user);
			} catch (error) {
				console.error("Error fetching user info:", error);
			}
		};

		fetchUserInfo();
	}, [refreshTrigger]);

	return (
		<div>
			<CardContent>
				<div className="space-y-4">
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">Email</p>
						<div className="flex items-center gap-2">
							<p className="text-lg font-semibold">{user.email}</p>
							{isAdmin && (
								<span className="bg-black text-white text-xs px-2 py-1 rounded">
									Admin
								</span>
							)}
						</div>
					</div>
					{!isAdmin && (
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1">
								<p className="text-sm font-medium text-muted-foreground">
									Credit Limit
								</p>
								<p className="text-lg font-semibold">
									${user.credit_limit.toLocaleString()}
								</p>
							</div>
							<div className="space-y-1">
								<p className="text-sm font-medium text-muted-foreground">
									Available Credit
								</p>
								<p className="text-lg font-semibold">
									${user.available_credit.toLocaleString()}
								</p>
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</div>
	);
};
