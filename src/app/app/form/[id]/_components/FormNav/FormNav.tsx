"use client";

import { cn } from "@/lib/utils";
import { CirclePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import React from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

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
					<Link href={`${basePath}`}>
						<NavigationMenuLink className={getStyles("")}>
							Overview
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<Link href={`${basePath}/questions`}>
						<NavigationMenuLink className={getStyles("questions")}>
							Questions
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<Link href={`${basePath}/responses`}>
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
							<Button variant="default">
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
					<div className="font-medium text-sm leading-none">{title}</div>
					<p className="line-clamp-2 text-muted-foreground text-sm leading-snug">
						{children}
					</p>
				</a>
			</NavigationMenuLink>
		</li>
	);
});
ListItem.displayName = "ListItem";
