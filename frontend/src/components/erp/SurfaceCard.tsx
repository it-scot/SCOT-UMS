import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { cardClass } from "@/utils/styles";

export function SurfaceCard({
  children,
  className,
  delay = 0,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  tone?: "default" | "brand";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeInOut" }}
      className={cn(
        tone === "brand"
          ? "rounded-2xl border border-transparent bg-gradient-navy p-5 text-primary-foreground shadow-lg"
          : cn(cardClass, "p-5 hover:shadow-md"),
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
