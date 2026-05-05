import { Button } from "@/components/ui/button";

type AddProductButtonProps = {
	onClick?: () => void;
	disabled?: boolean;
	size?: "sm" | "default" | "lg";
	fullWidth?: boolean;
};

export default function AddProductButton({
	onClick,
	disabled = false,
	size = "default",
	fullWidth = false,
}: AddProductButtonProps) {
	const className = [
		"bg-emerald-700 text-white hover:bg-emerald-800",
		fullWidth ? "w-full" : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<Button
			onClick={onClick}
			disabled={disabled}
			size={size}
			className={className}
		>
			Add Product
		</Button>
	);
}
