"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function NoiseTexture() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 0.05,
        zIndex: 9999,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Ffilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

export function GridPattern() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
        opacity: 0.1,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

export function FloatingShape({ 
  color = "#FFE500", 
  size = 100, 
  top, 
  left, 
  right, 
  bottom, 
  type = "circle",
  delay = 0 
}: { 
  color?: string; 
  size?: number; 
  top?: string; 
  left?: string; 
  right?: string; 
  bottom?: string; 
  type?: "circle" | "square" | "triangle";
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ y: 0, rotate: 0 }}
      animate={{ 
        y: [0, -20, 0],
        rotate: type === "circle" ? 0 : [0, 10, -10, 0]
      }}
      transition={{ 
        duration: 5 + Math.random() * 2, 
        repeat: Infinity, 
        ease: "easeInOut",
        delay 
      }}
      style={{
        position: "absolute",
        top,
        left,
        right,
        bottom,
        width: size,
        height: size,
        background: type === "triangle" ? "transparent" : color,
        border: type === "triangle" ? "none" : "3px solid #000",
        borderRadius: type === "circle" ? "50%" : "4px",
        zIndex: -1,
        opacity: 0.4,
        pointerEvents: "none",
        ...(type === "triangle" ? {
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
          filter: "drop-shadow(2px 2px 0px #000)"
        } : {})
      }}
    />
  );
}

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
} as const;

export function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <motion.span 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="section-label"
            style={{ 
                display: "inline-block",
                background: "#000",
                color: "#FFE500",
                padding: "4px 12px",
                fontWeight: 900,
                fontSize: "12px",
                borderRadius: "4px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "8px"
            }}
        >
            {children}
        </motion.span>
    );
}
