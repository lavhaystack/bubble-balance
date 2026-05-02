"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddProductButtonProps extends ButtonProps {
  onClick?: () => void;
  showIcon?: boolean;
}

/**
 * By default, clicking the button redirects to the Inventory page 
 */
export function AddProductButton({ 
  onClick, 
  className, 
  showIcon = true,
  children,
  ...props 
}: AddProductButtonProps) {
  const router = useRouter();

  const handleDefaultClick = () => {
    router.push("/dashboard/inventory?add=true");
  };

  return (
    <Button
      onClick={onClick || handleDefaultClick}
      className={cn("bg-emerald-700 text-white hover:bg-emerald-800", className)}
      {...props}
    >
      {showIcon && <Plus className="mr-2 h-4 w-4" />}
      {children || "Add Product"}
    </Button>
  );
}
