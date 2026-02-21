import NavBar from "@/components/NavBar";
import { Footer, Hero } from "./LandingPage";
import z from "zod";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import StaticMap from "@/components/Map";
import DynamicForm, { type FieldConfig } from "@/components/DynamicForm";

const phoneRegex = /^\+?[\d\s-]+(?:[\d-]+\d+)?$/;
const contactUsFields: FieldConfig[] = [
  {
    name: "fullname",
    label: "Full Name",
    type: "text",
    placeholder: "John Doe",
    validation: z.string().min(3, "Too short"),
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Mk2mD@example.com",
    validation: z.email({ error: "Please enter a valid email address" }),
  },
  {
    name: "phone",
    label: "Phone",
    type: "tel",
    placeholder: "+1 (123) 456-7890",
    validation: z
      .string()
      .regex(phoneRegex, "Please enter a valid phone number"),
  },
  {
    name: "message",
    label: "Message",
    type: "textarea",
    placeholder: "Enter your message",
    validation: z.string({ error: "Please enter valid text" }),
  },
];
const ContactBody = () => {
  const handleSubmit = async (data: any) => {
    console.log(data);
    try {
      await axios.post("/api/contact", data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <section className="landing-container py-24 sm:py-32" id="contactForm">
      <div className="grid lg:grid-cols-2 gap-8 place-items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
              Client-Centric{" "}
            </span>
            Services
          </h2>

          <p className="text-muted-foreground text-xl mt-4 mb-8 ">
            Our contact us page is designed to help you get in touch with us
            quickly and easily. We value your feedback and would love to hear
            from you. Whether you have a question, concern or just want to chat,
            we're here to listen. Please don't hesitate to reach out to us using
            the contact form below. We look forward to hearing from you soon.
          </p>
        </div>
        <Card className="px-4 shadow-sm">
          <CardContent>
            <DynamicForm
              fields={contactUsFields}
              onSubmit={handleSubmit}
              submitButtonText="Submit"
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
const ContactUs = () => {
  return (
    <>
      <NavBar />
      <Hero />
      <ContactBody />
      <StaticMap />
      <Footer />
    </>
  );
};

export default ContactUs;
