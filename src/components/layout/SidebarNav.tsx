
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
import { UserCircle, LogOut } from "lucide-react"; 
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";

export function SidebarNav() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { locale } = useLanguage();

  const handleLogout = () => {
    logout();
    // سيتم التوجيه إلى /login بواسطة AuthProvider أو middleware
  };

  return (
    <Sidebar collapsible="icon" side="right">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:justify-center">
          <AppLogoIcon className="h-7 w-7 text-sidebar-primary" />
          <span className="group-data-[collapsible=icon]:hidden">{locale === 'ar' ? 'محاسبي' : 'Muhasiby'}</span>
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
                      children: item.title, // العنوان سيكون مترجماً من nav-items
                      className: "bg-sidebar text-sidebar-foreground border-sidebar-border shadow-lg rounded-md",
                      side: "left" 
                    }}
                    className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
                    disabled={item.disabled}
                  >
                    <a>
                      <item.icon className="h-5 w-5 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:ml-0 rtl:group-data-[collapsible=icon]:mr-0 group-data-[collapsible=icon]:mr-0 mr-2 rtl:ml-2 shrink-0 icon-directional" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">
                        {item.title} {/* العنوان سيكون مترجماً */}
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
        {user && (
           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:p-0"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-2 rtl:ml-2 group-data-[collapsible=icon]:mr-0 rtl:group-data-[collapsible=icon]:ml-0 shrink-0 icon-directional" />
                  <span className="truncate group-data-[collapsible=icon]:hidden">{locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-sidebar text-sidebar-foreground border-sidebar-border shadow-lg rounded-md">
                <p>{locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}</p>
              </TooltipContent>
            </Tooltip>
           </TooltipProvider>
        )}
         {!user && ( // زر لملف المستخدم أو تسجيل الدخول إذا لم يكن المستخدم مسجلاً
          <TooltipProvider>
            <Tooltip>
               <TooltipTrigger asChild>
                <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:p-0">
                  <UserCircle className="h-5 w-5 mr-2 rtl:ml-2 group-data-[collapsible=icon]:mr-0 rtl:group-data-[collapsible=icon]:ml-0 shrink-0" />
                  <span className="truncate group-data-[collapsible=icon]:hidden">{locale === 'ar' ? 'ملف المستخدم' : 'User Profile'}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-sidebar text-sidebar-foreground border-sidebar-border shadow-lg rounded-md">
                <p>{locale === 'ar' ? 'ملف المستخدم' : 'User Profile'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
