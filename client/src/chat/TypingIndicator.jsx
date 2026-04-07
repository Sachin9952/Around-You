import React from "react";
import { motion } from "framer-motion";

/**
 * TypingIndicator — Animated "User is typing..." bubble.
 * Shows three bouncing dots inside a receiver-style bubble.
 *
 * Props:
 *  @param {string} userName — name of the user who is typing
 */
const TypingIndicator = ({ userName = "User" }) => {
  const dotVariants = {
    animate: (i) => ({
      y: [0, -5, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        delay: i * 0.15,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-start"
    >
      <div className="bg-dark-600/80 border border-dark-500/40 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg shadow-black/10">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              custom={i}
              variants={dotVariants}
              animate="animate"
              className="w-2 h-2 rounded-full bg-primary-400"
            />
          ))}
        </div>
      </div>
      <span className="text-[10px] text-dark-200/50 mt-0.5 ml-1 select-none">
        {userName} is typing...
      </span>
    </motion.div>
  );
};

export default TypingIndicator;
