"use client";

import { usePreviewEdit } from "@/context/PreviewEditContext";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import EditableText from "./EditableText";

interface EditableListProps {
  items: string[];
  field: 'what_you_will_learn' | 'requirements';
  className?: string;
  itemClassName?: string; // Class for <li> or item wrapper
  listType?: 'ul' | 'div'; // semantic HTML element to use
  prefix?: React.ReactNode; // Content to show before each item (e.g. checkmark)
}

export default function EditableList({ items = [], field, className, itemClassName, listType = 'div', prefix }: EditableListProps) {
  const { isEditMode, addItemToCourseList, removeItemFromCourseList, updateItemInCourseList } = usePreviewEdit();

  if (!isEditMode) {
    if (listType === 'ul') {
        return (
            <ul className={className}>
                {items.map((item, idx) => (
                    <li key={idx} className={itemClassName}>
                        {prefix && <span className="mr-2">{prefix}</span>}
                        {item}
                    </li>
                ))}
            </ul>
        );
    }
    return (
        <div className={className}>
            {items.map((item, idx) => (
                <div key={idx} className={itemClassName}>
                    {prefix && <span className="mr-2">{prefix}</span>}
                    <span>{item}</span>
                </div>
            ))}
        </div>
    );
  }

  // Edit Mode Render
  return (
    <div className="space-y-2">
      <div className={className}>
        {items.map((item, idx) => (
          <div key={idx} className={`flex items-start gap-2 group ${listType === 'ul' ? 'mb-2' : ''}`}>
             <div className="flex-1 flex gap-2 items-center">
                 {prefix && <span className="mr-2 opacity-50">{prefix}</span>}
                <EditableText
                    value={item}
                    onSave={(val) => updateItemInCourseList(field, idx, val)}
                    className={`w-full ${itemClassName}`}
                />
             </div>
             <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeItemFromCourseList(field, idx)}
            >
                <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        className="mt-2 text-amber-600 border-amber-200 hover:bg-amber-50"
        onClick={() => addItemToCourseList(field, "New item")}
      >
        <Plus className="h-4 w-4 mr-1" /> Add New Item
      </Button>
    </div>
  );
}
