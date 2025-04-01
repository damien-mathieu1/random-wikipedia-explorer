import * as React from "react"
import { useToast as useToastPrimitive } from "@/components/ui/toast"

export interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const { toast } = useToastPrimitive()

  return {
    toast: (props: ToastProps) => {
      toast({
        ...props,
        className: props.variant === "destructive" ? "bg-destructive text-destructive-foreground" : "",
      })
    },
  }
}
