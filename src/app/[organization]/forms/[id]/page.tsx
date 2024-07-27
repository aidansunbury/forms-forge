import { api } from "@/trpc/server";
import { orgMember } from "@/lib/serverMiddlewares";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

import { FormViewer } from "./_components/FormViewer";

export const FormView = async ({
  params,
}: {
  params: { organization: string; id: string };
}) => {
  const session = await getServerAuthSession();

  const org = await orgMember(session, params.organization);

  try {
    const formData = await api.form.getFormWithFields({
      formId: params.id,
      orgId: org.organizationId,
    });

    return (
      <div className="flex w-full flex-col items-center">
        <FormViewer formData={formData} />
      </div>
    );
  } catch (error) {
    console.log(error);
    return redirect("/home");
  }
};

export default FormView;
