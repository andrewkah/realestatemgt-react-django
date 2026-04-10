import {
  Building2,
  FileSpreadsheet,
  GalleryVerticalEnd,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { useContext } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/NavMain";
import { NavUser } from "@/components/NavUser";
import { AuthContext } from "@/context/AuthContext";
export function AppSidebar() {
  const { user } = useContext(AuthContext);
  const displayName =
    user?.profile?.first_name || user?.profile?.last_name
      ? `${user.profile?.first_name ?? ""} ${user.profile?.last_name ?? ""}`.trim()
      : user?.username ?? "REMS User";

  const navMain = [
    {
      title: "Workspace",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
        {
          title: "Property Management",
          url: "/dashboard/properties",
        },
      ],
    },
    {
      title: "Automation",
      url: "/dashboard/properties",
      icon: ShieldCheck,
      items: [
        {
          title: "Document Hub",
          url: "/dashboard/properties",
        },
        {
          title: "Export Center",
          url: "/dashboard/properties",
        },
      ],
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none">
              <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Real Estate Mgt</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  Property operations workspace
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <div className="mx-2 mt-2 rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sidebar-primary/15 p-2 text-sidebar-primary">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Portfolio Sync</p>
              <p className="text-sidebar-foreground/70 text-xs">
                Internal modules stay aligned through the same property API.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-sidebar-foreground/80">
            <FileSpreadsheet className="size-4" />
            Manual CSV/JSON exports are available in the property workspace.
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: displayName,
            email: user?.email ?? "workspace@rems.local",
            avatar: user?.profile?.image ?? "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
