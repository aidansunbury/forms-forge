"use client";
import { api } from "@/trpc/react";

import { Accordion } from "@/components/ui/accordion";
import { Header } from "@/components/ui/header";
import { ResponseView } from "./_components/ResponseView";

const Responses = ({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: { id: string };
}>) => {
    const [formResponse] = api.form.getFormByResponses.useSuspenseQuery({
        formId: params.id,
    });

    return (
        <div className="w-full">
            <Header as="h2" size="h2">
                Responses
            </Header>
            {/* To make controlled: https://stackoverflow.com/questions/77947178/is-there-any-way-to-control-shadcnui-accordion-open-and-close-functionality  */}
            <Accordion type="multiple" className="space-y-1">
                {formResponse.formResponses.map((response) => (
                    <ResponseView response={response} key={response.id} />
                ))}
            </Accordion>
        </div>
    );
};
export default Responses;
