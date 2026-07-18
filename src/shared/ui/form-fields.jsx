import * as React from "react"
import { AlertCircle } from "lucide-react"
import { cn } from "@/shared/utils/utils"
import { motion } from "framer-motion"

/**
 * Text field component integrated with React Hook Form
 */
export const TextField = React.forwardRef(({
  label,
  name,
  type = "text",
  error,
  icon: Icon,
  className,
  containerClassName,
  rightElement,
  variant = "dark",
  ...props
}, ref) => {
  const isDark = variant === "dark";
  return (
    <div className={cn("flex flex-col space-y-1.5 w-full", containerClassName)}>
      {label && (
        <label
          htmlFor={name}
          className={cn(
            "text-sm font-semibold ml-1",
            isDark ? "text-white/70" : "text-slate-700"
          )}
        >
          {label}
        </label>
      )}
      <motion.div 
        whileHover={{ scale: 1.002 }}
        whileTap={{ scale: 0.998 }}
        className="relative flex items-center group w-full"
      >
        {Icon && (
          <div
            className={cn(
              "absolute left-3 transition-colors pointer-events-none",
              isDark ? "text-white/40 group-focus-within:text-accent" : "text-[#717171] group-focus-within:text-[#222222]"
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          ref={ref}
          className={cn(
            "w-full transition-all h-12 rounded-xl text-sm outline-none border",
            isDark 
              ? "bg-white/5 border-white/10 focus:border-accent focus:bg-white/10 text-white placeholder:text-white/30" 
              : "bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:bg-white text-slate-900 placeholder:text-[#717171]",
            Icon ? "pl-10" : "pl-4",
            rightElement ? "pr-12" : "pr-4",
            error 
              ? (isDark ? "border-accent focus:ring-1 focus:ring-accent/50" : "border-red-500 focus:ring-1 focus:ring-red-500/50") 
              : (isDark ? "focus:ring-2 focus:ring-accent/10" : "focus:ring-2 focus:ring-slate-100"),
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </motion.div>
      {error && (
        <p className={cn(
          "text-xs mt-1 flex items-center gap-1.5 font-medium ml-1",
          isDark ? "text-accent" : "text-red-500"
        )}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error.message}
        </p>
      )}
    </div>
  )
})
TextField.displayName = "TextField"

/**
 * Textarea field component integrated with React Hook Form
 */
export const TextareaField = React.forwardRef(({
  label,
  name,
  error,
  className,
  containerClassName,
  maxLength = 500,
  charCount = 0,
  variant = "dark",
  ...props
}, ref) => {
  const isDark = variant === "dark";
  return (
    <div className={cn("flex flex-col space-y-1.5 w-full", containerClassName)}>
      {label && (
        <label
          htmlFor={name}
          className={cn(
            "text-sm font-semibold ml-1",
            isDark ? "text-white/70" : "text-slate-700"
          )}
        >
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        ref={ref}
        rows={6}
        maxLength={maxLength}
        className={cn(
          "w-full transition-all rounded-xl p-4 text-sm outline-none resize-none border",
          isDark
            ? "bg-white/5 border-white/10 focus:border-emerald-400 focus:bg-white/10 text-white placeholder:text-white/30"
            : "bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:bg-white text-slate-900 placeholder:text-[#717171]",
          error
            ? (isDark ? "border-accent focus:ring-1 focus:ring-accent/50" : "border-red-500 focus:ring-1 focus:ring-red-500/50")
            : (isDark ? "focus:ring-2 focus:ring-emerald-400/10" : "focus:ring-2 focus:ring-slate-100"),
          className
        )}
        {...props}
      />
      <div className="flex justify-between items-center px-1">
        {error ? (
          <p className={cn(
            "text-xs flex items-center gap-1.5 font-medium",
            isDark ? "text-accent" : "text-red-500"
          )}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error.message}
          </p>
        ) : (
          <span />
        )}
        {maxLength && (
          <p className={cn(
            "text-xs font-medium",
            isDark ? "text-white/40" : "text-[#717171]"
          )}>{charCount}/{maxLength} characters</p>
        )}
      </div>
    </div>
  )
})
TextareaField.displayName = "TextareaField"

/**
 * Select field component integrated with React Hook Form
 */
export const SelectField = React.forwardRef(({
  label,
  name,
  error,
  options = [],
  className,
  containerClassName,
  placeholder = "Select an option",
  variant = "dark",
  ...props
}, ref) => {
  const isDark = variant === "dark";
  return (
    <div className={cn("flex flex-col space-y-1.5 w-full", containerClassName)}>
      {label && (
        <label
          htmlFor={name}
          className={cn(
            "text-sm font-semibold ml-1",
            isDark ? "text-white/70" : "text-slate-700"
          )}
        >
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        ref={ref}
        className={cn(
          "w-full h-12 px-4 rounded-xl transition-all outline-none text-sm cursor-pointer border",
          isDark
            ? "bg-white/5 border-white/10 focus:border-emerald-400 focus:bg-white/10 text-white"
            : "bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:bg-white text-slate-900",
          error ? (isDark ? "border-accent" : "border-red-500") : "",
          className
        )}
        {...props}
      >
        <option value="" className={isDark ? "bg-[#0A1C30] text-white" : "bg-white text-slate-900"}>{placeholder}</option>
        {options.map(opt => {
          const val = typeof opt === "string" ? opt : opt.value;
          const lbl = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={val} value={val} className={isDark ? "bg-[#0A1C30] text-white" : "bg-white text-slate-900"}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && (
        <p className={cn(
          "text-xs mt-1 flex items-center gap-1.5 font-medium ml-1",
          isDark ? "text-accent" : "text-red-500"
        )}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error.message}
        </p>
      )}
    </div>
  )
})
SelectField.displayName = "SelectField"

/**
 * Checkbox field component integrated with React Hook Form
 */
export const CheckboxField = React.forwardRef(({
  label,
  name,
  error,
  className,
  containerClassName,
  variant = "dark",
  ...props
}, ref) => {
  const isDark = variant === "dark";
  return (
    <div className={cn("flex flex-col space-y-1.5", containerClassName)}>
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          id={name}
          name={name}
          type="checkbox"
          ref={ref}
          className={cn(
            "mt-1 w-4 h-4 rounded focus:ring-offset-0 border",
            isDark
              ? "border-white/20 bg-white/10 text-accent focus:ring-accent"
              : "border-slate-300 bg-slate-50 text-slate-700 focus:ring-slate-500",
            className
          )}
          {...props}
        />
        <span
          className={cn(
            "text-sm transition-colors selection:bg-accent/30",
            isDark
              ? "text-white/60 group-hover:text-white/80"
              : "text-[#222222] group-hover:text-slate-800"
          )}
        >
          {label}
        </span>
      </label>
      {error && (
        <p className={cn(
          "text-xs mt-1.5 flex items-center gap-1.5 font-medium ml-7",
          isDark ? "text-accent" : "text-red-500"
        )}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error.message}
        </p>
      )}
    </div>
  )
})
CheckboxField.displayName = "CheckboxField"
