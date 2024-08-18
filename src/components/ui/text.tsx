// Ensure consistent text styles across the app

import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

export interface TextProps
    extends React.HTMLAttributes<HTMLParagraphElement>,
        VariantProps<typeof text> {
    as?: "p" | "span" | "div";
}

const text = cva("leading-relaxed", {
    variants: {
        size: {
            xs: "font-light text-gray-600 text-xs",
            sm: "font-normal text-gray-600 text-sm",
            smDark: "font-normal text-gray-900 text-sm",
            light: "font-normal text-base text-gray-600",
            base: "font-medium text-base text-gray-900",
            lg: "font-medium text-gray-900 text-lg",
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
