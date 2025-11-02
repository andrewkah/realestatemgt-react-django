import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, AlertCircle, CheckCircle, Mail } from "lucide-react";
import z from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  // FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
const formSchema = z.object({
  pin: z.string().min(6, {
    error: "Your one-time password must be 6 characters.",
  }),
});
type FormFields = z.infer<typeof formSchema>;
export default function VerfiyEmail() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pin: "",
    },
  });
  const [success, setSuccess] = useState<boolean>(false);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const onSubmit: SubmitHandler<FormFields> = async (
    values: z.infer<typeof formSchema>
  ) => {
    try {
      console.log("Verify email request:", { values });
      await axios
        .post(`${BASE_URL}/auth/verify-email/`, { otp: values.pin })
        .then((response) => {
          console.log("Response:", response);
          if (response.data.success) {
            console.log("Verification successful!");
            setSuccess(true);
            setTimeout(() => {
              navigate("/login");
            }, 2000);
          }
        })
        .catch((e) => {
          console.log("Error:", e);
          form.setError("root", {
            message: `Error: ${e}`,
          });
        });
      // Simulate API call
      // await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      console.log(err);
      form.setError("root", { message: `An error occurred: ${err}` });
    }
  };
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-3 bg-accent rounded-full">
                <CheckCircle className="h-8 w-8 text-accent-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Verification Successful!
            </h1>
            {/* <p className="text-muted-foreground">
              We've sent a password reset link to 
            </p> */}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary rounded-full">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">RealEstate Pro</h1>
          <p className="text-muted-foreground">Verify your email address</p>
        </div>

        {/* Forgot Password Form */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-xl text-center">
              Enter verification code
            </CardTitle>
            <CardDescription className="text-center">
              We've sent a 6-digit code to{" "}
              {/* <span className="font-medium text-foreground">{email}</span> */}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
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

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="pin"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex justify-center">
                            <InputOTP maxLength={6} {...field}>
                              <InputOTPGroup>
                                <InputOTPGroup>
                                  <InputOTPSlot
                                    index={0}
                                    aria-invalid={!!fieldState.error}
                                  />
                                  <InputOTPSlot
                                    index={1}
                                    aria-invalid={!!fieldState.error}
                                  />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                  <InputOTPSlot
                                    index={2}
                                    aria-invalid={!!fieldState.error}
                                  />
                                  <InputOTPSlot
                                    index={3}
                                    aria-invalid={!!fieldState.error}
                                  />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                  <InputOTPSlot
                                    index={4}
                                    aria-invalid={!!fieldState.error}
                                  />
                                  <InputOTPSlot
                                    index={5}
                                    aria-invalid={!!fieldState.error}
                                  />
                                </InputOTPGroup>
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Please enter the one-time password sent to your phone.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? "Sending reset link..."
                    : "Send reset link"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
                <Button
                  variant="link"
                  className="px-0 text-accent hover:text-accent/80"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/login");
                  }}
                >
                  Sign in
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-x-4 text-xs text-muted-foreground">
          <Button variant="link" className="px-0 text-xs">
            Terms of Service
          </Button>
          <span>•</span>
          <Button variant="link" className="px-0 text-xs">
            Privacy Policy
          </Button>
        </div>
      </div>
    </div>
  );
}
