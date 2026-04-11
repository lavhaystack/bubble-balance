"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SupplierProductForm = {
	name: string;
	price: string;
	category: string;
	unit: string;
};

type AddProductModalProps = {
	open: boolean;
	form: SupplierProductForm;
	errors: Partial<Record<keyof SupplierProductForm, string>>;
	onClose: () => void;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSave: () => void;
};

export default function AddProductModal({
	open,
	form,
	errors,
	onClose,
	onChange,
	onSave,
}: AddProductModalProps) {
	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent className="max-w-[560px]">
				<DialogHeader>
					<DialogTitle>Add Supplier Product</DialogTitle>
					<DialogDescription>
						Add a product to this supplier so it appears in Inventory add-product dropdown.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="productName">Product Name *</Label>
						<Input
							id="productName"
							name="name"
							value={form.name}
							onChange={onChange}
							placeholder="e.g., Lavender Essential Oil Soap"
							className={errors.name ? "border-red-600" : ""}
						/>
						{errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="productPrice">Price ($) *</Label>
							<Input
								id="productPrice"
								name="price"
								type="number"
								min={0}
								step="0.01"
								value={form.price}
								onChange={onChange}
								className={errors.price ? "border-red-600" : ""}
							/>
							{errors.price && <p className="text-xs text-red-600">{errors.price}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="productUnit">Unit</Label>
							<Input
								id="productUnit"
								name="unit"
								value={form.unit}
								onChange={onChange}
								placeholder="bars"
							/>
						</div>

						<div className="space-y-2 sm:col-span-2">
							<Label htmlFor="productCategory">Category</Label>
							<Input
								id="productCategory"
								name="category"
								value={form.category}
								onChange={onChange}
								placeholder="e.g., Essential Oil"
							/>
						</div>
					</div>
				</div>

				<DialogFooter className="mt-2 gap-2">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={onSave} className="bg-emerald-700 text-white hover:bg-emerald-800">
						Save Product
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

