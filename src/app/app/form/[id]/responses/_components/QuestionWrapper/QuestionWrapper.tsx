import { ShortenedText } from "@/components/ShortenedText";
import clsx from "clsx";
// Wraps the question
// Takes children to render responses
import type React from "react";

type BlockSize = "small" | "medium" | "large";

const getMaxTextLength = (size: BlockSize) => {
	switch (size) {
		case "small":
			return 40;
		case "medium":
			return 80;
		case "large":
			return 160;
	}
};

type QuestionWrapperProps = {
	children: React.ReactNode;
	size: BlockSize;
	index: number;
	questionText: string;
};

export const QuestionWrapper: React.FC<QuestionWrapperProps> = ({
	children,
	size,
	index,
	questionText: question,
}) => {
	return (
		<div
			className={clsx("rounded-md bg-gray-100 p-1", {
				"col-span-1": size === "small",
				"col-span-1 lg:col-span-2": size === "medium",
				"col-span-1 lg:col-span-2 xl:col-span-4": size === "large",
			})}
		>
			<ShortenedText
				maxLength={getMaxTextLength(size)}
				text={`${index + 1} ${question}`}
			/>
			<div className="px-1">{children}</div>
		</div>
	);
};
