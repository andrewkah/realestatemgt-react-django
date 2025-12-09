import NavBar from '@/components/NavBar'
import { Hero } from './LandingPage'
import { Form } from '@/components/ui/form';
import { useForm, type SubmitHandler } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
const formSchema = z.object({
    fullname: z.string({ error: "Please enter valid text" }),
    email: z.email({ error: "Please enter a valid email address" }),
    phone: z.string().refine(val => {
        const regex = /^\+?[\d\s-]+(?:[\d-]+\d+)?$/;
        return regex.test(val) ? undefined : { error: "Please enter a valid phone number" };
    }),
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
            await axios.post('/api/contact', data);
        } catch (error) {
            console.log(error);
            form.setError("root", {
                message: `An error ocurred:${error}`,
            })
        }
    };
    return (
      <section className="landing-conatiner py-24 sm:py-32">
        <div className="grid lg:grid-cols-[1fr,1fr] gap-8 place-items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                Client-Centric{" "}
              </span>
              Services
            </h2>

            <p className="text-muted-foreground text-xl mt-4 mb-8 ">
              Our contact us page is designed to help you get in touch with us quickly and easily. We value your feedback and would love to hear from you. Whether you have a question, concern or just want to chat, we're here to listen. Please don't hesitate to reach out to us using the contact form below. We look forward to hearing from you soon.
            </p>

            </div>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4">
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
                    </form>
                </Form>
        </div>
      </section>
    );
}
const ContactUs = () => {
  return (
    <>
          <NavBar />
          <Hero />
          <ContactBody/>
    </>
  )
}

export default ContactUs
