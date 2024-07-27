"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { Circle, X } from "lucide-react";

import { useFieldArray } from "react-hook-form";

import { formFields } from "@/server/db/schema";
import { type InferSelectModel } from "drizzle-orm";
import { Control, Path, useFormContext } from "react-hook-form";

import { FormData } from "../FormViewer";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { multiSelectFieldOptions, fieldOptions } from "@/lib/validators";

type MultipleChoiceProps = {
  control: Control<FormData, any>;
  name: Path<FormData>;
  field: InferSelectModel<typeof formFields>;
};

export const MultipleChoice = ({
  control,
  name,
  field,
}: MultipleChoiceProps) => {
  // Ensure that data is parsed correctly
  fieldOptions.parse(field.fieldOptions);

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${name}.fieldOptions.options` as any,
  });

  if (fields.length === 0) {
    append({ label: "New Option", positionIndex: 0 });
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Todo this needs some position indexing when we get to moving them around
      append({ label: "New Option" });
      //   e.currentTarget.value = "";
    } else if (e.key === "Backspace" && e.currentTarget.value === "") {
      e.preventDefault();
      if (fields.length === 1) return;
      remove(index);
    }
  };

  const lastInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (lastInputRef.current) {
      lastInputRef.current.focus();
    }
  }, [fields]);

  return (
    <>
      {/* {JSON.stringify(field.fieldOptions.options)} */}
      {fields.map((option, index) => (
        <div className="flex flex-row items-center" key={option.id}>
          <Circle size={24} />
          <FormField
            control={control}
            name={`${name}.fieldOptions.options.${index}.label` as any}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    {...field}
                    ref={index === fields.length - 1 ? lastInputRef : null}
                    className="focus-ring-0 m-1 h-12 rounded-none border-0 border-b-2 border-solid outline-none hover:border-gray-900 focus-visible:ring-0"
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            variant="ghost"
            className="m-1"
            size="iconWrap"
            onClick={() => remove(index)}
          >
            <X size={24} />
          </Button>
        </div>
      ))}
      {/* Add option */}
    </>
  );
};
