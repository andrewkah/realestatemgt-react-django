import NavBar from "@/components/NavBar";
import { Button, buttonVariants } from "@/components/ui/button";
import bg from "@/assets/images/luxury-house-real-estate.jpg";
import type { SponsorProps } from "@/types";
import { Radar } from "lucide-react";
const Hero = () => {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background image placed in its own absolutely positioned layer so it stays under the navbar */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      />

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Content */}
      <div className="relative z-10 container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          <main className="text-5xl text-white/90 md:text-6xl font-bold">
            <h1 className="inline">
              <span className="inline bg-gradient-to-r from-[#61fb9c] via-[#1ff170] to-[#03d715] text-transparent bg-clip-text">
                Let's
              </span>{" "}
              find
            </h1>{" "}
            a{" "}
            <h2 className="inline">
              <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
                Perfect Home
              </span>{" "}
              for you
            </h2>
          </main>

          <p className="text-xl text-muted md:w-10/12 mx-auto lg:mx-0">
            We are here to find the right place for you and your family.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl mx-auto justify-center">
            <Button className="w-full sm:w-auto px-8">Get Started</Button>

            <a
              rel="noreferrer noopener"
              href="https://github.com/leoMirandaa/shadcn-landing-page.git"
              target="_blank"
              className={`w-full sm:w-auto px-8 ${buttonVariants({
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

const sponsors: SponsorProps[] = [
  { icon: <Radar size={34} />, name: "Sponsor 1" },
  { icon: <Radar size={34} />, name: "Sponsor 2" },
  { icon: <Radar size={34} />, name: "Sponsor 3" },
  { icon: <Radar size={34} />, name: "Sponsor 4" },
  { icon: <Radar size={34} />, name: "Sponsor 5" },
  { icon: <Radar size={34} />, name: "Sponsor 6" },
];
const Sponsors = () => {
  return (
    <section className="landing-container container pt-24 sm:py-32" id="sponsors">
      <h2 className="text-center text-md lg:text-xl font-bold mb-8 text-primary">
        Investors and founders
      </h2>
      <div className="flex flex-wrap justify-center gap-4 md:gap-8">
        {sponsors.map(({ icon, name }: SponsorProps) => (
          <div key={name} className="flex items-center gap-1 text-muted-foreground/60">
            <span>{icon}</span>
            <h3 className="text-xl font-bold">{name}</h3>
          </div>
        ))}
      </div>
    </section>
  )
}
export default function LandingPage() {
  return (
    <>
      <NavBar />
      <Hero />
      <Sponsors/>
    </>
  );
}
