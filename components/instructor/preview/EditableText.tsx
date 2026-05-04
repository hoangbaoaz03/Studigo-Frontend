"use client";

import { useState, useEffect, useRef } from "react";
import { usePreviewEdit } from "@/context/PreviewEditContext";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
  placeholder?: string;
}

export default function EditableText({ value, onSave, className, placeholder }: EditableTextProps) {
  const { isEditMode } = usePreviewEdit();
  const [localValue, setLocalValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = async () => {
    if (localValue !== value) {
      setIsSaving(true);
      await onSave(localValue);
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
  };

  if (!isEditMode) {
    return <span className={className}>{value || placeholder}</span>;
  }

  return (
    <div className="relative group">
      <Input
        ref={inputRef}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "border-dashed border-2 border-amber-400 bg-amber-50/10 text-inherit px-1 py-0 h-auto focus:ring-0 focus:border-solid",
          className
        )}
        placeholder={placeholder}
      />
      {isSaving && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-amber-600 animate-pulse">
          Saving...
        </span>
      )}
    </div>
  );
}
