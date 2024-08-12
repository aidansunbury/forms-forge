// Wraps the question
// Takes children to render responses
import type React from "react";
import { ShortenedText } from "@/components/ShortenedText";
import clsx from "clsx";

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
			className={clsx("bg-gray-100 rounded-md p-1", {
				"col-span-1": size === "small",
				"lg:col-span-2 col-span-1": size === "medium",
				"xl:col-span-4 lg:col-span-2 col-span-1": size === "large",
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
