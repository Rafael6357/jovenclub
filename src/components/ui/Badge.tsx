import { classNames } from '../../lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-gray-700 text-gray-200',
  success: 'bg-green-900 text-green-300',
  warning: 'bg-yellow-900 text-yellow-300',
  danger: 'bg-red-900 text-red-300',
  info: 'bg-blue-900 text-blue-300',
}

type Props = {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className }: Props) {
  return (
    <span className={classNames(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      badgeVariants[variant],
      className
    )}>
      {children}
    </span>
  )
}
