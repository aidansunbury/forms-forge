// Ensure consistent text styles across the app

import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

export interface TextProps
	extends React.HTMLAttributes<HTMLParagraphElement>,
		VariantProps<typeof text> {
	as?: "p" | "span" | "div";
	size?: "sm" | "base" | "lg" | "light" | "xs";
}

const text = cva("leading-relaxed", {
	variants: {
		size: {
			xs: "text-xs font-light text-gray-600",
			sm: "text-sm font-normal text-gray-600",
			light: "text-base font-normal text-gray-600",
			base: "text-base font-medium text-gray-900",
			lg: "text-lg font-medium text-gray-900",
		},
	},
	defaultVariants: {
		size: "base",
	},
});

export function Text({
	as: Component = "p",
	size,
	className,
	children,
	...props
}: TextProps) {
	return (
		<Component className={cn(text({ size, className }))} {...props}>
			{children}
		</Component>
	);
}
