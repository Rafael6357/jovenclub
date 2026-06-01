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
  primary: 'bg-primary-700 text-white hover:bg-primary-600 shadow-sm focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950',
  secondary: 'bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950',
  danger: 'bg-red-700 text-white hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950',
  success: 'bg-green-700 text-white hover:bg-green-600 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950',
  ghost: 'text-gray-400 hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950',
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
