"use client";

import React, { useState } from "react";
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

import { Trash2, Copy } from "lucide-react";

import { formFields } from "@/server/db/schema";
import { is, type InferSelectModel } from "drizzle-orm";
import { Control, Path, useFormContext } from "react-hook-form";
import { FormData } from "./FormViewer";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { MultipleChoice } from "./InputComponents/MultipleChoice";
import { TextInput } from "./InputComponents/TextInput";
import { useSelectedItem } from "@/app/hooks/useSelectedItem";

type InputWrapperProps = {
  control: Control<FormData, any>;
  name: Path<FormData>;
  field: InferSelectModel<typeof formFields>;
  onDelete?: () => void;
  onCopy?: () => void;
};

export const InputWrapper = ({
  control,
  name,
  field,
  onDelete,
  onCopy,
}: InputWrapperProps) => {
  const { watch } = useFormContext<FormData>();
  const { setSelectedItemId, isSelected } = useSelectedItem();
  function renderInput(fieldType: string) {
    switch (fieldType) {
      case "text":
        return <TextInput />;
      case "multipleChoice":
        return <MultipleChoice control={control} name={name} field={field} />;
    }
  }

  return (
    <Card
      className="mb-5"
      id={`field-${field.id}`}
      variant={isSelected(`field-${field.id}`) ? "selected" : "default"}
      onClick={() => {
        setSelectedItemId(`field-${field.id}`);
      }}
    >
      <CardHeader className="flex flex-1 flex-row space-x-5">
        <div className="mt-1 basis-full">
          <FormField
            control={control}
            name={`${name}.fieldName` as any}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Question"
                    variant={"baseline"}
                    className="bg-gray-50 hover:bg-gray-100"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* <Separator orientation="vertical" /> */}
        {isSelected(`field-${field.id}`) && (
          <FormField
            control={control}
            name={`${name}.fieldType` as any}
            render={({ field }) => (
              <FormItem className="basis-1/3">
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="mb-1 h-12">
                      <SelectValue placeholder="Select Question Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="multipleChoice">
                      Multiple Choice
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardHeader>
      <CardContent>
        {renderInput(watch(`${name}.fieldType` as any))}
      </CardContent>
      <Separator />
      {isSelected(`field-${field.id}`) && (
        <CardFooter className="flex-row justify-end space-x-1 py-3">
          <Button variant="ghost" onClick={onDelete}>
            <Trash2 size={20} />
          </Button>
          <Button variant="ghost" onClick={onCopy}>
            <Copy size={20} />
          </Button>

          <div className="flex flex-row space-x-2">
            <FormField
              control={control}
              name={`${name}.required` as any}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <span>Required</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
