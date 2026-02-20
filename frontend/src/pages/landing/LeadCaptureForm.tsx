import type { FieldConfig } from "@/components/DynamicForm";
import DynamicForm from "@/components/DynamicForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthContext } from "@/context/AuthContext";
import type { AuthTokens, User } from "@/types";
import axios from "axios";
import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import z from "zod";

const phoneRegex = /^\+?[\d\s-]+(?:[\d-]+\d+)?$/;
type rentFields = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};
const LeadCaptureForm = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const params = useParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const rentFormFields: FieldConfig[] = [
    {
      name: "first_name",
      label: "First Name",
      type: "text",
      placeholder: "John",
      validation: z.string().min(3, "Too short"),
    },
    {
      name: "last_name",
      label: "Last Name",
      type: "text",
      placeholder: "Doe",
      validation: z.string().min(3, "Too short"),
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "someone@example.com",
      validation: z.email({ error: "Please enter a valid email address" }),
    },
    {
      name: "phone",
      label: "Phone",
      type: "tel",
      placeholder: "+1 234 567 8901",
      validation: z
        .string()
        .regex(phoneRegex, "Please enter a valid phone number")
        .min(10, "Too short"),
    },
    {
      name: "lead_type",
      type: "text",
      attributes: {
        hidden: true,
        value: (params.propertyType === "buy" ? "buyer" : "tenant"),
      },
      validation: z.string(),
    },
  ];

  const handleSubmit = async (data: rentFields) => {
    // Add your API call or form submission logic here
    try {
      console.log(data);
      await axios.post(`${BASE_URL}/auth/lead-capture/`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        console.log(res);
        const { user, tokens }: { user: User; tokens: AuthTokens } = res.data as { user: User; tokens: AuthTokens }
        login(user, tokens);
        navigate('/dashboard');
      }).catch((e) => {
        console.log(e);
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <section
      id="leadCaptureForm"
      className="min-h-screen flex items-center justify-center"
    >
      <div className="w-full max-w-lg space-y-5">
        <Card className="px-4 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {params.propertyType === "buy" ? "Buy a Property" : "Rent a Property"}
              
            </CardTitle>
            <CardDescription className="text-center">
              {params.propertyType === "buy"
                ? "Fill out the form to proceed to buy a property"
                : "Fill out the form to proceed to rent a property"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DynamicForm
              fields={rentFormFields}
              onSubmit={handleSubmit}
              submitButtonText="Submit"
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LeadCaptureForm;
