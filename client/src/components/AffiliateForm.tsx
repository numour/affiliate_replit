import { useState } from "react";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { affiliateFormSchema } from "@/lib/zodSchemas";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import FormStepOne from "./FormStepOne";
import FormStepTwo from "./FormStepTwo";
import ProgressBar from "./ProgressBar";
import SuccessMessage from "./SuccessMessage";

type FormData = z.infer<typeof affiliateFormSchema>;

const AffiliateForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const totalSteps = 2;

  const form = useForm<FormData>({
    resolver: zodResolver(affiliateFormSchema),
    defaultValues: {
      name: "",
      instagram: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  const { formState } = form;

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Send data to our API endpoint
      await apiRequest("POST", "/api/affiliates", data);
      
      // Show success message
      setIsSuccess(true);
      toast({
        title: "Registration successful!",
        description: "Welcome to the Numour family!",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    // Validate only the fields in the current step
    if (currentStep === 1) {
      const result = await form.trigger(["name", "instagram"]);
      console.log("Form validation result:", result);
      if (result) {
        setCurrentStep(2);
      }
    }
    console.log("nextStep function called, current step:", currentStep);
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="lg:col-span-3 relative animate-fade-in">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        {isSuccess ? (
          <SuccessMessage name={form.getValues("name")} />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 && (
                <FormStepOne form={form} nextStep={nextStep} />
              )}
              
              {currentStep === 2 && (
                <FormStepTwo 
                  form={form} 
                  prevStep={prevStep} 
                  isSubmitting={isSubmitting} 
                />
              )}
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};

export default AffiliateForm;
