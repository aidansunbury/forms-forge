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
			<AccordionTrigger className="bg-gray-200 px-2 rounded-md">
				<div className="flex flex-row w-full justify-between">
					<Text>{response.respondentEmail}</Text>

					<Text size="sm">
						Submitted at: {formatTimestamp(response.submittedTimestamp)}
					</Text>
				</div>
			</AccordionTrigger>
			<AccordionContent className="p-2 border">
				<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
					{ComponentArray}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};
