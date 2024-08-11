// Ensures consistent heading styles across the app

import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

export interface HeadingProps
	extends React.HTMLAttributes<HTMLHeadingElement>,
		VariantProps<typeof heading> {
	as?: "h1" | "h2" | "h3" | "h4";
	size?: "h1" | "h2" | "h3" | "h4";
}

const heading = cva("font-bold text-gray-900 dark:text-gray-100", {
	variants: {
		size: {
			h1: "mb-6 text-2xl font-semibold md:text-3xl lg:text-4xl",
			h2: "mb-4 text-xl font-semibold md:text-2xl lg:text-3xl",
			h3: "mb-2 text-lg font-medium md:text-xl lg:text-2xl",
			h4: "mb-1 text-base font-medium md:text-lg lg:text-xl",
		},
	},
	defaultVariants: {
		size: "h2",
	},
});

export function Header({
	as: Component = "h2",
	size,
	className,
	children,
	...props
}: HeadingProps) {
	return (
		<Component className={cn(heading({ size, className }))} {...props}>
			{children}
		</Component>
	);
}
