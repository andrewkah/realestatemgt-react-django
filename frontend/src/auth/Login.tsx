import { useContext, useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Building2, AlertCircle } from "lucide-react";
// import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthContext } from "@/context/AuthContext";
import axios from "axios";
import { type User, type AuthTokens } from '../types';
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  email: z.email({ error: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters long" }),
  remember: z.boolean(),
});

type FormFields = z.infer<typeof formSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const onSubmit: SubmitHandler<FormFields> = async (
    values: z.infer<typeof formSchema>
  ) => {
    const { email, password } = values;

    try {
      // TODO: Replace with actual Django API call
      console.log("Login attempt:", { email, password });
      await axios
        .post(
          `${BASE_URL}/auth/login/`,
          { email, password },
          { headers: { "Content-Type": "application/json" } }
        )
        .then((response) => {
          console.log("response", response);
          const { user, tokens }: { user: User; tokens: AuthTokens } = response.data as { user: User; tokens: AuthTokens };
          login(user, tokens);
          navigate("/dashboard");
        })
        .catch((e) => {
          console.log("Error:", e.response.data);
          form.setError("root", {
            message: `Error: ${e.response.data.detail}`,
          });
        });
      // Simulate API call
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      // Handle successful login here
      console.log("Login successful");
    } catch (error) {
      console.log(error);
      form.setError("root", {
        message: `An error occurred:${error}`,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-5">
        {/* Logo and Header */}
        <div className="text-center space-y-1">
          <div className="flex justify-center">
            <div className="p-3 bg-primary rounded-full">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">RealEstate Pro</h1>
          <p className="text-muted-foreground">
            Sign in to manage your properties
          </p>
        </div>

        {/* Login Form */}
        <Card className="p-8 border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
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

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="Enter your email"
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="h-11"
                          />
                          <Button
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="remember"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start cursor-pointer space-y-0">
                        <FormControl className="cursor-pointer">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer text-sm">
                          Remember me
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* <Checkbox id="remember" className="cursor-pointer" />
                    <Label
                      htmlFor="remember"
                      className="text-sm cursor-pointer"
                    >
                      Remember Me
                    </Label> */}
                  <Button
                    variant="link"
                    className="px-0 text-accent hover:text-accent/80"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/forgot-password");
                    }}
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button
                  variant="default"
                  color="primary"
                  type="submit"
                  className="w-full h-11"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="px-0 text-accent hover:text-accent/80"
                onClick={() => navigate("/register")}
              >
                Sign up
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
