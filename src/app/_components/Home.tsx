import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getServerAuthSession();
  if (!session) {
    return redirect("/");
  }

  return (
    <div className="m-2 p-2">
      {session.user.organizations.map((org) => (
        <Link
          href={`/${org.organization.organizationSlug}`}
          key={org.organizationId}
        >
          <Card className="w-96">
            <CardHeader>
              <CardTitle>{org.organization.organizationName}</CardTitle>
              {/* <CardDescription>Card Description</CardDescription> */}
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
    </div>
  );
}
