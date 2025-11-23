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

interface RouteProps {
  href: string;
  label: string;
}
const routeList: RouteProps[] = [
  {
    href: "#home",
    label: "Home",
  },
  {
    href: "#rent",
    label: "Rent",
  },
  {
    href: "#buy_sell",
    label: "Buy/Sell",
  },
  {
    href: "#agent",
    label: "Agent",
  },
  {
    href: "#contact",
    label: "Contact Us",
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
                <Menu className="flex md:hidden h-5 x-5">
                  <span className="sr-only">Menu Icon</span>
                </Menu>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="font-bold text-xl">IEstate</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col justify-center items-center gap-2 mt-4">
                  {routeList.map(({ href, label }: RouteProps) => (
                    <a
                      rel="noreferrer noopener"
                      key={label}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className={buttonVariants({ variant: "ghost" })}
                    >
                      {label}
                    </a>
                  ))}
                  <Button
                    className="w-2.5 h-11"
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
            {routeList.map((route: RouteProps, i) => (
              <a
                href={route.href}
                key={i}
                rel="noreferrer noopener"
                className={`text-[17px] ${buttonVariants({
                  variant: "ghost",
                })}`}
              >
                {route.label}
              </a>
            ))}
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
