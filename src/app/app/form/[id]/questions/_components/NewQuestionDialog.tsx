"use client";

import { useForm, type SubmitHandler, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { api } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { FieldOptions } from "@/server/db/schema.types";
import { createFormFieldValidator } from "@/server/api/routers/field/fieldValidators";
import { fieldOptions } from "@/server/db/schema";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { Checkbox } from "@/components/ui/checkbox";

export const NewQuestionDialog = ({ formId }: { formId: string }) => {
    type NewQuestionType = z.infer<typeof createFormFieldValidator>;

    const form = useForm<NewQuestionType>({
        resolver: zodResolver(createFormFieldValidator),
        defaultValues: {
            formId,
        },
    });

    const { handleSubmit, control, watch, setValue } = form;

    const {
        fields: multipleChoiceOptions,
        append,
        remove,
    } = useFieldArray({
        control: control,
        name: "fieldOptions.options",
    });

    const { mutate } = api.field.createField.useMutation();

    const onSubmit = async (values: NewQuestionType) => {
        console.log("success");
        console.log(values);
    };

    const onError = (error: any) => {
        console.log("error");
        console.log(error);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Field</DialogTitle>
                <DialogDescription>
                    This field will not be visible to form respondents, only
                    those who have access on FormsForge. It will allow you to
                    manually augment the data your respondents provide.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form
                    onSubmit={handleSubmit(onSubmit, onError)}
                    className="w-2/3 space-y-6"
                >
                    <FormField
                        control={control}
                        name="fieldName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Field Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Status" {...field} />
                                </FormControl>
                                <FormDescription>
                                    You may change this later
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="fieldType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Field Type</FormLabel>
                                <Select
                                    onValueChange={(e) => {
                                        // Todo add typing
                                        field.onChange(e);
                                        setValue("fieldOptions.optionType", e);
                                    }}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a field type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {/* // Todo add more types later */}
                                        <SelectItem value={"text"}>
                                            Text Field
                                        </SelectItem>
                                        <SelectItem value={"multipleChoice"}>
                                            Multiple Choice Field
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Field types may not be changed after
                                    creation
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {watch("fieldType") === "multipleChoice" && (
                        <>
                            <FormField
                                control={control}
                                name="fieldOptions.type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Selection Type</FormLabel>
                                        <Select onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a field type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {["radio", "checkbox"].map(
                                                    (option) => (
                                                        <SelectItem
                                                            key={option}
                                                            value={option}
                                                        >
                                                            {option === "radio"
                                                                ? "Single Choice"
                                                                : "Multiple Choice"}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Multiple choice fields may allow for
                                            single or multiple selections.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Text size={"lg"}>
                                Options:{" "}
                                <Text as={"span"} size={"sm"}>
                                    {" "}
                                    You may add more options after creating the
                                    field
                                </Text>
                            </Text>

                            {multipleChoiceOptions.map((option, index) => (
                                <FormField
                                    key={option.id}
                                    control={control}
                                    name={`fieldOptions.options.${index}`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Option {index + 1}
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}

                            <Button
                                onClick={() =>
                                    append(
                                        `Option${multipleChoiceOptions.length + 1}`,
                                    )
                                }
                                type="button"
                            >
                                Add Option
                            </Button>
                        </>
                    )}

                    {watch("fieldType") === "text" && (
                        <FormField
                            control={control}
                            name="fieldOptions.paragraph"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Paragraph Style Input
                                        </FormLabel>
                                        <FormDescription>
                                            Allow for multi-line text input
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                    )}

                    <Button type="submit">Submit</Button>
                </form>
            </Form>
            {JSON.stringify(form.watch(), null, 2)}
        </DialogContent>
    );
};
