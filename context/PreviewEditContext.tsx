"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
    updateCourse, 
    updateSection, 
    updateLecture, 
    createSection, 
    createLecture, 
    deleteSection, 
    deleteLecture, 
    CourseDetail, 
    Section, 
    Lecture,
    uploadCourseImage
} from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface PreviewEditContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  course: CourseDetail | null;
  setCourse: (course: CourseDetail) => void;
  
  // Field Updates
  saveCourseField: (field: string, value: any) => Promise<void>;
  saveSectionField: (sectionId: number, field: string, value: any) => Promise<void>;
  saveLectureField: (lectureId: number, field: string, value: any) => Promise<void>;
  
  // Image Update
  saveCourseImage: (file: File) => Promise<void>;

  // Array Updates (What you'll learn, Requirements)
  addItemToCourseList: (field: 'what_you_will_learn' | 'requirements', item: string) => Promise<void>;
  removeItemFromCourseList: (field: 'what_you_will_learn' | 'requirements', index: number) => Promise<void>;
  updateItemInCourseList: (field: 'what_you_will_learn' | 'requirements', index: number, value: string) => Promise<void>;

  // Content CRUD
  addSection: (title: string) => Promise<void>;
  removeSection: (sectionId: number) => Promise<void>;
  addLecture: (sectionId: number, title: string) => Promise<void>;
  removeLecture: (lectureId: number) => Promise<void>;
  updateLectureInState: (lecture: Lecture) => void;
  togglePublishStatus: () => Promise<void>;

  pendingChanges: boolean;
}

const PreviewEditContext = createContext<PreviewEditContextType | undefined>(undefined);

export function PreviewEditProvider({ children, initialCourse, isOwner }: { children: ReactNode, initialCourse: CourseDetail, isOwner: boolean }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [course, setCourse] = useState<CourseDetail>(initialCourse);
  const [pendingChanges, setPendingChanges] = useState(false);
  const { toast } = useToast();

  const toggleEditMode = () => {
    if (!isOwner) return;
    setIsEditMode(prev => !prev);
    if (!isEditMode) {
      toast({ title: "Edit Mode Enabled", description: "You can now edit content." });
    } else {
        toast({ title: "Edit Mode Disabled", description: "Preview mode active." });
    }
  };

  // --- Generic Field Updates ---
  const saveCourseField = async (field: string, value: any) => {
    if (!course) return;
    setPendingChanges(true);
    try {
      setCourse(prev => ({ ...prev, [field]: value }));
      await updateCourse(course.slug, { [field]: value });
      toast({ title: "Saved", description: "Course updated." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save.", variant: "destructive" });
    } finally {
      setPendingChanges(false);
    }
  };

  const saveSectionField = async (sectionId: number, field: string, value: any) => {
      setPendingChanges(true);
      try {
          setCourse(prev => ({
              ...prev,
              sections: prev.sections.map(s => s.id === sectionId ? { ...s, [field]: value } : s)
          }));
          await updateSection(sectionId, { [field]: value });
          toast({ title: "Saved", description: "Section updated." });
      } catch (error) {
          toast({ title: "Error", description: "Failed to update section.", variant: "destructive" });
      } finally {
          setPendingChanges(false);
      }
  }

  const saveLectureField = async (lectureId: number, field: string, value: any) => {
      setPendingChanges(true);
      try {
          setCourse(prev => ({
              ...prev,
              sections: prev.sections.map(s => ({
                  ...s,
                  lectures: s.lectures.map(l => l.id === lectureId ? { ...l, [field]: value } : l)
              }))
          }));
          await updateLecture(lectureId, { [field]: value });
          toast({ title: "Saved", description: "Lecture updated." });
      } catch (error) {
          toast({ title: "Error", description: "Failed to update lecture.", variant: "destructive" });
      } finally {
          setPendingChanges(false);
      }
  }

  const saveCourseImage = async (file: File) => {
      if (!course) return;
      setPendingChanges(true);
      try {
          const updatedCourse = await uploadCourseImage(course.slug, file);
          setCourse(prev => ({ ...prev, thumbnail: updatedCourse.thumbnail }));
          toast({ title: "Saved", description: "Image updated." });
      } catch (error) {
          console.error(error);
          toast({ title: "Error", description: "Failed to upload image.", variant: "destructive" });
      } finally {
          setPendingChanges(false);
      }
  };

  // --- Array List Updates ---
  const addItemToCourseList = async (field: 'what_you_will_learn' | 'requirements', item: string) => {
      if (!course) return;
      const newList = [...(course[field] || []), item];
      await saveCourseField(field, newList);
  };

  const removeItemFromCourseList = async (field: 'what_you_will_learn' | 'requirements', index: number) => {
      if (!course) return;
      const newList = [...(course[field] || [])];
      newList.splice(index, 1);
      await saveCourseField(field, newList);
  };

  const updateItemInCourseList = async (field: 'what_you_will_learn' | 'requirements', index: number, value: string) => {
      if (!course) return;
      const newList = [...(course[field] || [])];
      newList[index] = value;
      await saveCourseField(field, newList);
  };

  // --- Content CRUD ---
  const addSection = async (title: string) => {
      if (!course) return;
      setPendingChanges(true);
      try {
          const newSection: Section = await createSection({ 
              course: course.id, 
              title, 
              order: course.sections.length 
          });
          setCourse(prev => ({
              ...prev,
              sections: [...prev.sections, newSection]
          }));
          toast({ title: "Success", description: "Section created." });
      } catch (error) {
          console.error(error);
          toast({ title: "Error", description: "Failed to create section.", variant: "destructive" });
      } finally {
          setPendingChanges(false);
      }
  };

  const removeSection = async (sectionId: number) => {
      if (!confirm("Are you sure you want to delete this section and all its lectures?")) return;
      setPendingChanges(true);
      try {
          setCourse(prev => ({
              ...prev,
              sections: prev.sections.filter(s => s.id !== sectionId)
          }));
          await deleteSection(sectionId);
          toast({ title: "Deleted", description: "Section deleted." });
      } catch (error) {
           toast({ title: "Error", description: "Failed to delete section.", variant: "destructive" });
           // Re-fetch course ideally
      } finally {
          setPendingChanges(false);
      }
  };

  const addLecture = async (sectionId: number, title: string) => {
      if (!course) return;
      setPendingChanges(true);
      try {
          // Find max order
          const section = course.sections.find(s => s.id === sectionId);
          const order = section ? section.lectures.length : 0;

          const newLecture: Lecture = await createLecture({ 
              section: sectionId, 
              title, 
              order,
              lecture_type: 'video', 
              status: 'draft',
              is_preview: false
          });
          
          setCourse(prev => ({
              ...prev,
              sections: prev.sections.map(s => 
                  s.id === sectionId ? { ...s, lectures: [...s.lectures, newLecture] } : s
              )
          }));
          toast({ title: "Success", description: "Lecture created." });
      } catch (error) {
          console.error(error);
          toast({ title: "Error", description: "Failed to create lecture.", variant: "destructive" });
      } finally {
          setPendingChanges(false);
      }
  };

  const removeLecture = async (lectureId: number) => {
      if (!confirm("Delete this lecture?")) return;
      setPendingChanges(true);
      try {
          setCourse(prev => ({
              ...prev,
              sections: prev.sections.map(s => ({
                  ...s,
                  lectures: s.lectures.filter(l => l.id !== lectureId)
              }))
          }));
          await deleteLecture(lectureId);
          toast({ title: "Deleted", description: "Lecture deleted." });
      } catch (error) {
          toast({ title: "Error", description: "Failed to delete lecture.", variant: "destructive" });
      } finally {
          setPendingChanges(false);
      }
  };

  const updateLectureInState = (updatedLecture: Lecture) => {
      if (!course) return;
      setCourse(prev => ({
          ...prev,
          sections: prev.sections.map(s => ({
              ...s,
              lectures: s.lectures.map(l => l.id === updatedLecture.id ? updatedLecture : l)
          }))
      }));
  };

  const togglePublishStatus = async () => {
      if (!course) return;
      
      const newStatus = course.status === 'published' ? 'draft' : 'published';
      const confirmMessage = newStatus === 'published' 
          ? "Are you sure you want to publish this course?" 
          : "Are you sure you want to unpublish this course?";

      if (!confirm(confirmMessage)) return;

      setPendingChanges(true);
      try {
          await updateCourse(course.slug, { status: newStatus });
          setCourse(prev => ({ ...prev, status: newStatus }));
          toast({ 
              title: newStatus === 'published' ? "Published!" : "Unpublished", 
              description: `Course is now ${newStatus}.` 
          });
      } catch (error) {
          toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
      } finally {
          setPendingChanges(false);
      }
  };

  return (
    <PreviewEditContext.Provider value={{ 
        isEditMode, 
        toggleEditMode, 
        course, 
        setCourse, 
        saveCourseField, 
        saveSectionField, 
        saveLectureField,
        saveCourseImage,
        addItemToCourseList,
        removeItemFromCourseList,
        updateItemInCourseList,
        addSection,
        removeSection,
        addLecture,
        removeLecture,
        updateLectureInState,
        togglePublishStatus,
        pendingChanges 
    }}>
      {children}
    </PreviewEditContext.Provider>
  );
}

export function usePreviewEdit() {
  const context = useContext(PreviewEditContext);
  if (context === undefined) {
    throw new Error("usePreviewEdit must be used within a PreviewEditProvider");
  }
  return context;
}
