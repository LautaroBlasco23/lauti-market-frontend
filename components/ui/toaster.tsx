'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { CheckCircle, AlertCircle, Info } from 'lucide-react'

export function Toaster() {
  const { toasts } = useToast()

  const getIcon = (variant?: 'default' | 'destructive' | 'success') => {
    switch (variant) {
      case 'destructive':
        return <AlertCircle className="h-5 w-5 shrink-0 text-current opacity-90" />
      case 'success':
        return <CheckCircle className="h-5 w-5 shrink-0 text-current opacity-90" />
      default:
        return <Info className="h-5 w-5 shrink-0 text-current opacity-70" />
    }
  }

  return (
    <ToastProvider swipeDirection="up">
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex items-start gap-3 w-full">
              {getIcon(props.variant)}
              <div className="grid gap-0.5 flex-1 min-w-0">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
