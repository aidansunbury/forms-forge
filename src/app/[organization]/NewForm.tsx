"use client";
import { useState } from "react";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export const NewForm = ({
  orgId,
  orgSlug,
}: {
  orgId: string;
  orgSlug: string;
}) => {
  const router = useRouter();
  const utils = api.useUtils();
  const createFromMutation = api.form.create.useMutation();
  const handleNewForm = async () => {
    console.log("Creating new form");
    const NewForm = await createFromMutation.mutateAsync({
      orgId: orgId,
    });
    await utils.org.getOrgWithForms.invalidate();
    router.push(`/${orgSlug}/forms/${NewForm.id}`);
  };
  return (
    <Button
      onClick={() => handleNewForm()}
      variant={"wrap"}
      size={"wrap"}
      disabled={createFromMutation.isPending}
    >
      <Card className="m-1 h-48 w-64">
        <CardHeader>
          <CardTitle>Create New Form</CardTitle>
          {/* <CardDescription>{form.formDescription}</CardDescription> */}
        </CardHeader>
        <CardContent>
          <PlusIcon className="size-12" />
        </CardContent>
      </Card>
    </Button>
  );
};
