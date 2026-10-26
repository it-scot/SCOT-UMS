import { motion } from "framer-motion";

export function FilterBar<T extends string>({
  options,
  value,
  onChange,
  layoutId,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-muted p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className="relative rounded-lg px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-200"
        >
          {value === option && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-[#0f1b33]"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          )}
          <span className="relative">{option}</span>
        </button>
      ))}
    </div>
  );
}
