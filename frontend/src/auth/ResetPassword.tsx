import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Building2,
  AlertCircle,
  CheckCircle,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import z from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters long" }),
  confirmPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
});
type FormFields = z.infer<typeof formSchema>;
export function ResetPasswordForm() {
  const navigate = useNavigate();
  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  
  const onSubmit: SubmitHandler<FormFields> = async (
    values: z.infer<typeof formSchema>
  ) => {
    const { password } = values;
    try {
      await axios
        .post(
          `${BASE_URL}/auth/password-reset/`,
          { password },
          { headers: { "Content-Type": "application/json" } }
        )
        .then((response) => {
          console.log("reset response:", response);
          if (response.data.success) {
            setSuccess(true);
          }
        })
        .catch((err) => {
          console.log("Error:", err);
          form.setError("root", {
            message: `Error: ${err}`,
          });
        });
    } catch (error) {
      console.log(error);
      form.setError("root", {
        message: `An error occurred:${error}`,
      });
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6)
      return { strength: "weak", color: "text-destructive" };
    if (password.length < 10)
      return { strength: "medium", color: "text-yellow-600" };
    return { strength: "strong", color: "text-accent" };
  };

  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");
  const passwordStrength = getPasswordStrength(password || "");

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
              Password reset successful
            </h1>
            <p className="text-muted-foreground">
              Your password has been successfully reset
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  You can now sign in with your new password.
                </p>
                <Button className="w-full" onClick={() => navigate("/login")}>Sign in</Button>
              </div>
            </CardContent>
          </Card>
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
          <h1 className="text-2xl font-bold text-foreground">
            Create new password
          </h1>
          <p className="text-muted-foreground">Enter your new password below</p>
        </div>

        {/* Reset Password Form */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">
              Reset your password
            </CardTitle>
            <CardDescription className="text-center">
              Choose a strong password for your account
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
                        Confirm New Password
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

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? "Resetting password..."
                    : "Reset password"}
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
                <Button
                  variant="link"
                  className="px-0 text-accent hover:text-accent/80"
                  onClick={() => navigate("/login")}
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
