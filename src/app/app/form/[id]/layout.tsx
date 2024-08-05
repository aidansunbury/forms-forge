"use client";

import React from "react";
import { api } from "@/trpc/react";
import { FormNav } from "./_components/FormNav/FormNav";
import { getEditFormUrl } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { Link } from "next/link";

export default function FormLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { id: string };
}>) {
  const [form] = api.form.getForm.useSuspenseQuery({ formId: params.id });

  return (
    <div className="flex w-full flex-col items-center">
      <h1>{form.formName}</h1>
      <a href={getEditFormUrl(form.googleFormId)}>
        <Pencil size={24} />
      </a>
      {/* <h2>{form.formDescription}</h2> */}
      <FormNav />
      {params.id}
      {children}
    </div>
  );
}
