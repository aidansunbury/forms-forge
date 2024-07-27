"use server";
import { api } from "@/trpc/server";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { NewForm } from "./NewForm";
import { orgMember } from "@/lib/serverMiddlewares";
import Home from "@/app/_components/Home";

const Organization = async ({
  params,
}: {
  params: { organization: string };
}) => {
  if (params.organization === "home") {
    return <Home />;
  }

  const session = await getServerAuthSession();
  // Ensure that the logged in user is a member of the organization
  const org = await orgMember(session, params.organization);

  const orgWithForms = await api.org.getOrgWithForms({
    orgId: org.organizationId,
  });

  return (
    <div className="">
      <h1>Organization</h1>
      {/* Render existing forms */}
      <div className="flex w-full flex-row flex-wrap border">
        {orgWithForms.forms.map((form) => (
          <Link
            key={form.id}
            href={`/${org.organization.organizationSlug}/forms/${form.id}`}
          >
            <Card className="m-1 h-48 w-64">
              <CardHeader>
                <CardTitle>{form.formName}</CardTitle>
                {/* <CardDescription>{form.formDescription}</CardDescription> */}
              </CardHeader>
              <CardContent>
                <p>Card Content</p>
              </CardContent>
              <CardFooter>
                <p>Card Footer</p>
              </CardFooter>
            </Card>
          </Link>
        ))}
        {/* New form Button */}
        <NewForm
          orgId={org.organizationId}
          orgSlug={org.organization.organizationSlug}
        />
      </div>
    </div>
  );
};

export default Organization;
