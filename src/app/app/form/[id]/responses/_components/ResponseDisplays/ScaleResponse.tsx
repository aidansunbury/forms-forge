import { iconVariants } from "@/components/ui/icon";
import { Circle, CircleCheckBig } from "lucide-react";
// biome-ignore lint/style/useImportType: <explanation>
import React from "react";
import type { FieldResponsesWithFormField } from "../responses.types";

const NumberAboveWrapper = ({
	number,
	children,
}: { number: number; children: React.ReactNode }) => (
	<div>
		<div className="flex justify-center">{children}</div>
		<div className="flex justify-center">{number}</div>
	</div>
);

export const ScaleResponse = ({
	response,
}: { response: FieldResponsesWithFormField }) => {
	const responseOptions = response.formField.fieldOptions;

	if (responseOptions.optionType !== "scale") {
		return null;
	}
	const renderRadioButtons = () => {
		const iconsWithWrapper: React.ReactNode[] = [];
		for (let i = responseOptions.low; i <= responseOptions.high; i++) {
			if (response.response?.includes(i.toString())) {
				iconsWithWrapper.push(
					<NumberAboveWrapper key={i} number={i}>
						<CircleCheckBig className={iconVariants({ size: "large" })} />
					</NumberAboveWrapper>,
				);
			} else {
				iconsWithWrapper.push(
					<NumberAboveWrapper key={i} number={i}>
						<Circle key={i} className={iconVariants({ size: "large" })} />
					</NumberAboveWrapper>,
				);
			}
		}
		return iconsWithWrapper;
	};

	return (
		<div className="flex flex-row">
			<span>{responseOptions.lowLabel}</span>
			{renderRadioButtons()}
			<span>{responseOptions.highLabel}</span>
		</div>
	);
};
