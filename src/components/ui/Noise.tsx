"use client";

import React from "react";

export function Noise() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: 0.05,
        background: `url("https://res.cloudinary.com/dzf9rq99v/image/upload/v1624312521/noise_ovvsmf.png")`,
      }}
    />
  );
}
