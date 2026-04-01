'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  circle?: boolean;
}

export default function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = 8,
  className = '',
  circle = false,
}: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-bg2 ${className}`}
      style={{
        width,
        height,
        borderRadius: circle ? '50%' : borderRadius,
      }}
    >
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        style={{
          width: '50%',
        }}
      />
    </div>
  );
}
