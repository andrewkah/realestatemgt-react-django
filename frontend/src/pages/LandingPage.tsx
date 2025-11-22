import NavBar from "@/components/NavBar";
import { Button, buttonVariants } from "@/components/ui/button";
import bg from "@/assets/images/luxury-house-real-estate.jpg";
const Hero = () => {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background image placed in its own absolutely positioned layer so it stays under the navbar */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      />

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative z-10 container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          <main className="text-5xl md:text-6xl font-bold">
            <h1 className="inline">
              <span className="inline bg-gradient-to-r from-[#F596D3]  to-[#D247BF] text-transparent bg-clip-text">
                Shadcn
              </span>{" "}
              landing page
            </h1>{" "}
            for{" "}
            <h2 className="inline">
              <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
                React
              </span>{" "}
              developers
            </h2>
          </main>

          <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
            Build your React landing page effortlessly with the required
            sections to your project.
          </p>

          <div className="space-y-4 md:space-y-0 md:space-x-4">
            <Button className="w-full md:w-1/3">Get Started</Button>

            <a
              rel="noreferrer noopener"
              href="https://github.com/leoMirandaa/shadcn-landing-page.git"
              target="_blank"
              className={`w-full md:w-1/3 ${buttonVariants({
                variant: "outline",
              })}`}
            >
              Github Repository
              {/* <GitHubLogoIcon className="ml-2 w-5 h-5" /> */}
            </a>
          </div>
        </div>
      </div>

      {/* Hero cards sections */}
      {/* <div className="z-10"><HeroCards /></div> */}

      {/* Shadow effect */}
      <div className="shadow"></div>
    </section>
  );
};

export default function LandingPage() {
  return (
    <>
      <NavBar />
      <Hero />
    </>
  );
}
