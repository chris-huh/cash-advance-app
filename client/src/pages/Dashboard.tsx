import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserInfo } from "./dashboard/UserInfo";
import { ApplicationHistory } from "./dashboard/ApplicationHistory";
import { styles } from "./Dashboard.styles";
import { Button } from "../components/ui/button";

const Dashboard: React.FC = () => {
	const [user, setUser] = useState<any>(null);
	const navigate = useNavigate();
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	useEffect(() => {
		const userStr = localStorage.getItem("user");
		if (userStr) {
			setUser(JSON.parse(userStr));
		}
	}, []);

	const handleSignOut = () => {
		localStorage.removeItem("user");
		localStorage.removeItem("token");

		navigate("/login", { replace: true });
		navigate(0);
	};

	if (!user) {
		return (
			<div className={styles.loadingContainer}>
				<div className={styles.loadingText}>Loading...</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<div className={styles.header}>
					<div className="flex justify-between items-center">
						<div>
							<h1 className={styles.title}>Dashboard</h1>
							<p className={styles.welcome}>Welcome back, {user.email}</p>
						</div>
						<Button className="bg-white border-black" onClick={handleSignOut}>
							Sign Out
						</Button>
					</div>
				</div>
				<div className={styles.card}>
					<h2 className={styles.sectionTitle}>User Information</h2>

					<UserInfo user={user} refreshTrigger={refreshTrigger} />
				</div>
				<div className="mt-4">
					<div className={styles.card}>
						<h2 className={styles.sectionTitle}>Applications</h2>
						<ApplicationHistory
							userId={user.id}
							onRefreshUserInfo={() => setRefreshTrigger((prev) => prev + 1)}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
