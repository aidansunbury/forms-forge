import { InferSelectModel } from "drizzle-orm";
import { formResponse, formFieldResponse } from "@/server/db/schema";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

type FiledResponsesWithFormField = InferSelectModel<
  typeof formFieldResponse
> & {
  formField: {
    fieldName: string;
    fieldType: string;
  };
};

type ResponseWithFieldResponses = InferSelectModel<typeof formResponse> & {
  formFieldResponses: FiledResponsesWithFormField[];
};

export const ResponseView = ({
  response,
}: {
  response: ResponseWithFieldResponses;
}) => {
  return (
    <div>
      <AccordionItem value={response.id}>
        <AccordionTrigger>{response.respondentEmail}</AccordionTrigger>
        <AccordionContent>
          <Card className="h-fit w-full">
            <CardContent>
              {response.formFieldResponses.map((fieldResponse) => (
                <div key={fieldResponse.id}>
                  {fieldResponse.formField.fieldName}: {fieldResponse.response}
                </div>
              ))}
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};
