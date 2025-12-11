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
import { Building2, MapPin, Radar } from "lucide-react";
import pilot from "@/assets/images/hero-real-estate-facts-trends.jpeg";
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
  MagnifierIcon,
  WalletIcon,
} from "@/components/Icons";
// import { Badge } from "@/components/ui/badge";

export const Hero = () => {
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
            className="w-[450px] object-contain rounded-lg"
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
                We are a real estate platform that aims to provide a seamless
                and efficient experience for homebuyers and sellers. Our
                platform utilizes cutting-edge technology to streamline the home
                buying and selling process, making it easier for users to find
                their dream home. With a user-friendly interface and a robust
                backend, we are committed to providing the best possible
                experience for our users. Our platform is designed to be
                scalable, secure, and reliable, ensuring that users can trust us
                with their most important transactions. We are dedicated to
                building a community that is passionate about real estate and
                committed to making the home buying and selling process as
                smooth as possible.
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
    icon: <MapIcon />,
    title: "Select Property",
    description:
      "Select a property that fits your needs and budget. We have a wide range of properties to choose from, including apartments, houses, and villas. Our properties are carefully selected to ensure that you have a great experience.",
  },
  {
    icon: <MedalIcon />,
    title: "Select Agent",
    description:
      "Choose an agent that you trust and has experience in the property market. Our agents are trained to help you find the best properties that fit your needs and budget.",
  },
  {
    icon: <MagnifierIcon />,
    title: "Choose House",
    description:
      "Choose a house that fits your needs and budget. Our houses are carefully selected to ensure that you have a great experience.",
  },
  {
    icon: <WalletIcon />,
    title: "Pay",
    description:
      "Pay securely with your preferred payment method. We accept all major credit cards, as well as PayPal and bank transfers.",
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
        Find your dream property with us. We have a wide range of properties to
        choose from, including apartments, houses, and villas.
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
import image from "@/assets/images/luxury-house-real-estate.jpg";
import image3 from "@/assets/images/maxresdefault.jpg";
import image4 from "@/assets/images/residential-real-estate-townhome.jpg";
import { ScrollToTop } from "@/components/ScrollTotop";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pricing } from "@/components/Pricing";
import { Input } from "@/components/ui/input";
const bestProperties = [
  {
    title: "residential",
    image: image4,
  },
  {
    title: "max-residential",
    image: image3,
  },
  {
    title: "luxury",
    image: image,
  },
];
// const featureList: string[] = [
//   "Dark/Light theme",
//   "Reviews",
//   "Features",
//   "Pricing",
//   "Contact form",
//   "Our team",
//   "Responsive design",
//   "Newsletter",
//   "Minimalist",
// ];
const BestProperties = () => {
  return (
    <section
      id="best-properties"
      className="landing-container container py-24 sm:py-32 space-y-8"
    >
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        Best{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Property Deals
        </span>
      </h2>
      {/* <div className="flex flex-wrap md:justify-center gap-4">
        {featureList.map((feature: string) => (
          <div key={feature}>
            <Badge variant="secondary" className="text-sm">
              {feature}
            </Badge>
          </div>
        ))}
      </div> */}
      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
        Find the best property deals from our selection of luxury, residential,
        and max-residential properties. Our deals are carefully curated to
        provide you with the best possible value for your money. Whether you're
        looking for a luxurious property to call home or a smart investment
        opportunity, we've got you covered!
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bestProperties.map(({ title, image }) => (
          <div key={title} className="flex justify-evenly">
            {/* <CardHeader>
              <CardTitle className="text-2xl">{title}</CardTitle>
            </CardHeader> */}

            <img
              src={image}
              alt={title}
              className="max-w-full max-h-full object-cover rounded-lg"
            />

            {/* <CardFooter>
              <img
                src={image}
                alt="About feature"
                className="w-[200px] lg:w-[300px] mx-auto"
              />
            </CardFooter> */}
          </div>
        ))}
      </div>
    </section>
  );
};

const featuredProperties: FeatureProps[] = [
  {
    title: "Kings Vision Villa",
    location: "Kampala",
    price: "$880000",
    image: image4,
  },
  {
    title: "max-residential",
    location: "Kampala",
    price: "$780000",
    image: image3,
  },
  {
    title: "luxury",
    location: "Kampala",
    price: "$680000",
    image: image,
  },
  {
    title: "luxury",
    location: "Kampala",
    price: "$680000",
    image: image,
  },
  {
    title: "luxury",
    location: "Kampala",
    price: "$580000",
    image: image3,
  },
  {
    title: "luxury",
    location: "Kampala",
    price: "$680000",
    image: image4,
  },
];
const FeaturedProperties = () => {
  return (
    <section
      id="featured-properties"
      className="landing-container container py-24 sm:py-32 space-y-8"
    >
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        Featured{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Property
        </span>
      </h2>
      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
        Our featured properties are a selection of the best luxury, residential,
        and max-residential properties on the market. Each property has been
        carefully curated to provide you with the best possible value for your
        money. Whether you're looking for a luxurious property to call home or a
        smart investment opportunity, we've got you covered!
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredProperties.map(({ title, location, price, image }) => (
          <Card key={title} className="pt-0">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover rounded-t-xl"
            />

            <CardDescription>
              <div className="flex flex-col">
                <h3 className="text-2xl font-medium">{title}</h3>
                <div className="flex justify-between px-3">
                  <span className="flex items-center gap-2">
                    <MapPin className="text-primary" />
                    <h4 className="text-md font-bold">{location}</h4>
                  </span>
                  <span>{price}</span>
                </div>
              </div>
            </CardDescription>

            <CardFooter className="flex justify-center align-center">
              <Button
                variant={"outline"}
                className="border border-primary rounded-md bg-white"
              >
                View Property
              </Button>
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

export const Footer = () => {
  return (
    <footer id="footer">
      <section className="landing-container py-24 sm:py-32 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-12 gap-y-8">
        <div className="col-span-full lg:col-span-2 flex flex-col items-start">
          <a
            rel="noreferer noopener"
            className="font-bold text-xl flex items-center"
            href="/"
          >
            <Building2 className="mr-2" /> IEstate
          </a>
          <div className="col-span-full lg:col-span-2 ml-0">
            <p className="text-lg text-muted-foreground">
              Our dedicated property managers offer a full property and rental
              management service for landlords. So you can relax knowing your
              property is in safe and experienced hands.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Follow US</h3>
          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              Facebook
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              X
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              Instagram
            </a>
          </div>
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
          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              Announcements
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
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Our Address</h3>
          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              Kampala, Uganda
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
      <BestProperties />
      <FeaturedProperties />
      <Testimonals />
      <Pricing />
      <Newsletter />
      <Footer />
      <ScrollToTop />
    </>
  );
}
