import NavBar from "@/components/NavBar";
import { Footer, Hero } from "./LandingPage";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm, type SubmitHandler } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StaticMap from "@/components/Map";
const phoneRegex = /^\+?[\d\s-]+(?:[\d-]+\d+)?$/;
const formSchema = z.object({
  fullname: z.string({ error: "Please enter valid text" }).min(3, "Too short"),
  email: z.email({ error: "Please enter a valid email address" }),
  phone: z
    .string()
    .regex(phoneRegex, "Please enter a valid phone number")
    .min(10, "Too short"),
  message: z.string({ error: "Please enter valid text" }),
});
type FormFields = z.infer<typeof formSchema>;
const ContactBody = () => {
  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: "",
      email: "",
      phone: "",
      message: "",
    },
  });
  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    console.log(data);
    try {
      await axios.post("/api/contact", data);
    } catch (error) {
      console.log(error);
      form.setError("root", {
        message: `An error ocurred:${error}`,
      });
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
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 w-90"
              >
                {form.formState.errors.root && (
                  <Alert
                    variant="destructive"
                    className="rounded-none border-b-0 border-l-4 border-r-0 border-t-0 border-red-500 bg-red-500/10 font-medium text-red-500"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {form.formState.errors.root?.message}
                    </AlertDescription>
                  </Alert>
                )}
                <FormField
                  control={form.control}
                  name="fullname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="fullname"
                          type="text"
                          placeholder="E.g John Doe"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="someone@example.com"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="phone"
                          type="text"
                          placeholder="Enter your phone number"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          id="message"
                          placeholder="Enter your message here"
                          className="h-28"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  variant="default"
                  color="primary"
                  type="submit"
                  className="w-full h-11"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </Form>
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
