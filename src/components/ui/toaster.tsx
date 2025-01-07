"use client"

import { Toast, ToastProvider, ToastViewport, type ToastProps } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function (props: ToastProps) {
        return <Toast key={props.id} {...props} />
      })}
      <ToastViewport />
    </ToastProvider>
  )
} 