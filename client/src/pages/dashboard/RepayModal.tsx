import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

interface RepayModalProps {
	applicationId: string;
	outstandingAmount: number;
	onSubmit: (applicationId: string, amount: number) => Promise<void>;
}

export function RepayModal({
	applicationId,
	outstandingAmount,
	onSubmit,
}: RepayModalProps) {
	const [open, setOpen] = useState(false);
	const [amount, setAmount] = useState("");

	const handleOpenChange = (open: boolean) => {
		setOpen(open);
		if (!open) {
			setAmount("");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onSubmit(applicationId, parseFloat(amount));
		setOpen(false);
	};

	const setMaxAmount = () => {
		setAmount(outstandingAmount.toString());
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button className="bg-green-500 text-white">Repay</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Repay Loan</DialogTitle>
					<DialogDescription>
						Enter the amount you want to repay. Outstanding amount: $
						{outstandingAmount.toFixed(2)}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="amount">Repayment Amount</Label>
								<Button
									type="button"
									onClick={setMaxAmount}
									className="h-8 text-xs"
								>
									Max
								</Button>
							</div>
							<Input
								id="amount"
								type="number"
								step="0.01"
								min="0"
								max={outstandingAmount}
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								required
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit">Submit Repayment</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
