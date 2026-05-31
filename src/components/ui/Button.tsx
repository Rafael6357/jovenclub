import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { classNames } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  children?: ReactNode
}

const variants = {
  primary: 'bg-primary-800 text-gray-950 hover:bg-primary-700 shadow-sm',
  secondary: 'bg-gray-800 text-gray-200 border border-gray-600 hover:bg-gray-700',
  danger: 'bg-red-700 text-white hover:bg-red-600',
  success: 'bg-green-700 text-white hover:bg-green-600',
  ghost: 'text-gray-400 hover:bg-gray-800',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }: Props) {
  return (
    <button
      className={classNames(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  )
}
