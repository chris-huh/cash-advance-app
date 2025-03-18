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
import { PulsatingButton } from "../../components/magicui/pulsating-button";

interface ApplyCashModalProps {
	onSubmit: (data: {
		amount: number;
		is_express: boolean;
		tip_amount?: number;
	}) => void;
}

export function ApplyCashModal({ onSubmit }: ApplyCashModalProps) {
	const [open, setOpen] = useState(false);
	const [amount, setAmount] = useState("");
	const [isExpress, setIsExpress] = useState(false);
	const [tip, setTip] = useState("");

	const handleOpenChange = (open: boolean) => {
		setOpen(open);
		if (!open) {
			// Reset all form fields when modal is closed
			setAmount("");
			setIsExpress(false);
			setTip("");
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({
			amount: parseFloat(amount),
			is_express: isExpress,
			tip_amount: isExpress ? parseFloat(tip) : undefined,
		});
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<PulsatingButton className="bg-green-500 hover:bg-green-600 text-white">
					Apply for Cash
				</PulsatingButton>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Apply for Cash</DialogTitle>
					<DialogDescription>
						Submit your cash advance application below.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="amount">Request Amount</Label>
							<Input
								id="amount"
								type="number"
								step="0.01"
								min="0"
								pattern="[0-9]*\.?[0-9]{0,2}"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								required
							/>
						</div>
						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="express"
								checked={isExpress}
								onChange={(e) => setIsExpress(e.target.checked)}
								className="h-4 w-4 rounded border border-gray-300 checked:bg-blue-600 checked:border-transparent appearance-none bg-white"
							/>
							<Label htmlFor="express">Express?</Label>
						</div>
						{isExpress && (
							<div className="grid gap-2">
								<Label htmlFor="tip">Tip Amount</Label>
								<Input
									id="tip"
									type="number"
									step="0.01"
									min="0"
									pattern="[0-9]*\.?[0-9]{0,2}"
									value={tip}
									onChange={(e) => setTip(e.target.value)}
									required
								/>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button type="submit">Submit Application</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
