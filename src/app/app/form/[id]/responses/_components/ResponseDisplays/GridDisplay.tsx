import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Circle, CircleCheckBig } from "lucide-react";
import { QuestionWrapper } from "../QuestionWrapper/QuestionWrapper";
import type { FieldResponsesWithFormField } from "../responses.types";

export const GridDisplay = ({
	responses,
	index,
}: { responses: FieldResponsesWithFormField[]; index: number }) => {
	const sortedResponses = responses.sort(
		(a, b) => a.formField.positionSubIndex - b.formField.positionSubIndex,
	);

	const firstColumn = sortedResponses[0];
	if (
		!firstColumn ||
		firstColumn.formField.fieldOptions.optionType !== "grid"
	) {
		return null;
	}

	const columnOptions = firstColumn.formField.fieldOptions.grid.columns.options;

	return (
		<QuestionWrapper
			size="large"
			index={index}
			questionText={firstColumn.formField.fieldName}
		>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[200px]">Skill</TableHead>
						{columnOptions.map((option, index) => (
							<TableHead key={option} className="text-center">
								{option}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedResponses.map((response) => (
						<TableRow key={response.id}>
							<TableCell className="font-medium">
								{response.formField.fieldOptions.rowQuestion}
							</TableCell>
							{columnOptions.map((option, index) => (
								<TableCell key={option} className="text-center">
									<div className="flex justify-center">
										{response.response?.includes(option) ? (
											<CircleCheckBig className="h-4 w-4 text-primary" />
										) : (
											<Circle className="h-4 w-4 text-primary" />
										)}
									</div>
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</QuestionWrapper>
	);
};
