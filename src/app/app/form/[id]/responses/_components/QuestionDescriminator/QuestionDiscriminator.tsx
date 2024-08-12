import { Text } from "@/components/ui/text";
// Based on the question type and the response, determine what response display to show to show and how many grid columns to take up
import type React from "react";
import { QuestionWrapper } from "../QuestionWrapper/QuestionWrapper";
import { FileResponse } from "../ResponseDisplays/FileResponse";
import { MultipleChoiceResponse } from "../ResponseDisplays/MultipleChoiceResponse";
import type {
	BlockSize,
	FieldResponsesWithFormField,
} from "../responses.types";

export const QuestionDiscriminator = ({
	question,
	index,
}: { question: FieldResponsesWithFormField; index: number }) => {
	// Represents col span 1, 2, 4
	let size: BlockSize = "small";
	let AnswerDisplay: React.ReactNode = null;

	if (question.formField.fieldType === "fileUpload") {
		AnswerDisplay = <FileResponse files={question.fileResponse || []} />;
	} else if (question.formField.fieldType === "text") {
		const responseText = question?.response[0] as string;
		if (responseText.length > 100) {
			size = "medium";
		}
		if (responseText.length > 300) {
			size = "large";
		}

		AnswerDisplay = (
			<Text className="" size="lg">
				{question.response}
			</Text>
		);
	} else if (question.formField.fieldOptions.optionType === "multipleChoice") {
		if (question.response.length >= 3) {
			size = "medium";
		}
		if (question.response.length >= 5) {
			size = "large";
		}
		AnswerDisplay = (
			<MultipleChoiceResponse response={question} field={question.formField} />
		);
	}
	return (
		<QuestionWrapper
			size={size}
			index={index}
			questionText={question.formField.fieldName}
		>
			{AnswerDisplay}
		</QuestionWrapper>
	);
};
