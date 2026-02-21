import { SunIcon, MoonIcon } from "@heroicons/react/24/solid"; // Example icons
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useTheme } from "@/context/ThemeProvider";

function ThemeToggle() {
  const { setMode } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="theme"
          variant="ghost"
          className="ghost"
          aria-label="Toggle theme"
        >
          <SunIcon className="h-[1.1rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="h-[1.1rem] w-[1.2rem] absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setMode("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeToggle;
