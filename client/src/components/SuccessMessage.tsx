import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface SuccessMessageProps {
  name: string;
}

const SuccessMessage = ({ name }: SuccessMessageProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-10"
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 10 }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6"
      >
        <CheckCircle className="h-10 w-10 text-green-500" />
      </motion.div>
      
      <h2 className="font-outfit font-bold text-2xl mb-4">
        Welcome to the Numour Family!
      </h2>
      
      <p className="text-lg mb-8">
        We're so excited to have you join us on this journey, {name}. Check your email for a welcome message from us.
      </p>
      
      <motion.div 
        animate={{ 
          y: [0, -10, 0],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 3,
        }}
        className="inline-block"
      >
        <div
          className="w-48 h-48 rounded-full mx-auto border-4 border-numourLavender bg-numourLightLavender flex items-center justify-center"
        >
          <span className="text-5xl">💜</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SuccessMessage;
