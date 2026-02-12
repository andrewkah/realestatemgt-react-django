/* eslint-disable @typescript-eslint/no-unused-vars */
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";

// Field configuration type
export type FieldConfig = {
  name: string;
  label?: string;
  type: "text" | "email" | "tel" | "textarea" | "number";
  placeholder?: string;
  attributes?: Record<string, string | boolean | number | undefined>;
  validation: z.ZodTypeAny;
};

// Component props type
type DynamicFormProps = {
  //   title: string;
  //   description: string;
  fields: FieldConfig[];
  onSubmit: (data: any) => Promise<void> | void;
  submitButtonText?: string;
  className?: string;
};

const DynamicForm = ({
  //   title,
  //   description,
  fields,
  onSubmit,
  submitButtonText = "Submit",
  //   className = "",
}: DynamicFormProps) => {
  // Build schema dynamically from field configs
  const schemaShape = fields.reduce(
    (acc, field) => {
      acc[field.name] = field.validation;
      return acc;
    },
    {} as Record<string, z.ZodTypeAny>,
  );

  const formSchema = z.object(schemaShape);
  type FormFields = z.infer<typeof formSchema>;

  // Build default values (use attribute value when provided)
  const defaultValues = fields.reduce(
    (acc, field) => {
      const attrValue = field.attributes?.value;
      acc[field.name] = attrValue !== undefined ? (attrValue as any) : "";
      return acc;
    },
    {} as Record<string, any>,
  );

  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
      form.setError("root", {
        message: "An error occurred while submitting the form",
      });
    }
  };

  return (
    // <section
    //   className={`min-h-screen flex items-center justify-center ${className}`}
    // >
    //   <div className="w-full max-w-lg space-y-5">
    //     <Card className="px-4 shadow-sm">
    //       <CardHeader>
    //         <CardTitle className="text-2xl font-bold">{title}</CardTitle>
    //         <CardDescription className="text-center">
    //           {description}
    //         </CardDescription>
    //       </CardHeader>
    //       <CardContent>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {form.formState.errors.root && (
          <Alert
            className="rounded-none border-b-0 border-l-4 border-r-0 border-t-0 border-red-500 bg-red-500/10 font-medium text-red-500"
            variant="destructive"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {form.formState.errors.root?.message}
            </AlertDescription>
          </Alert>
        )}

        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as any}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  {(() => {
                    const { value: _attrValue, ...otherAttributes } =
                      (field.attributes ?? {}) as Record<string, any>;

                    if (field.type === "textarea") {
                      return (
                        <Textarea
                          id={field.name}
                          placeholder={field.placeholder}
                          className="min-h-[100px]"
                          {...otherAttributes}
                          value={String(formField.value ?? "")}
                          onChange={formField.onChange}
                          onBlur={formField.onBlur}
                          name={formField.name}
                          ref={formField.ref as any}
                        />
                      );
                    }

                    return (
                      <Input
                        id={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        className="h-11"
                        {...otherAttributes}
                        value={(formField.value as any) ?? ""}
                        onChange={formField.onChange}
                        onBlur={formField.onBlur}
                        name={formField.name}
                      />
                    );
                  })()}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button
          type="submit"
          variant="default"
          className="w-full h-11"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Submitting..." : submitButtonText}
        </Button>
      </form>
    </Form>
    //       </CardContent>
    //     </Card>
    //   </div>
    // </section>
  );
};

export default DynamicForm;
