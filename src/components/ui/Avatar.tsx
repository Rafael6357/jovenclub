import { classNames, getInitials } from '../../lib/utils'

type Props = {
  nombre: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
}

export function Avatar({ nombre, size = 'md', className }: Props) {
  return (
    <div className={classNames(
      'rounded-full bg-primary-100 text-primary-800 font-semibold flex items-center justify-center flex-shrink-0',
      sizes[size],
      className
    )}>
      {getInitials(nombre)}
    </div>
  )
}
