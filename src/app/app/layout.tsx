"use client";
import { Home, PanelLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import { SessionProvider } from "next-auth/react";

import { NavBarAvatar } from "@/components/NavBarAvatar";

export default function AppLayout({
	children,
	params,
}: Readonly<{ children: React.ReactNode; params: any }>) {
	return (
		<TooltipProvider>
			<SessionProvider>
				<div className="flex min-h-screen w-full flex-col ">
					<aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-muted sm:flex">
						<nav className="mt-12 flex flex-col items-center gap-4 px-2 sm:py-5 h-full">
							<Tooltip>
								<TooltipTrigger asChild>
									<Link
										href="/app/dashboard"
										className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
									>
										<Home className="h-5 w-5" />
										<span className="sr-only">Dashboard</span>
									</Link>
								</TooltipTrigger>
								<TooltipContent side="right">Dashboard</TooltipContent>
							</Tooltip>
							<div className="mt-auto">
								<NavBarAvatar />
							</div>
						</nav>
					</aside>
					<div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 bg-background">
						<header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
							{/* Expandable navbar */}
							<Sheet>
								<SheetTrigger>
									<Button size="icon" variant="outline" className="sm:hidden">
										<PanelLeft className="h-5 w-5" />
										<span className="sr-only">Toggle Menu</span>
									</Button>
								</SheetTrigger>
								<SheetContent side="left" className="sm:max-w-xs">
									<nav className="grid gap-6 text-lg font-medium">
										<Link
											href="/app/dashboard"
											className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
										>
											<Home className="h-5 w-5" />
											Dashboard
										</Link>
									</nav>
								</SheetContent>
							</Sheet>

							{/* Avatar */}
							<div className="relative ml-auto flex-1 grow-0 sm:hidden">
								<NavBarAvatar />
							</div>
						</header>
						<main className="flex px-4">{children}</main>
					</div>
				</div>
			</SessionProvider>
		</TooltipProvider>
	);
}
