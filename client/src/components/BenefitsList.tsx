import { motion } from "framer-motion";

const benefits = [
  {
    icon: "✨",
    text: "You'll be more than a creator — you'll be our ambassador, our muse, and the voice of a brand that's redefining skincare in India."
  },
  {
    icon: "🌱",
    text: "We're still growing — building every formula, every box, every word with care and intention."
  },
  {
    icon: "💌",
    text: "We'd love to collaborate on a barter basis for now, with 1-year ad rights, because we're still small — but everything we send is packed with so much love."
  },
  {
    icon: "🤝",
    text: "We've set up one of the most generous affiliate models in the space — not just to reward effort, but because we believe you deserve more."
  },
  {
    icon: "💫",
    text: "Above all, this isn't a transaction — it's a relationship. One built on trust, creativity, and a shared dream to create something beautiful together."
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const BenefitsList = () => {
  return (
    <div>
      <p className="text-lg leading-relaxed mb-6">
        Here's a little about what this journey with us will look like:
      </p>
      
      <motion.ul 
        className="space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {benefits.map((benefit, index) => (
          <motion.li 
            key={index} 
            className="flex items-start"
            variants={item}
          >
            <span className="text-numourPurple text-2xl mr-3">{benefit.icon}</span>
            <p>{benefit.text}</p>
          </motion.li>
        ))}
      </motion.ul>
      
      <p className="mt-6 font-medium italic">
        If this feels aligned with you, we'd be so lucky to have you join us on this journey.
      </p>
    </div>
  );
};

export default BenefitsList;
