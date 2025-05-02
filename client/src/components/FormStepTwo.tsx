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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

type FormData = z.infer<typeof affiliateFormSchema>;

interface FormStepTwoProps {
  form: UseFormReturn<FormData>;
  prevStep: () => void;
  isSubmitting: boolean;
}

const FormStepTwo = ({ form, prevStep, isSubmitting }: FormStepTwoProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-outfit font-bold text-2xl mb-4">Your Contact Information</h2>
      
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem className="relative group space-y-1">
            <FormLabel className="absolute left-4 top-3 text-gray-500 pointer-events-none transition-all group-focus-within:transform group-focus-within:translate-y-[-1.5rem] group-focus-within:scale-85 group-focus-within:text-numourPurple">
              Contact Number
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="tel"
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
        name="email"
        render={({ field }) => (
          <FormItem className="relative group space-y-1">
            <FormLabel className="absolute left-4 top-3 text-gray-500 pointer-events-none transition-all group-focus-within:transform group-focus-within:translate-y-[-1.5rem] group-focus-within:scale-85 group-focus-within:text-numourPurple">
              Email Address
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="email"
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
        name="address"
        render={({ field }) => (
          <FormItem className="relative group space-y-1">
            <FormLabel className="absolute left-4 top-3 text-gray-500 pointer-events-none transition-all group-focus-within:transform group-focus-within:translate-y-[-1.5rem] group-focus-within:scale-85 group-focus-within:text-numourPurple">
              Shipping Address
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder=" "
                rows={3}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-numourPurple focus:border-transparent transition-all resize-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          onClick={prevStep}
          variant="outline"
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="px-6 py-3 bg-numourPurple text-white rounded-lg font-medium hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-numourPurple disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
    </div>
  );
};

export default FormStepTwo;
