"use client";

import { useState, useEffect, useRef } from "react";
import { usePreviewEdit } from "@/context/PreviewEditContext";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface EditableTextareaProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
  placeholder?: string;
}

export default function EditableTextarea({ value, onSave, className, placeholder }: EditableTextareaProps) {
  const { isEditMode } = usePreviewEdit();
  const [localValue, setLocalValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

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

  if (!isEditMode) {
    return <div className={className}>{value || placeholder}</div>;
  }

  return (
    <div className="relative w-full">
      <Textarea
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        className={cn(
          "border-dashed border-2 border-amber-400 bg-amber-50/10 min-h-[100px] w-full",
          className
        )}
        placeholder={placeholder}
      />
      {isSaving && (
        <span className="absolute right-2 bottom-2 text-xs text-amber-600 animate-pulse bg-white px-1 rounded">
          Saving...
        </span>
      )}
    </div>
  );
}
