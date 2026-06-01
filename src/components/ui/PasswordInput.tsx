import { useState, forwardRef, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { classNames } from '../../lib/utils'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
  error?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, Props>(({ label, error, className, id, ...props }, ref) => {
  const [show, setShow] = useState(false)
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={show ? 'text' : 'password'}
          className={classNames(
            'w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors bg-gray-900 text-gray-100',
            error ? 'border-red-500' : 'border-gray-700',
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-200 focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  )
})

PasswordInput.displayName = 'PasswordInput'
