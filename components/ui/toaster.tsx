"use client"

import { useToast } from "@/components/ui/use-toast"
import { CheckCircle2, XCircle, X } from "lucide-react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(function ({ id, title, description, variant, ...props }) {
        return (
            <div 
                key={id} 
                className={`
                    group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all 
                    ${variant === 'destructive' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-white border-gray-200 text-gray-900'}
                `}
            >
                <div className="flex gap-3">
                     {variant === 'destructive' ? <XCircle className="h-5 w-5 text-red-600" /> : <CheckCircle2 className="h-5 w-5 text-green-600" />}
                     <div className="grid gap-1">
                        {title && <h3 className="font-semibold">{title}</h3>}
                        {description && <div className="text-sm opacity-90">{description}</div>}
                    </div>
                </div>
                <button 
                  onClick={() => dismiss(id)}
                  className="absolute right-2 top-2 rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/5"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        )
      })}
    </div>
  )
}
