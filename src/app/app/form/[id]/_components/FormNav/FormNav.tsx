"use client";

import { cn } from "@/lib/utils";

import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarShortcut,
	MenubarTrigger,
} from "@/components/ui/menubar";
import { CirclePlus } from "lucide-react";

import { Button } from "@/components/ui/button";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";
import { Form } from "react-hook-form";

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
import React from "react";

export const FormNav = () => {
	const path = usePathname();
	const basePath = path.split("/").slice(0, 4).join("/");
	const currentPath = path.split("/")[4] || "";

	const getStyles = (route: string) => {
		if (route === currentPath) {
			return `${navigationMenuTriggerStyle()} ring-2`;
		}
		return navigationMenuTriggerStyle();
	};

	return (
		<NavigationMenu className="rounded-md shadow-md">
			<NavigationMenuList>
				<NavigationMenuItem>
					<Link href={`${basePath}`} legacyBehavior passHref>
						<NavigationMenuLink className={getStyles("")}>
							Overview
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<Link href={`${basePath}/questions`} legacyBehavior passHref>
						<NavigationMenuLink className={getStyles("questions")}>
							Questions
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<Link href={`${basePath}/responses`} legacyBehavior passHref>
						<NavigationMenuLink className={getStyles("responses")}>
							Responses
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuTrigger className={getStyles("table")}>
						Table View
					</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid gap-3 p-4 ">
							<ListItem key={"1"} title="Customers" href="#">
								{""}
							</ListItem>
							<Button variant="secondary">
								<CirclePlus className="mr-1" />
								New Table view
							</Button>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuTrigger className={getStyles("table")}>
						Board View
					</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid gap-3 p-4 ">
							<ListItem key={"1"} title="Customers" href="#">
								{""}
							</ListItem>
							<Button variant="secondary">
								<CirclePlus className="mr-1" />
								New Board view
							</Button>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
};

const ListItem = React.forwardRef<
	React.ElementRef<"a">,
	React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
	return (
		<li>
			<NavigationMenuLink asChild>
				<a
					ref={ref}
					className={cn(
						"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
						className,
					)}
					{...props}
				>
					<div className="text-sm font-medium leading-none">{title}</div>
					<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
						{children}
					</p>
				</a>
			</NavigationMenuLink>
		</li>
	);
});
ListItem.displayName = "ListItem";

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/TYajopCsc4z
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
// import {
// 	NavigationMenu,
// 	NavigationMenuList,
// 	NavigationMenuItem,
// 	NavigationMenuLink,
// } from "@/components/ui/navigation-menu";
// import {
// 	DropdownMenu,
// 	DropdownMenuTrigger,
// 	DropdownMenuContent,
// 	DropdownMenuLabel,
// 	DropdownMenuSeparator,
// 	DropdownMenuItem,
// } from "@/components/ui/dropdown-menu";
// import Link from "next/link";

// export function FormNav() {
// 	return (
// 		<div className="flex flex-col w-full">
// 			<nav className="bg-background border-b">
// 				<div className="container px-4 md:px-6 flex items-center h-16">
// 					<NavigationMenu>
// 						<NavigationMenuList>
// 							<NavigationMenuItem>
// 								<NavigationMenuLink
// 									href="/questions"
// 									className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
// 								>
// 									Overview
// 								</NavigationMenuLink>
// 							</NavigationMenuItem>
// 							<NavigationMenuItem>
// 								<NavigationMenuLink
// 									href="/responses"
// 									className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
// 								>
// 									Questions
// 								</NavigationMenuLink>
// 							</NavigationMenuItem>
// 							<NavigationMenuItem>
// 								<DropdownMenu>
// 									<DropdownMenuTrigger asChild>
// 										<NavigationMenuLink
// 											href="#"
// 											className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
// 										>
// 											{/* Table View <ChevronDownIcon className="ml-2 h-4 w-4" /> */}{" "}
// 											tab;e
// 										</NavigationMenuLink>
// 									</DropdownMenuTrigger>
// 									<DropdownMenuContent align="end" className="w-[200px]">
// 										<DropdownMenuLabel>Tables</DropdownMenuLabel>
// 										<DropdownMenuSeparator />
// 										<DropdownMenuItem>
// 											<Link href="#" prefetch={false}>
// 												Customers
// 											</Link>
// 										</DropdownMenuItem>
// 										<DropdownMenuItem>
// 											<Link href="#" prefetch={false}>
// 												Orders
// 											</Link>
// 										</DropdownMenuItem>
// 										<DropdownMenuItem>
// 											<Link href="#" prefetch={false}>
// 												Products
// 											</Link>
// 										</DropdownMenuItem>
// 										<DropdownMenuSeparator />
// 										<DropdownMenuItem>
// 											<Link href="#" prefetch={false}>
// 												Create New Table
// 											</Link>
// 										</DropdownMenuItem>
// 									</DropdownMenuContent>
// 								</DropdownMenu>
// 							</NavigationMenuItem>
// 						</NavigationMenuList>
// 					</NavigationMenu>
// 				</div>
// 			</nav>
// 			<main className="flex-1 p-4 md:p-6" />
// 		</div>
// 	);
// }

// function ChevronDownIcon(props) {
// 	return (
// 		<svg
// 			{...props}
// 			xmlns="http://www.w3.org/2000/svg"
// 			width="24"
// 			height="24"
// 			viewBox="0 0 24 24"
// 			fill="none"
// 			stroke="currentColor"
// 			strokeWidth="2"
// 			strokeLinecap="round"
// 			strokeLinejoin="round"
// 		>
// 			<path d="m6 9 6 6 6-6" />
// 		</svg>
// 	);
// }
