import type { formFieldResponse, formFields } from "@/server/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { ShortenedText } from "../../../../../../../components/ShortenedText";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";

// Todo consider displaying all options, then highlighting the selected ones
export const MultipleChoiceResponse = ({
	response,
	field,
}: {
	response: InferSelectModel<typeof formFieldResponse>;
	field: InferSelectModel<typeof formFields>;
}) => {
	if (field.fieldOptions.optionType !== "multipleChoice") {
		return null;
	}

	return (
		<div className="flex flex-row items-center flex-wrap">
			{field.fieldOptions.options
				.filter((option) => response.response?.includes(option))
				.map((option) => (
					<Badge variant="accent" className="mr-1 mb-1" key={option}>
						<ShortenedText
							text={option}
							maxLength={40}
							TextWrapper={({ children }) => (
								<Text size="smDark">{children}</Text>
							)}
						/>
					</Badge>
				))}
		</div>
	);
};
