import NavBar from "@/components/NavBar";
import { Button, buttonVariants } from "@/components/ui/button";
import bg from "@/assets/images/luxury-house-real-estate.jpg";
import type {
  FeatureProps,
  SponsorProps,
  statsProps,
  TestimonialProps,
  WorkListProps,
} from "@/types";
import { Building2, Radar } from "lucide-react";
import pilot from "@/assets/images/pilot.png";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MedalIcon,
  MapIcon,
  PlaneIcon,
  GiftIcon,
} from "@/components/Icons";
import { Badge } from "@/components/ui/badge";

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
    <section
      className="landing-container container pt-24 sm:py-32"
      id="sponsors"
    >
      <h2 className="text-center text-md lg:text-xl font-bold mb-8 text-primary">
        Investors and founders
      </h2>
      <div className="flex flex-wrap justify-center gap-4 md:gap-8">
        {sponsors.map(({ icon, name }: SponsorProps) => (
          <div
            key={name}
            className="flex items-center gap-1 text-muted-foreground/60"
          >
            <span>{icon}</span>
            <h3 className="text-xl font-bold">{name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

const stats: statsProps[] = [
  { quantity: "2.7K+", description: "Users" },
  { quantity: "1.8K+", description: "Subscribers" },
  { quantity: "112", description: "Downloads" },
  { quantity: "4", description: "Products" },
];
const About = () => {
  return (
    <section id="about" className="landing-container container py-24 sm:py-32">
      <div className="bg-muted/50 border rounded-lg py-12">
        <div className="px-6 flex flex-col-reverse md:flex-row gap-8 md:gap-12">
          <img
            src={pilot}
            alt=""
            className="w-[300px] object-contain rounded-lg"
          />
          <div className="bg-green-0 flex flex-col justify-between">
            <div className="pb-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                  About{" "}
                </span>
                Company
              </h2>
              <p className="text-xl text-muted-foreground mt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit
                amet, consectetur adipiscing elit.
              </p>
            </div>
            <section id="statistics">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map(({ quantity, description }: statsProps) => (
                  <div key={description} className="space-y-2 text-center">
                    <h2 className="text-3xl sm:tex-4xl font-bold">
                      {quantity}
                    </h2>
                    <p className="text-xl text-muted-foreground">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
};

const workList: WorkListProps[] = [
  {
    icon: <MedalIcon />,
    title: "Accessibility",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum quas provident cum",
  },
  {
    icon: <MapIcon />,
    title: "Community",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum quas provident cum",
  },
  {
    icon: <PlaneIcon />,
    title: "Scalability",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum quas provident cum",
  },
  {
    icon: <GiftIcon />,
    title: "Gamification",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum quas provident cum",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="howItWorks"
      className="landing-container container text-center py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold">
        How It{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Works{" "}
        </span>
        Step-by-Step Guide
      </h2>
      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Veritatis
        dolor pariatur sit!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {workList.map(({ icon, title, description }: WorkListProps) => (
          <Card key={title} className="bg-muted/50">
            <CardHeader>
              <CardTitle className="grid gap-4 place-items-center text-2xl">
                {icon}
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
import image from "@/assets/images/growth.png";
import image3 from "@/assets/images/reflecting.png";
import image4 from "@/assets/images/looking-ahead.png";
import { ScrollToTop } from "@/components/ScrollTotop";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pricing } from "@/components/Pricing";
import { Input } from "@/components/ui/input";
const features: FeatureProps[] = [
  {
    title: "Responsive Design",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi nesciunt est nostrum omnis ab sapiente.",
    image: image4,
  },
  {
    title: "Intuitive user interface",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi nesciunt est nostrum omnis ab sapiente.",
    image: image3,
  },
  {
    title: "AI-Powered insights",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi nesciunt est nostrum omnis ab sapiente.",
    image: image,
  },
];
const featureList: string[] = [
  "Dark/Light theme",
  "Reviews",
  "Features",
  "Pricing",
  "Contact form",
  "Our team",
  "Responsive design",
  "Newsletter",
  "Minimalist",
];
const Features = () => {
  return (
    <section
      id="features"
      className="landing-container container py-24 sm:py-32 space-y-8"
    >
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        Many{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Great Features
        </span>
      </h2>
      <div className="flex flex-wrap md:justify-center gap-4">
        {featureList.map((feature: string) => (
          <div key={feature}>
            <Badge variant="secondary" className="text-sm">
              {feature}
            </Badge>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map(({ title, description, image }: FeatureProps) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="text-2xl">{title}</CardTitle>
            </CardHeader>

            <CardContent>{description}</CardContent>

            <CardFooter>
              <img
                src={image}
                alt="About feature"
                className="w-[200px] lg:w-[300px] mx-auto"
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};

const testimonials: TestimonialProps[] = [
  {
    image: "https://github.com/shadcn.png",
    name: "John Doe React",
    userName: "@john_Doe",
    comment: "This landing page is awesome!",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "John Doe React",
    userName: "@john_Doe1",
    comment:
      "Lorem ipsum dolor sit amet,empor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
  },

  {
    image: "https://github.com/shadcn.png",
    name: "John Doe React",
    userName: "@john_Doe2",
    comment:
      "Lorem ipsum dolor sit amet,exercitation. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "John Doe React",
    userName: "@john_Doe3",
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "John Doe React",
    userName: "@john_Doe4",
    comment:
      "Lorem ipsum dolor sit amet, tempor incididunt  aliqua. Ut enim ad minim veniam, quis nostrud.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "John Doe React",
    userName: "@john_Doe5",
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
];
const Testimonals = () => {
  return (
    <section
      className="landing-container container py-24 sm:py-32"
      id="testimonials"
    >
      <h2 className="text-3xl md:text-4xl font-bold">
        Discover Why
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          {" "}
          People Love{" "}
        </span>
        This Landing Page
      </h2>
      <p className="text-xl text-muted-foreground pt-4 pb-8">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Non unde error
        facere hic reiciendis illo
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 sm:block columns-2 lg:columns-3 lg:gap-6 mx-auto space-y-4 lg:space-y-6">
        {testimonials.map(
          ({ image, name, userName, comment }: TestimonialProps) => (
            <Card key={userName} className="bg-muted/50">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                  <AvatarImage src={image} alt="" />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{name}</CardTitle>
                  <CardDescription className="text-sm">
                    {userName}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-sm">{comment}</CardContent>
            </Card>
          )
        )}
      </div>
    </section>
  );
};
const Newsletter = () => {
  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Subscribed");
  };
  return (
    <section id="newsletter">
      <hr className="w-11/12 mx-auto" />
      <div className="landing-container py-24 sm:py-32">
        <h3 className="text-center text-4xl md:text-5xl font-bold">
          Join Our Daily{" "}
          <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
            Newsletter
          </span>
        </h3>
        <p className="text-xl text-muted-foreground text-center mt-4 mb-8">
          Lorem ipsum dolor sit amet consectetur.
        </p>
        <form
          action=""
          className="flex flex-col w-ful md:flex-row md:w-6/12 lg:w-4/12 mx-auto gap-4 md:gap-2"
          onSubmit={handleSubmit}
        >
          <Input
            placeholder="someone@example.com"
            className="bg-muted/50 dark:bg-muted/80"
            aria-label="email"
          />
          <Button>Subscribe</Button>
        </form>
      </div>
      <hr className="w-11/12 mx-auto" />
    </section>
  );
};

const Footer = () => {
  return (
    <footer id="footer">
      <section className="landing-container py-24 sm:py-32 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
        <div className="col-span-full xl:col-span-2">
          <a
            rel="noreferer noopener"
            className="font-bold text-xl flex"
            href="/"
          >
            <Building2 className="mr-2" /> IEstate
          </a>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">About</h3>
          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              Features
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              Pricing
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              FAQ
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Community</h3>
          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              Youtube
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              Discord
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              Twitch
            </a>
          </div>
        </div>
      </section>
      <section className="landing-container pb-14 text-center">
        <h3>
          &copy; {new Date().getFullYear()} Landing page made by{" "}
          <a
            rel="noreferrer noopener"
            target="_blank"
            href="https://www.linkedin.com/in/leopoldo-miranda/"
            className="text-primary transition-all border-primary hover:border-b-2"
          >
            IEstate
          </a>
        </h3>
      </section>
    </footer>
  );
};
export default function LandingPage() {
  return (
    <>
      <NavBar />
      <Hero />
      <Sponsors />
      <About />
      <HowItWorks />
      <Features />
      <Testimonals />
      <Pricing />
      <Newsletter />
      <Footer/>
      <ScrollToTop />
    </>
  );
}
