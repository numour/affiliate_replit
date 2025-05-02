import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { affiliateFormSchema } from "@/lib/zodSchemas";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type FormData = z.infer<typeof affiliateFormSchema>;

interface FormStepOneProps {
  form: UseFormReturn<FormData>;
  nextStep: () => void;
}

const FormStepOne = ({ form, nextStep }: FormStepOneProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-outfit font-bold text-2xl mb-4">Tell us about yourself</h2>
      
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-gray-700 font-medium block mb-1">
              Your Name
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 h-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-numourPurple focus:border-transparent transition-all"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="instagram"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-gray-700 font-medium block mb-1">
              Instagram Handle (e.g. @username)
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter your Instagram handle"
                className="w-full px-4 py-3 h-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-numourPurple focus:border-transparent transition-all"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="flex justify-end mt-8">
        <Button 
          type="button" 
          onClick={nextStep}
          size="lg"
          className="px-8 py-4 bg-numourPurple text-white rounded-lg font-medium hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-numourPurple text-lg"
        >
          Continue to Next Step
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default FormStepOne;
