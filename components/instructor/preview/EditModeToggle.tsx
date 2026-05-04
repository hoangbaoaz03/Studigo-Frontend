"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePreviewEdit } from "@/context/PreviewEditContext";
import { Pencil, Eye } from "lucide-react";

export default function EditModeToggle() {
  const { isEditMode, toggleEditMode } = usePreviewEdit();

  return (
    <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-lg border border-gray-200">
      <Switch
        id="edit-mode"
        checked={isEditMode}
        onCheckedChange={toggleEditMode}
        className="data-[state=checked]:bg-amber-500"
      />
      <Label htmlFor="edit-mode" className="text-gray-900 font-bold cursor-pointer flex items-center gap-2">
        {isEditMode ? (
          <>
            <Pencil className="h-4 w-4 text-amber-600" />
            <span>Editing</span>
          </>
        ) : (
          <>
            <Eye className="h-4 w-4 text-gray-600" />
            <span>Preview</span>
          </>
        )}
      </Label>
    </div>
  );
}
