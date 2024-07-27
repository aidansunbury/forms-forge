"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";

import { form, formFields, formSections } from "@/server/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { InputWrapper } from "./InputWrapper";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Section } from "./Section";
import { Button } from "@/components/ui/button";

import {
  SelectedItemProvider,
  useSelectedItem,
} from "@/app/hooks/useSelectedItem";
import { Toolbar } from "./Toolbar";

// Complete form selection type
export type FormData = InferSelectModel<typeof form> & {
  sections: Array<
    InferSelectModel<typeof formSections> & {
      fields: InferSelectModel<typeof formFields>[];
    }
  >;
};

export const FormViewer = ({ formData }: { formData: FormData }) => {
  const form = useForm<FormData>({
    defaultValues: formData,
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "sections",
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <div className="w-full max-w-[800px] self-center">
      <SelectedItemProvider>
        <Toolbar />
        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card id="field-title">
                <CardContent className="pt-2">
                  <FormField
                    control={form.control}
                    name="formName"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormControl>
                          <Input
                            placeholder="New Form"
                            className="h-12 px-0 text-2xl"
                            variant={"baseline"}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="formDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Description"
                            className="h-8 border-b px-0 hover:border-gray-600"
                            variant={"baseline"}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <div>
                {fields.map((section, index) => (
                  <Section
                    key={section.id}
                    section={section}
                    control={form.control}
                    index={index}
                  />
                ))}
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </SelectedItemProvider>
    </div>
  );
};
