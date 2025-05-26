"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navItems, AppLogoIcon } from "./nav-items";
import { UserCircle } from "lucide-react"; 

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" side="right"> {/* Moved sidebar to the right */}
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:justify-center">
          <AppLogoIcon className="h-7 w-7 text-sidebar-primary" />
          <span className="group-data-[collapsible=icon]:hidden">Al Wasit</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <ScrollArea className="h-full">
          <SidebarMenu className="p-2 space-y-1">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                    tooltip={{ 
                      children: item.title, 
                      className: "bg-sidebar text-sidebar-foreground border-sidebar-border shadow-lg rounded-md",
                      side: "left" // Adjust tooltip side for right sidebar
                    }}
                    className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
                    disabled={item.disabled}
                  >
                    <a>
                      <item.icon className="h-5 w-5 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:mr-0 mr-2 shrink-0" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border group-data-[collapsible=icon]:p-0">
        <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:p-0">
          <UserCircle className="h-5 w-5 mr-2 group-data-[collapsible=icon]:mr-0 shrink-0" />
          <span className="truncate group-data-[collapsible=icon]:hidden">User Profile</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
