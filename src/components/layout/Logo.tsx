"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = "", iconOnly = false, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', gap: 'gap-2' },
    md: { icon: 'w-10 h-10', text: 'text-2xl', gap: 'gap-3' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl', gap: 'gap-4' },
    xl: { icon: 'w-20 h-20', text: 'text-5xl', gap: 'gap-6' },
  };

  const { icon: iconSize, text: textSize, gap } = sizeClasses[size];

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      <motion.div 
        whileHover={{ scale: 1.05, rotate: 5 }}
        className={`${iconSize} relative shrink-0`}
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Hexagon Background */}
          <path 
            d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z" 
            fill="currentColor" 
            fillOpacity="0.1"
            className="text-primary"
          />
          {/* Hexagon Border */}
          <path 
            d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinejoin="round"
            className="text-primary"
          />
          {/* Stylized 'H' and Pulse */}
          <path 
            d="M35 35V65M65 35V65M35 50H65M25 50H30L35 40L45 60L55 40L65 60L70 50H75" 
            stroke="currentColor" 
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-primary"
          />
          {/* Glow Effect */}
          <circle cx="50" cy="50" r="30" fill="currentColor" fillOpacity="0.05" className="text-primary animate-pulse" />
        </svg>
      </motion.div>
      
      {!iconOnly && (
        <span className={`font-display font-bold tracking-tighter uppercase ${textSize} text-foreground`}>
          Health<span className="text-primary">Nex</span>
        </span>
      )}
    </div>
  );
}
