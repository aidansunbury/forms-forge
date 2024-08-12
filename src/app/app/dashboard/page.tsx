import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getServerAuthSession } from "@/server/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FormsList } from "./FormsList";
import { ImportForm } from "./ImportForm";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Header } from "@/components/ui/header";

import { api } from "@/trpc/server";

export default async function Dashboard() {
	const session = await getServerAuthSession();

	const myForms = await api.form.getMyForms();

	if (!session) {
		return redirect("/");
	}

	return (
		<div className="">
			<Header as="h1" size="h1">
				Dashboard
			</Header>
			<div className="flex w-full flex-row flex-wrap">
				<FormsList forms={myForms} />
				<ImportForm />
			</div>
		</div>
	);
}
