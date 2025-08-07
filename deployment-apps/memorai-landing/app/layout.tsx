import React from 'react'
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MemorAI - AI-Powered Memory Management",
  description: "Professional AI-powered memory and knowledge management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

