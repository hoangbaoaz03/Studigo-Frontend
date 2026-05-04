"use client";

import { useState, useEffect } from "react";
import { usePreviewEdit } from "@/context/PreviewEditContext";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

interface EditablePriceProps {
    value: number;
    onSave: (val: number) => Promise<void>;
    className?: string;
    label?: string;
}

export default function EditablePrice({ value, onSave, className, label }: EditablePriceProps) {
    const { isEditMode, pendingChanges } = usePreviewEdit();
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(String(value));
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setTempValue(String(value));
    }, [value]);

    const handleSave = async () => {
        const numVal = parseFloat(tempValue);
        if (!isNaN(numVal) && numVal !== value) {
            setIsSaving(true);
            await onSave(numVal);
            setIsSaving(false);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") {
            setTempValue(String(value));
            setIsEditing(false);
        }
    };

    if (!isEditMode) {
        return <span className={className}>{formatPrice(value)}</span>;
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <Input
                    type="number"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className={cn("w-32 h-8", className)}
                />
                {isSaving && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
            </div>
        );
    }

    return (
        <div 
            onClick={() => setIsEditing(true)} 
            className={cn(
                "cursor-pointer hover:bg-gray-100 p-1 rounded dashed-border relative group",
                className
            )}
            title="Click to edit price"
        >
             {label && <span className="text-xs text-gray-500 block">{label}</span>}
            {formatPrice(value)}
             {isSaving && <Loader2 className="absolute right-1 top-1 h-3 w-3 animate-spin text-gray-500" />}
        </div>
    );
}
