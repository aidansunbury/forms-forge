"use client";

import { api } from "@/trpc/react";
import React from "react";
import { Header } from "@/components/ui/header";
import { Text } from "@/components/ui/text";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { NewQuestionDialog } from "./_components/NewQuestionDialog";

const QuestionCard = ({ field }: { field: any }) => {
    return (
        <Card key={field.id} variant={"dynamicSize"}>
            <CardHeader>
                <CardTitle>
                    <Text size={"lg"}>{field.fieldName}</Text>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {field.fieldDescription && (
                    <CardDescription>{field.fieldDescription}</CardDescription>
                )}
            </CardContent>
            <CardFooter>
                <p>Field Type: {field.fieldType}</p>
            </CardFooter>
        </Card>
    );
};

const Questions = async ({ params }: { params: { id: string } }) => {
    const [formFields] = api.form.getFormFields.useSuspenseQuery({
        formId: params.id,
    });

    const googleFields = [];
    const customFields = [];

    for (const field of formFields) {
        if (field.isGoogleField) {
            googleFields.push(field);
        } else {
            customFields.push(field);
        }
    }

    return (
        <div className="w-full">
            <Header as="h2" size="h2">
                Questions
            </Header>
            <Header as="h3" size="h3">
                Form Questions
            </Header>
            <div className="space-y-2">
                {formFields.map((field) => (
                    <QuestionCard field={field} key={field.id} />
                ))}
            </div>
            <Header as="h3" size="h3">
                Custom Fields
            </Header>
            <div className="space-y-2">
                {customFields.map((field) => (
                    <QuestionCard field={field} key={field.id} />
                ))}
            </div>
            <Dialog>
                <DialogTrigger>
                    <Button variant={"default"}>Add New Question</Button>
                </DialogTrigger>
                <DialogContent>
                    <NewQuestionDialog formId={params.id} />
                </DialogContent>
            </Dialog>
        </div>
    );
};
export default Questions;
