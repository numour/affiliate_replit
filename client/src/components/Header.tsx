import { motion } from "framer-motion";
import NumourLogoSVG from "@/assets/NumourLogoSVG";

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center mb-8"
    >
      <div className="text-center">
        <NumourLogoSVG />
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-outfit font-bold text-3xl md:text-4xl text-numourDark mb-2"
        >
          Join the Numour Family 💜
        </motion.h1>
      </div>
    </motion.header>
  );
};

export default Header;
