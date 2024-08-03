import { api } from "@/trpc/server";
import { orgMember } from "@/lib/serverMiddlewares";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

import { FormViewer } from "./_components/FormViewer";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

export const FormView = async ({
  params,
}: {
  params: { organization: string; id: string };
}) => {
  const session = await getServerAuthSession();

  // const org = await orgMember(session, params.organization);

  try {
    const formData = await api.form.getForm({
      formId: params.id,
    });

    return (
      <div className="flex w-full flex-col items-center">
        {/* Nav Menu */}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/docs" legacyBehavior passHref>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle() + " ring-2"}
                >
                  Edit
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/docs" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Responses
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/docs" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Settings
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {JSON.stringify(formData)}
      </div>
    );
  } catch (error) {
    console.log(error);
    return redirect("/home");
  }
};

export default FormView;
