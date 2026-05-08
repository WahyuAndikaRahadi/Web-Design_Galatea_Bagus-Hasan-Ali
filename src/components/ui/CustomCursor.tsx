"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function CustomCursor() {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  // Extra smooth spring settings for the trail
  const mainSpring = { damping: 40, stiffness: 400 };
  const trailSpring1 = { damping: 35, stiffness: 200 };
  const trailSpring2 = { damping: 30, stiffness: 150 };
  const trailSpring3 = { damping: 25, stiffness: 100 };

  const xMain = useSpring(mouseX, mainSpring);
  const yMain = useSpring(mouseY, mainSpring);
  
  const xT1 = useSpring(mouseX, trailSpring1);
  const yT1 = useSpring(mouseY, trailSpring1);
  
  const xT2 = useSpring(mouseX, trailSpring2);
  const yT2 = useSpring(mouseY, trailSpring2);
  
  const xT3 = useSpring(mouseX, trailSpring3);
  const yT3 = useSpring(mouseY, trailSpring3);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", moveCursor);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Small Trail Dot 3 */}
      <motion.div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 8,
          height: 8,
          backgroundColor: "rgba(0, 71, 255, 0.3)",
          border: "1px solid #000",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9996,
          x: xT3,
          y: yT3,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      {/* Small Trail Dot 2 */}
      <motion.div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 10,
          height: 10,
          backgroundColor: "rgba(255, 77, 77, 0.4)",
          border: "1px solid #000",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9997,
          x: xT2,
          y: yT2,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      {/* Small Trail Dot 1 */}
      <motion.div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 12,
          height: 12,
          backgroundColor: "rgba(0, 211, 127, 0.5)",
          border: "1px solid #000",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9998,
          x: xT1,
          y: yT1,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      
      {/* Main Cursor */}
      <motion.div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 24,
          height: 24,
          backgroundColor: "rgba(255, 229, 0, 0.7)",
          border: "2px solid #000",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
          x: xMain,
          y: yMain,
          translateX: "-50%",
          translateY: "-50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 4, height: 4, backgroundColor: "#000", borderRadius: "50%" }} />
      </motion.div>
    </>
  );
}
