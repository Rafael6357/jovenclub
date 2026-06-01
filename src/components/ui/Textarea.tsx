import { type TextareaHTMLAttributes, forwardRef } from 'react'
import { classNames } from '../../lib/utils'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(({ label, error, className, id, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <textarea
        ref={ref}
        id={id}
        className={classNames(
          'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors resize-vertical min-h-[100px] bg-gray-900 text-gray-100',
          error ? 'border-red-500' : 'border-gray-700',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  )
})

Textarea.displayName = 'Textarea'
