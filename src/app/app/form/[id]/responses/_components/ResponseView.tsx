import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

import { Text } from "@/components/ui/text";
import { formatTimestamp } from "@/lib/dateFormat";
import { QuestionDiscriminator } from "./QuestionDescriminator/QuestionDiscriminator";
import type { FormResponseWithFieldResponses } from "./responses.types";

export const ResponseView = ({
	response,
}: {
	response: FormResponseWithFieldResponses;
}) => {
	const ComponentArray: React.ReactNode[] = [];
	for (let i = 0; i < response.formFieldResponses.length; i++) {
		const field = response.formFieldResponses[i];
		if (!field) {
			continue;
		}

		if (field.formField.fieldType === "grid") {
			continue;
			// Todo: Implement grid display
		}
		ComponentArray.push(
			<QuestionDiscriminator question={field} index={i} key={field.id} />,
		);
	}

	return (
		<AccordionItem value={response.id} className="border-none">
			<AccordionTrigger className="rounded-md bg-gray-200 px-2">
				<div className="flex w-full flex-row justify-between">
					<Text>{response.respondentEmail}</Text>

					<Text size="sm">
						Submitted at: {formatTimestamp(response.submittedTimestamp)}
					</Text>
				</div>
			</AccordionTrigger>
			<AccordionContent className="border p-2">
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
					{ComponentArray}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};
