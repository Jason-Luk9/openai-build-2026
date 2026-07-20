'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

export function SectionReveal({
  children,
  delay,
}: {
  children: ReactNode;
  delay: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.22, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
