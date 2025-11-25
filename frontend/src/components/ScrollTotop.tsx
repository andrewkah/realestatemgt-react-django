import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ArrowUpToLine } from "lucide-react";

export const ScrollToTop = () => {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    });
  }, []);
  const goToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <>
      {showTopBtn && (
        <Button
          size={"icon"}
          className="fixed bottom-4 right-4 opacity-90 shadow-md"
          onClick={goToTop}
          aria-label="Scroll To Top"
        >
          <ArrowUpToLine className="h-4 w-4" />
        </Button>
      )}
    </>
  );
};
