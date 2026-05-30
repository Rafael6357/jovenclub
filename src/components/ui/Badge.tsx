import { classNames } from '../../lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
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
