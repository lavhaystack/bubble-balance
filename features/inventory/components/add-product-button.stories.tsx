import type { Meta, StoryObj } from "@storybook/react";

import AddProductButton from "./add-product-button";

const meta: Meta<typeof AddProductButton> = {
	title: "Inventory/AddProductButton",
	component: AddProductButton,
};

export default meta;

type Story = StoryObj<typeof AddProductButton>;

export const Default: Story = {
	args: {
		onClick: () => undefined,
	},
};

export const WithoutHandler: Story = {
	args: {},
};

export const WithClickHandler: Story = {
	args: {
		onClick: () => {
			console.log("Add product clicked");
		},
	},
};

export const Small: Story = {
	args: {
		size: "sm",
		onClick: () => undefined,
	},
};

export const Large: Story = {
	args: {
		size: "lg",
		onClick: () => undefined,
	},
};

export const FullWidth: Story = {
	args: {
		fullWidth: true,
		onClick: () => undefined,
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
		onClick: () => undefined,
	},
};
