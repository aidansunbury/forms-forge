"use client";

import { Header } from "@/components/ui/header";
import { Payment, columns } from "./_components/columns";
import { DataTable } from "./_components/table";

import { api } from "@/trpc/react";
import { access } from "fs";

export type Question = {
	id: string;
	response: string;
};

const TableView = async ({
	params,
}: { params: { tableId: string; id: string } }) => {
	const [data] = api.form.getTableData.useSuspenseQuery({
		formId: params.id,
	});

	const data2: Payment[] = [
		{
			amount: 100,
			email: "aidan",
			id: "1",
			status: "pending",
		},
	];

	// This is how you will receive the data from the server
	// An array of responses, which has an array of field responses
	const dynamicData: Question[][] = [
		[
			{
				id: "id_01",
				response: "John",
			},
			{
				id: "id_02",
				response: "Doe",
			},
		],
		[
			{
				id: "id_01",
				response: "Jane",
			},
			{
				id: "id_02",
				response: "Smith",
			},
		],
	];

	// group all of the fields from a given response into an object, map the object to the columns
	const formattedData = [
		{
			id_01: "John",
			id_02: "Doe",
		},
		{
			id_01: "Jane",
			id_02: "Smith",
		},
	];

	// These dynamic headers are going to be the questions, they will have an id, and a question name
	const dynamicHeaders: string[] = ["id_01", "id_02"];

	const fetchedHeaders = data.formFields.map((field) => ({
		accessorKey: field.googleQuestionId,
		header: field.fieldName,
	}));

	const formattedFetchedData = data.formResponses.map((response) => {
		const formattedResponse: Record<string, string> = {};
		for (const fieldResponse of response.formFieldResponses) {
			formattedResponse[fieldResponse.googleQuestionId] =
				fieldResponse.response;
		}
		return formattedResponse;
	});

	return (
		<div className="w-full">
			<Header as="h2" size="h2">
				Table
			</Header>
			Table {params.tableId}
			<DataTable
				columns={dynamicHeaders.map((header) => ({
					accessorKey: header,
					header: header.toUpperCase(),
				}))}
				data={formattedData}
			/>
			<DataTable columns={fetchedHeaders} data={formattedFetchedData} />
			{/* {JSON.stringify(formattedFetchedData)} */}
		</div>
	);
};

export default TableView;

// export type Payment = {
// 	id: string;
// 	amount: number;
// 	status: "pending" | "processing" | "success" | "failed";
// 	email: string;
// };

// export type Question = {
// 	id: string;
// 	question: string;
// };

// export const columns: ColumnDef<Payment>[] = [
// 	{
// 		accessorKey: "status",
// 		header: "Status",
// 	},
// 	{
// 		accessorKey: "email",
// 		header: "Email",
// 	},
// 	{
// 		accessorKey: "amount",
// 		header: "Amount",
// 	},
// ];
