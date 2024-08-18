"use client";

import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/use-toast";
import { getEditFormUrl } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Pencil, RefreshCcw } from "lucide-react";
import type React from "react";
import { FormNav } from "./_components/FormNav/FormNav";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export default function FormLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: { id: string };
}>) {
	const utils = api.useUtils();

	const [form] = api.form.getFormWithViews.useSuspenseQuery({
		formId: params.id,
	});
	const { toast } = useToast();

	const { mutate: syncForm, isPending } = api.form.syncForm.useMutation({
		onSuccess: () => {
			toast({
				variant: "success",
				title: "Success",
				description: "Form synced successfully",
			});
			utils.form.getFormByResponses.invalidate({ formId: params.id });
		},
		onError: (error) => {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to sync form",
			});
		},
	});

	return (
		<div className="flex w-full flex-col items-center">
			<div className="flex flex-row self-start">
				<Header className="mt-2" as="h1" size="h1">
					{form.formName}
				</Header>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<Button asChild variant="wrap">
								<a
									href={getEditFormUrl(form.googleFormId)}
									target="_blank"
									rel="noreferrer"
									className="flex flex-row"
								>
									<Pencil size={18} />
								</a>
							</Button>
						</TooltipTrigger>
						<TooltipContent className="max-w-64" side="bottom">
							<Text size="xs">Edit Form in Google Forms</Text>
						</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger>
							<Button
								className="flex flex-row"
								variant="wrap"
								disabled={isPending}
								onClick={() =>
									syncForm({ formId: form.googleFormId, initialSync: false })
								}
							>
								<RefreshCcw size={18} />
							</Button>
						</TooltipTrigger>
						<TooltipContent className="max-w-64" side="bottom">
							<Text size="xs">Sync Form with Google</Text>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>

			<FormNav formId={params.id} />
			{children}
		</div>
	);
}
