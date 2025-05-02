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
          <FormItem className="relative group space-y-1">
            <FormLabel className="absolute left-4 top-3 text-gray-500 pointer-events-none transition-all group-focus-within:transform group-focus-within:translate-y-[-1.5rem] group-focus-within:scale-85 group-focus-within:text-numourPurple">
              Your Name
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder=" "
                className="w-full px-4 py-3 h-14 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-numourPurple focus:border-transparent transition-all"
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
          <FormItem className="relative group space-y-1">
            <FormLabel className="absolute left-4 top-3 text-gray-500 pointer-events-none transition-all group-focus-within:transform group-focus-within:translate-y-[-1.5rem] group-focus-within:scale-85 group-focus-within:text-numourPurple">
              Instagram Handle (e.g. @username)
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder=" "
                className="w-full px-4 py-3 h-14 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-numourPurple focus:border-transparent transition-all"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="flex justify-end">
        <Button 
          type="button" 
          onClick={nextStep}
          className="px-6 py-3 bg-numourPurple text-white rounded-lg font-medium hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-numourPurple"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FormStepOne;
