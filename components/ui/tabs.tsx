"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

// If Radix is not installed, we can fall back to a simple state-based tab implementation.
// Assuming Radix might not be installed, I'll build a simple custom one to be safe.

// BUT wait, if I use a custom one, I need to match the API used in LearningTabs.
// <Tabs defaultValue...>, <TabsList>, <TabsTrigger>, <TabsContent>

/* Simple Context-based Tabs Implementation */

interface TabsContextValue {
    value: string;
    onValueChange: (value: string) => void;
}
const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export function Tabs({ defaultValue, value, onValueChange, children, className }: any) {
    const [stateValue, setStateValue] = React.useState(defaultValue || "");
    
    const currentValue = value !== undefined ? value : stateValue;
    const handleValueChange = React.useCallback((val: string) => {
        setStateValue(val);
        onValueChange?.(val);
    }, [onValueChange]);

    return (
        <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
            <div className={cn("", className)}>{children}</div>
        </TabsContext.Provider>
    );
}

export function TabsList({ className, children }: any) {
    return (
        <div className={cn("inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)}>
            {children}
        </div>
    );
}

export function TabsTrigger({ value, children, className }: any) {
    const context = React.useContext(TabsContext);
    const isActive = context?.value === value;
    
    return (
        <button
            type="button"
            onClick={() => context?.onValueChange(value)}
            data-state={isActive ? "active" : "inactive"}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive && "text-foreground", 
                // We need to support the custom className passed from LearningTabs
                className
            )}
        >
            {children}
        </button>
    );
}

export function TabsContent({ value, children, className }: any) {
    const context = React.useContext(TabsContext);
    if (context?.value !== value) return null;
    
    return (
        <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>
            {children}
        </div>
    );
}
