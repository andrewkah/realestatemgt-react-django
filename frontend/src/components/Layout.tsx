// src/components/Layout.tsx
// import { type ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AppSidebar } from "@/components/AppSidebar";

// interface LayoutProps {
//   children: ReactNode;
// }

const Layout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-12 justify-between shrink-0 items-center border-b gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center space-x-4 me-3">
            {/* User/Auth related items (e.g., user name, logout button) */}
            {/* For demonstration, let's assume a dummy user menu or direct profile link */}
            <Link
              to="/profile"
              className="text-base-text hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-200 hidden sm:block"
            >
              Welcome, John!
            </Link>

            {/* THEME TOGGLE PLACEMENT */}
            <ThemeToggle />
            {/* End THEME TOGGLE PLACEMENT */}

            {/* Mobile menu button could go here too */}
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-grow p-5"><Outlet/></div>

        {/* Footer */}
        <footer className="h-12 text-center pt-2.5 text-sm text-gray-600 dark:text-gray-400 border-t border-border">
          &copy; {new Date().getFullYear()} RealEstateApp. All rights reserved.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
