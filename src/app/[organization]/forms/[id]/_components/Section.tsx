import { form, formFields, formSections } from "@/server/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { useFieldArray } from "react-hook-form";
import { Control } from "react-hook-form";
import { FormData } from "./FormViewer";
import { InputWrapper } from "./InputWrapper";
import { CONSTANTS } from "@/lib/constants";

type Section = InferSelectModel<typeof formSections> & {
  fields: InferSelectModel<typeof formFields>[];
};

export const Section = ({
  section,
  control,
  index,
}: {
  section: Section;
  control: Control<FormData, any>;
  index: number;
}) => {
  const fields = useFieldArray({
    control: control,
    name: `sections.${index}.fields`,
  });

  // Append a new field to the section, index it between fields it is between
  // And assign a temporary id to indicate to the server that it is a new field
  const handleCopy = (
    field: (typeof section.fields)[number],
    index: number,
  ) => {
    const priorField = section.fields[index];
    const nextField = section.fields[index + 1] || null;
    let newPositionIndex = 0;
    if (!priorField) {
      // lol
    } else if (!nextField) {
      newPositionIndex =
        priorField.positionIndex + CONSTANTS.FORM_POSITION_INCREMENT;
    } else {
      newPositionIndex =
        (priorField.positionIndex + nextField.positionIndex) / 2;
    }
    fields.append({
      ...field,
      id: `temp-${Math.random()}`,
      positionIndex: newPositionIndex,
    });
  };

  return (
    <div>
      <h1 className="pb-5">{section.sectionName}</h1>
      {fields.fields.map((field, fieldIndex) => (
        <>
          {/* <div>{JSON.stringify(field)}</div> */}
          <InputWrapper
            name={`sections.${index}.fields.${fieldIndex}`}
            control={control}
            field={field}
            key={field.id}
            onDelete={() => fields.remove(fieldIndex)}
            onCopy={() => handleCopy(field, fieldIndex)}
          />
        </>
      ))}
    </div>
  );
};
