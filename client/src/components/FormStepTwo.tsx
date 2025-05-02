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
          <FormItem className="space-y-1">
            <FormLabel className="text-gray-700 font-medium block mb-1">
              Contact Number
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="tel"
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 h-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-numourPurple focus:border-transparent transition-all"
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
          <FormItem className="space-y-1">
            <FormLabel className="text-gray-700 font-medium block mb-1">
              Email Address
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-3 h-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-numourPurple focus:border-transparent transition-all"
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
          <FormItem className="space-y-1">
            <FormLabel className="text-gray-700 font-medium block mb-1">
              Shipping Address
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Enter your complete shipping address"
                rows={3}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-numourPurple focus:border-transparent transition-all resize-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="flex justify-between mt-8">
        <Button 
          type="button" 
          onClick={prevStep}
          variant="outline"
          size="lg"
          className="px-8 py-4 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-lg"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Previous Step
        </Button>
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          size="lg"
          className="px-8 py-4 bg-numourPurple text-white rounded-lg font-medium hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-numourPurple disabled:opacity-70 text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
