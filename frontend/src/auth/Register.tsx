import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Eye, EyeOff, Building2, AlertCircle, Check } from "lucide-react";
// import { Label } from "@radix-ui/react-label";
import { Checkbox } from "@/components/ui/checkbox";
import z from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const formSchema = z
  .object({
    firstName: z.string().min(1, "Please enter your first name"),
    lastName: z.string().min(1, "Please enter your last name"),
    email: z.email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormFields = z.infer<typeof formSchema>;

export function RegisterForm() {
  localStorage.clear();
  const navigate = useNavigate();
  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const onSubmit: SubmitHandler<FormFields> = async (
    values: z.infer<typeof formSchema>
  ) => {
    console.log(values);
    const { firstName, lastName, email, password, confirmPassword } = values;
    try {
      await axios
        .post(`${BASE_URL}/auth/register/`, {
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
          confirm_password: confirmPassword,
        },{ headers: { "Content-Type": "application/json" } })
        .then((response) => {
          console.log("Response:", response);
          if (response.data.success) {
            // redirect to one time password page.
            navigate('/verify-email');
          }
        })
        .catch((e) => {
          console.log("Error:", e.response.data);
          form.setError("root", {
            message: `Error: ${e.response.data.detail}`,
          });
        });
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Registration successful");
    } catch (error) {
      form.setError("root", {
        message: `Registration failed: ${error}`,
      });
      console.log(error);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: "weak", color: "text-red-600" };
    if (password.length < 10)
      return { strength: "medium", color: "text-yellow-600" };
    return { strength: "strong", color: "text-green-600" };
  };

  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");
  const passwordStrength = getPasswordStrength(password || "");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary rounded-full">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">RealEstate Pro</h1>
          <p className="text-muted-foreground">
            Create your professional account
          </p>
        </div>

        {/* Registration Form */}
        <Card className="p-8 border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Get started</CardTitle>
            <CardDescription className="text-center">
              Join thousands of real estate professionals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-4 space-y-4"
              >
                {form.formState.errors.root && (
                  <Alert
                    variant="destructive"
                    className="rounded-none border-b-0 border-l-4 border-r-0 border-t-0 border-green-500 bg-green-500/10 font-medium text-green-500"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>
                      {form.formState.errors.root.message}
                    </AlertTitle>
                    {/* <AlertDescription>{error}</AlertDescription> */}
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="John"
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Doe"
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="john.doe@example.com"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            {...field}
                            className="h-11 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={(e) => {
                              e.preventDefault();
                              setShowPassword(!showPassword);
                            }}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      {password && (
                        <p className={`text-xs ${passwordStrength.color}`}>
                          Password strength: {passwordStrength.strength}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            {...field}
                            className="h-11 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={(e) => {
                              e.preventDefault();
                              setShowConfirmPassword(!showConfirmPassword);
                            }}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      {confirmPassword && password === confirmPassword && (
                        <div className="flex items-center space-x-1 text-xs text-green-600">
                          <Check className="h-3 w-3" />
                          <span>Passwords match</span>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex cursor-pointer items-center gap-2">
                        <FormControl className="cursor-pointer">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-0 leading-none">
                          <FormLabel className="cursor-pointer text-sm">
                            <span className="block sm:inline">
                              I agree to the{" "}
                              <Button
                                variant="link"
                                className="px-0 h-auto text-primary hover:text-primary/80 text-sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  console.log("Terms of Service");
                                }}
                              >
                                Terms of Service
                              </Button>{" "}
                              and{" "}
                              <Button
                                variant="link"
                                className="px-0 h-auto text-primary hover:text-primary/80 text-sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  console.log("Privacy Policy");
                                }}
                              >
                                Privacy Policy
                              </Button>
                            </span>
                          </FormLabel>
                          <FormMessage />
                        </div>
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
                    ? "Creating account..."
                    : "Create account"}
                </Button>
              </form>
            </Form>

            {/* <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button
                  variant="solid"
                  className="px-0 text-accent hover:text-accent/80"
                >
                  Sign in
                </Button>
              </p>
            </div> */}
          </CardContent>
          <CardFooter className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                className="px-0 text-accent hover:text-accent/80"
                onClick={() => navigate("/login")}
              >
                Sign in
              </Button>
            </p>
          </CardFooter>
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
