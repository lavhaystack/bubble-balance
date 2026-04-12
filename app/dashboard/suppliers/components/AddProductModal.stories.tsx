import type { Meta, StoryObj } from "@storybook/react";

import AddProductModal from "./AddProductModal";

const meta: Meta<typeof AddProductModal> = {
	title: "Suppliers/AddProductModal",
	component: AddProductModal,
};

export default meta;

type Story = StoryObj<typeof AddProductModal>;

export const Default: Story = {
	args: {
		open: true,
		form: {
			name: "Lavender Essential Oil Soap",
			price: "3.50",
			category: "Bath & Body",
			unit: "bars",
		},
		errors: {},
		onClose: () => undefined,
		onChange: () => undefined,
		onSave: () => undefined,
	},
};

export const WithValidationErrors: Story = {
	args: {
		open: true,
		form: {
			name: "",
			price: "",
			category: "",
			unit: "bars",
		},
		errors: {
			name: "this field is required",
			price: "this field is required",
		},
		onClose: () => undefined,
		onChange: () => undefined,
		onSave: () => undefined,
	},
};

export const EditMode: Story = {
	args: {
		open: true,
		title: "Edit Supplier Product",
		description: "Update supplier product details.",
		submitLabel: "Save Changes",
		form: {
			name: "Charcoal Detox Soap",
			price: "4.00",
			category: "Bath & Body",
			unit: "pcs",
		},
		errors: {},
		onClose: () => undefined,
		onChange: () => undefined,
		onSave: () => undefined,
	},
};

export const Closed: Story = {
	args: {
		open: false,
		form: {
			name: "",
			price: "",
			category: "",
			unit: "bars",
		},
		errors: {},
		onClose: () => undefined,
		onChange: () => undefined,
		onSave: () => undefined,
	},
};
