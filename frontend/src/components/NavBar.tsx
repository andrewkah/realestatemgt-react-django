import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "./ui/navigation-menu";
import { Building2, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button, buttonVariants } from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

interface RouteProps {
  href: string;
  label: string;
  isComponent?: boolean;
}
const routeList: RouteProps[] = [
  {
    href: "/#sponsors",
    label: "Sponsors",
  },
  {
    href: "/#about",
    label: "About",
  },
  {
    href: "/#best-properties",
    label: "Properties",
  },
  { href: "/#testimonials", label: "Testimonials" },
  {
    href: "/contact-us/#contactForm",
    label: "Contact Us",
    isComponent: true,
  },
];
const NavBar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <header className="sticky border-b-[1px] top-0 z-60 w-full bg-white/90 backdrop-blur-sm dark:bg-slate-900/80 dark:border-b-slate-700">
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container h-14 px-4 w-screen flex justify-between ">
          <NavigationMenuItem className="font-bold flex">
            <a
              href="/"
              rel="noreferrer noopener"
              className="ml-2 font-bold text-xl flex"
            >
              <Building2 className="mr-2" />
              <span>IEstate</span>
            </a>
          </NavigationMenuItem>
          {/* Mobile */}
          <span className="flex md:hidden">
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className="px-2">
                <Menu
                  className="flex md:hidden h-5 w-5"
                  onClick={() => setIsOpen(true)}
                >
                  <span className="sr-only">Menu Icon</span>
                </Menu>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="font-bold text-xl">IEstate</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col justify-center items-center gap-2 mt-4">
                  {routeList.map((route: RouteProps, i) =>
                    route.isComponent ? (
                      <Link
                        to={route.href}
                        key={i}
                        rel="noreferrer noopener"
                        onClick={() => setIsOpen(false)}
                        className={`text-[17px] ${buttonVariants({
                          variant: "ghost",
                        })}`}
                      >
                        {route.label}
                      </Link>
                    ) : (
                      <HashLink
                        smooth
                        to={route.href}
                        key={i}
                        rel="noreferrer noopener"
                        onClick={() => setIsOpen(false)}
                        className={`text-[17px] ${buttonVariants({
                          variant: "ghost",
                        })}`}
                      >
                        {route.label}
                      </HashLink>
                    ),
                  )}
                  <Button
                    className="w-[110px] h-11"
                    variant={"default"}
                    onClick={() => {}}
                  >
                    Login
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </span>
          {/* desktop */}
          <nav className="hidden md:flex gap-2">
            {routeList.map((route: RouteProps, i) =>
              route.isComponent ? (
                <Link
                  to={route.href}
                  key={i}
                  rel="noreferrer noopener"
                  className={`text-[17px] ${buttonVariants({
                    variant: "ghost",
                  })}`}
                >
                  {route.label}
                </Link>
              ) : (
                <HashLink
                  smooth
                  to={route.href}
                  key={i}
                  rel="noreferrer noopener"
                  onClick={() => setIsOpen(false)}
                  className={`text-[17px] ${buttonVariants({
                    variant: "ghost",
                  })}`}
                >
                  {route.label}
                </HashLink>
              ),
            )}
          </nav>
          <div className="hidden md:flex gap-2">
            <Button className="w-20 h-10" variant="default" onClick={() => {}}>
              Login
            </Button>
            <ThemeToggle />
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};

export default NavBar;
