"use client";

import { useState } from "react";

import { api } from "@/trpc/react";

export function LatestPost() {
  const { data: post } = api.post.getSecretMessage.useQuery();

  return (
    <div>
      <h1>Latest Post</h1>
      <p>{post}</p>
    </div>
  );
}
