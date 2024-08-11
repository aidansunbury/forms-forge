import type { FieldOptions } from "@/server/db/schema";

export type SimplifiedQuestionType =
	| "text"
	| "multipleChoice"
	| "grid"
	| "scale"
	| "date"
	| "time"
	| "fileUpload";

export type TypeAndOptions = {
	type: SimplifiedQuestionType;
	options: any;
};

export function getQuestionTypeAndData(question: object): TypeAndOptions {
	if ("choiceQuestion" in question) {
		return { type: "multipleChoice", options: question.choiceQuestion };
	}
	if ("textQuestion" in question) {
		return { type: "text", options: question.textQuestion };
	}
	if ("scaleQuestion" in question) {
		return { type: "scale", options: question.scaleQuestion };
	}
	if ("dateQuestion" in question) {
		return { type: "date", options: question.dateQuestion };
	}
	if ("timeQuestion" in question) {
		return { type: "time", options: question.timeQuestion };
	}
	if ("fileUploadQuestion" in question) {
		return { type: "fileUpload", options: question.fileUploadQuestion };
	}

	// Todo remove this line in prod
	throw new Error("Unknown question type");
}

export function getQuestionOptions(
	type: SimplifiedQuestionType,
	data: any,
): FieldOptions {
	if (type === "text") {
		console.log(data);
		return {
			optionType: "text",
			paragraph: data.paragraph ?? false,
		};
	}
	if (type === "multipleChoice") {
		return {
			optionType: "multipleChoice",
			type: data.type,
			options: data.options.map((option: any) => option.value),
		};
	}
	if (type === "fileUpload") {
		return {
			optionType: "fileUpload",
			folderId: data.folderId,
		};
	}
	if (type === "scale") {
		return {
			optionType: "scale",
			low: data.low,
			high: data.high,
			lowLabel: data.lowLabel,
			highLabel: data.highLabel,
		};
	}
	if (type === "date") {
		return {
			optionType: "date",
			includeTime: data.includeTime,
			includeYear: data.includeYear,
		};
	}
	if (type === "time") {
		return {
			optionType: "time",
			duration: data.duration ?? false,
		};
	}

	throw new Error("Unknown question type");
}
