"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

interface MagnetWrapperProps {
  children: React.ReactNode;
  strength?: number;
}

export function MagnetWrapper({ children, strength = 20 }: MagnetWrapperProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const ySpring = useSpring(y, { stiffness: 150, damping: 15 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Since background elements are absolute, we use window cursor pos 
      // but relative to some "imaginary" center or just direct window pos
      // Actually a better magnet for background is to respond to global cursor
      const { innerWidth, innerHeight } = window;
      const centerX = innerWidth / 2;
      const centerY = innerHeight / 2;

      const offsetX = (e.clientX - centerX) / (innerWidth / 2);
      const offsetY = (e.clientY - centerY) / (innerHeight / 2);

      x.set(offsetX * strength);
      y.set(offsetY * strength);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y, strength]);

  return (
    <motion.div style={{ x: xSpring, y: ySpring }}>
      {children}
    </motion.div>
  );
}
