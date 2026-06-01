import { type SelectHTMLAttributes, forwardRef } from 'react'
import { classNames } from '../../lib/utils'

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, Props>(({ label, error, options, placeholder, className, id, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <select
        ref={ref}
        id={id}
        className={classNames(
          'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors bg-gray-900 text-gray-100',
          error ? 'border-red-500' : 'border-gray-700',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  )
})

Select.displayName = 'Select'
