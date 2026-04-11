"use client";

import { Fragment } from "react";
import { ChevronDown, ChevronRight, MoreVertical, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { SupplierRecord } from "@/lib/suppliers-store";

type SupplierTableProps = {
	rows: SupplierRecord[];
	expandedIds: Record<string, boolean>;
	onToggleExpanded: (supplierId: string) => void;
	onOpenAddProductModal: (supplierId: string) => void;
};

export default function SupplierTable({
	rows,
	expandedIds,
	onToggleExpanded,
	onOpenAddProductModal,
}: SupplierTableProps) {
	return (
		<div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
			<Table>
				<TableHeader>
					<TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
						<TableHead className="w-[30px]" />
						<TableHead>Supplier Name</TableHead>
						<TableHead>Contact Person</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Phone</TableHead>
						<TableHead>Products</TableHead>
						<TableHead className="w-[40px]" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((supplier) => {
						const isExpanded = Boolean(expandedIds[supplier.id]);

						return (
							<Fragment key={supplier.id}>
								<TableRow>
									<TableCell>
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7"
											onClick={() => onToggleExpanded(supplier.id)}
											aria-label={isExpanded ? "Collapse supplier" : "Expand supplier"}
										>
											{isExpanded ? (
												<ChevronDown className="h-4 w-4" />
											) : (
												<ChevronRight className="h-4 w-4" />
											)}
										</Button>
									</TableCell>
									<TableCell className="font-semibold text-slate-900">{supplier.name}</TableCell>
									<TableCell>{supplier.contactPerson}</TableCell>
									<TableCell>{supplier.email}</TableCell>
									<TableCell>{supplier.phone}</TableCell>
									<TableCell className="text-muted-foreground">
										{supplier.products.length} product{supplier.products.length === 1 ? "" : "s"}
									</TableCell>
									<TableCell>
										<Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
											<MoreVertical className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>

								{isExpanded && (
									<TableRow>
										<TableCell colSpan={7} className="bg-slate-50/70 py-4">
											<p className="mb-3 text-sm font-semibold text-slate-900">
												Products from this Supplier
											</p>
											{supplier.products.length === 0 ? (
												<p className="text-sm text-muted-foreground">No products listed yet.</p>
											) : (
												<div className="space-y-1">
													{supplier.products.map((product) => (
														<div
															key={`${supplier.id}-${product.name}`}
															className="flex items-center justify-between rounded-md px-3 py-2 text-sm"
														>
															<span>{product.name}</span>
															<div className="flex items-center gap-3">
																<span className="font-medium">P{product.price.toFixed(2)}</span>
																<MoreVertical className="h-4 w-4 text-muted-foreground" />
															</div>
														</div>
													))}
												</div>
											)}

											<div className="mt-3">
												<Button
													variant="outline"
													size="sm"
													onClick={() => onOpenAddProductModal(supplier.id)}
												>
													<Plus className="h-3.5 w-3.5" />
													Add Product to Supplier
												</Button>
											</div>
										</TableCell>
									</TableRow>
								)}
							</Fragment>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}

