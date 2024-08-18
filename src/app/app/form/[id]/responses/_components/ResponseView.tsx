import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

import { Text } from "@/components/ui/text";
import { formatTimestamp } from "@/lib/dateFormat";
import { QuestionDiscriminator } from "./QuestionDescriminator/QuestionDiscriminator";
import { GridDisplay } from "./ResponseDisplays/GridDisplay";
import type {
	FieldResponsesWithFormField,
	FormResponseWithFieldResponses,
} from "./responses.types";

export const ResponseView = ({
	response,
}: {
	response: FormResponseWithFieldResponses;
}) => {
	const ComponentArray: React.ReactNode[] = [];

	let currentGridIndex: null | number = null;
	let gridResponses: FieldResponsesWithFormField[] = [];

	for (let i = 0; i < response.formFieldResponses.length; i++) {
		const field = response.formFieldResponses[i];
		if (!field) {
			continue;
		}

		// Handles three cases, grid -> non-grid, grid -> grid, grid -> end
		if (
			currentGridIndex !== null &&
			field.parentPositionIndex !== currentGridIndex
		) {
			ComponentArray.push(
				<GridDisplay responses={gridResponses} index={i} key={field.id} />,
			);
			gridResponses = [];
			currentGridIndex = null;
		}

		if (field.formField.fieldType === "grid") {
			currentGridIndex = field.parentPositionIndex;
			gridResponses.push(field);
		} else {
			if (gridResponses.length > 0) {
				ComponentArray.push(
					<GridDisplay responses={gridResponses} index={i} key={field.id} />,
				);
				gridResponses = [];
				currentGridIndex = null;
			}
			ComponentArray.push(
				<QuestionDiscriminator question={field} index={i} key={field.id} />,
			);
		}

		// Special check for if the grid is the last question
		if (
			i === response.formFieldResponses.length - 1 &&
			gridResponses.length > 0
		) {
			ComponentArray.push(
				<GridDisplay responses={gridResponses} index={i} key={field.id} />,
			);
		}
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
