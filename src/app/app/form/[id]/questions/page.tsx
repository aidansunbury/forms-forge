"use client";

import React from "react";
import { api } from "@/trpc/react";

const Questions = async ({ params }: { params: { id: string } }) => {
  const form = await api.form.getFormByFields.useSuspenseQuery({
    formId: params.id,
  });

  return (
    <div>
      <h1>Questions </h1>
    </div>
  );
};
export default Questions;
