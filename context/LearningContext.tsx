"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface CourseHeaderData {
  title: string;
  progress: number;
  slug: string;
}

interface LearningContextType {
  course: CourseHeaderData | null;
  setCourse: (course: CourseHeaderData | null) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export function LearningProvider({ children }: { children: ReactNode }) {
  const [course, setCourse] = useState<CourseHeaderData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  
  // Auto-close sidebar on mobile when course is cleared (navigating away) is handled by component unmounts usually, 
  // but good to reset state if needed. For now, simple state is enough.

  return (
    <LearningContext.Provider
      value={{
        course,
        setCourse,
        isSidebarOpen,
        setSidebarOpen: setIsSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error("useLearning must be used within a LearningProvider");
  }
  return context;
}
