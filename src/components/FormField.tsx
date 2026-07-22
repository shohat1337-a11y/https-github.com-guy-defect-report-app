"use client";

import { ReactNode } from "react";

interface FieldWrapperProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, required, error, children }: FieldWrapperProps) {
  return (
    <div className="mb-4">
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}

const baseInputClass =
  "w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100";

interface TextInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  inputMode?: "text" | "numeric";
}

export function TextInput({ id, name, value, onChange, placeholder, type = "text", error }: TextInputProps) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${baseInputClass} ${error ? "border-red-400" : "border-slate-300"}`}
    />
  );
}

interface TextAreaProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
}

export function TextArea({ id, name, value, onChange, placeholder, rows = 3, error }: TextAreaProps) {
  return (
    <textarea
      id={id}
      name={name}
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${baseInputClass} resize-y ${error ? "border-red-400" : "border-slate-300"}`}
    />
  );
}

interface SelectProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  error?: string;
}

export function Select({ id, name, value, onChange, options, error }: SelectProps) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${baseInputClass} ${error ? "border-red-400" : "border-slate-300"}`}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
