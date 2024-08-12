import type { formFieldResponse, formResponse } from "@/server/db/schema";
import type { InferSelectModel } from "drizzle-orm";

import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

import { Card, CardContent } from "@/components/ui/card";
import { ShortenedText } from "./ShortenedText";
import { MultipleChoice } from "./questionComponents/MultipleChoice";
import { FileComponent } from "./questionComponents/FileComponent";
import { Text } from "@/components/ui/text";
import { formatTimestamp } from "@/lib/dateFormat";

type FiledResponsesWithFormField = InferSelectModel<
	typeof formFieldResponse
> & {
	formField: {
		fieldName: string;
		fieldType: string;
	};
};

type ResponseWithFieldResponses = InferSelectModel<typeof formResponse> & {
	formFieldResponses: FiledResponsesWithFormField[];
};

export const ResponseView = ({
	response,
}: {
	response: ResponseWithFieldResponses;
}) => {
	return (
		<AccordionItem value={response.id} className="border-none">
			<AccordionTrigger className="bg-gray-300 px-2 rounded-md">
				<div className="flex flex-row w-full justify-between">
					<Text>{response.respondentEmail}</Text>

					<Text size="sm">
						Submitted at: {formatTimestamp(response.submittedTimestamp)}
					</Text>
				</div>
			</AccordionTrigger>
			<AccordionContent className="p-2 border">
				{/* <Card className="h-fit w-full">
						<CardContent> */}
				{response.formFieldResponses.map((fieldResponse) => (
					<div key={fieldResponse.id} className="space-y-1">
						<ShortenedText
							maxLength={50}
							text={fieldResponse.formField.fieldName}
						/>{" "}
						: {fieldResponse.response}
						<MultipleChoice
							response={fieldResponse}
							field={fieldResponse.formField}
						/>
						{fieldResponse.formField.fieldType === "fileUpload" && (
							<FileComponent files={fieldResponse.fileResponse} />
						)}
					</div>
				))}
				{/* </CardContent>
					</Card> */}
			</AccordionContent>
		</AccordionItem>
	);
};
