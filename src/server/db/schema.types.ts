export type FieldOptions =
    | { optionType: "text"; paragraph: boolean }
    | {
          optionType: "multipleChoice";
          type: "radio" | "checkbox";
          options: string[];
      }
    | {
          optionType: "scale";
          low: number;
          high: number;
          lowLabel: string;
          highLabel: string;
      }
    | { optionType: "date"; includeTime: boolean; includeYear: boolean }
    | { optionType: "time"; duration: boolean } // is the question an elapsed time or time of day
    | { optionType: "fileUpload"; folderId: string }
    | {
          optionType: "grid";
          rowQuestion: string; // This is the question title of the individual row in the grid
          grid: {
              columns: {
                  type: "radio" | "checkbox";
                  options: string[];
              };
          };
      };

import { z } from "zod";

const textOption = z.object({
    optionType: z.literal("text"),
    paragraph: z.boolean(),
});

const multipleChoiceOption = z.object({
    optionType: z.literal("multipleChoice"),
    type: z.union([z.literal("radio"), z.literal("checkbox")]),
    options: z.array(z.string()),
});

const scaleOption = z.object({
    optionType: z.literal("scale"),
    low: z.number(),
    high: z.number(),
    lowLabel: z.string(),
    highLabel: z.string(),
});

const dateOption = z.object({
    optionType: z.literal("date"),
    includeTime: z.boolean(),
    includeYear: z.boolean(),
});

const timeOption = z.object({
    optionType: z.literal("time"),
    duration: z.boolean(), // Is the question an elapsed time or time of day
});

const fileUploadOption = z.object({
    optionType: z.literal("fileUpload"),
    folderId: z.string(),
});

const gridOption = z.object({
    optionType: z.literal("grid"),
    rowQuestion: z.string(),
    grid: z.object({
        columns: z.object({
            type: z.union([z.literal("radio"), z.literal("checkbox")]),
            options: z.array(z.string()),
        }),
    }),
});

// Combine all field option types
export const FieldOptionsValidator = z.union([
    textOption,
    multipleChoiceOption,
    scaleOption,
    dateOption,
    timeOption,
    fileUploadOption,
    gridOption,
]);

// You can now use FieldOptionsValidator to validate the FieldOptions type

export type FileResponseType = {
    fileId: string;
    fileName: string;
    mimeType: string;
};
