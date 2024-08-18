// Icon style variants to be allied to lucide-react icons
import { cva } from "class-variance-authority";

export const iconVariants = cva("text-primary", {
    variants: {
        size: {
            small: "h-4 w-4",
            medium: "h-6 w-6",
            large: "h-8 w-8",
        },
    },
    defaultVariants: {
        size: "medium",
    },
});
