import { useEffect, useState } from "react";
import { ApplyCashModal } from "./ApplyCashModal";
import { Button } from "../../components/ui/button";
import { RepayModal } from "./RepayModal";

interface Application {
	id: string;
	requested_amount: number;
	outstanding_amount: number;
	is_express: boolean;
	tip_amount?: number;
	state: string;
	due_date: string;
	created_at: string;
}

interface ApplicationHistoryProps {
	userId: string;
	onRefreshUserInfo: () => void;
}

export function ApplicationHistory({
	userId,
	onRefreshUserInfo,
}: ApplicationHistoryProps) {
	const [applications, setApplications] = useState<Application[]>([]);
	const [loading, setLoading] = useState(true);
	const isAdmin =
		JSON.parse(localStorage.getItem("user") || "{}")?.role === "admin";

	useEffect(() => {
		fetchApplications();
	}, [userId]);

	const fetchApplications = async () => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/applications`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			if (!response.ok) {
				throw new Error("Failed to fetch applications");
			}
			const data = await response.json();
			setApplications(data.applications);
		} catch (error) {
			console.error("Error fetching applications:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmitApplication = async (data: {
		amount: number;
		is_express: boolean;
		tip_amount?: number;
	}) => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/applications`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: JSON.stringify({
						...data,
						userId,
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to submit application");
			}

			// Refresh the applications list
			fetchApplications();
		} catch (error) {
			console.error("Error submitting application:", error);
		}
	};

	if (loading) {
		return <div>Loading applications...</div>;
	}

	// Add handlers for actions
	const handleApplicationAction = async (
		applicationId: string,
		action: string,
		amount?: number
	) => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/applications/${applicationId}/state`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: JSON.stringify({ action, amount: amount || undefined }),
				}
			);
			if (!response.ok) throw new Error(`Failed to ${action} application`);
			fetchApplications();
		} catch (error) {
			console.error(`Error application ${action}:`, error);
		}
	};

	const handleReject = (id: string) => handleApplicationAction(id, "reject");
	const handleDisburse = (id: string) =>
		handleApplicationAction(id, "disburse");
	const handleCancel = (id: string) => handleApplicationAction(id, "cancel");
	const handleRepay = async (applicationId: string, amount: number) => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/applications/${applicationId}/state`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: JSON.stringify({
						action: "repay",
						amount,
					}),
				}
			);

			if (!response.ok) throw new Error("Failed to repay application");

			// Trigger user info refresh
			onRefreshUserInfo();

			// Refresh applications list
			fetchApplications();
		} catch (error) {
			console.error("Error repaying application:", error);
		}
	};

	return (
		<div className="space-y-4">
			{!isAdmin && (
				<div className="flex justify-end items-center">
					<ApplyCashModal onSubmit={handleSubmitApplication} />
				</div>
			)}
			{applications.length === 0 ? (
				<p>No applications found</p>
			) : (
				<div className="rounded-md border">
					<table className="w-full">
						<thead>
							<tr className="border-b bg-muted/50">
								<th className="h-12 px-4 text-left align-middle font-medium">
									Amount
								</th>
								<th className="h-12 px-4 text-left align-middle font-medium">
									Type
								</th>
								<th className="h-12 px-4 text-left align-middle font-medium">
									Status
								</th>
								<th className="h-12 px-4 text-left align-middle font-medium">
									Balance
								</th>
								<th className="h-12 px-4 text-left align-middle font-medium">
									Due Date
								</th>
								<th className="h-12 px-4 text-left align-middle font-medium w-[200px]"></th>
							</tr>
						</thead>
						<tbody>
							{applications.map((application) => (
								<tr
									key={application.id}
									className="border-b transition-colors hover:bg-muted/50"
								>
									<td className="p-4 align-middle">
										${application.requested_amount.toFixed(2)}
									</td>
									<td className="p-4 align-middle">
										{application.is_express ? "Express" : "Standard"}
									</td>
									<td className="p-4 align-middle">
										{application.state[0].toUpperCase() +
											application.state.slice(1)}
									</td>
									<td className="p-4 align-middle">
										{application.outstanding_amount || undefined}
									</td>
									<td className="p-4 align-middle">
										{new Date(application.due_date).toLocaleDateString()}
									</td>
									<td className="p-4 align-middle min-w-[200px]">
										<div className="flex gap-2 justify-end">
											{isAdmin ? (
												// Admin options
												application.state === "open" && (
													<>
														<Button
															onClick={() => handleReject(application.id)}
															className="bg-red-500 text-white"
														>
															Reject
														</Button>
														<Button
															onClick={() => handleDisburse(application.id)}
															className="bg-green-500 text-white"
														>
															Disburse
														</Button>
													</>
												)
											) : (
												// User options
												<>
													{application.state === "open" && (
														<Button
															onClick={() => handleCancel(application.id)}
															className="bg-red-500 text-white"
														>
															Cancel
														</Button>
													)}
													{application.state === "outstanding" && (
														<RepayModal
															applicationId={application.id}
															outstandingAmount={
																application.outstanding_amount || 0
															}
															onSubmit={handleRepay}
														/>
													)}
												</>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
