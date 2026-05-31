import { classNames } from '../../lib/utils'

type Props = {
  name: string
  url?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' }

export function Avatar({ name, url, size = 'md', className }: Props) {
  if (url) {
    return <img src={url} alt={name} className={classNames('rounded-full object-cover', sizeMap[size], className)} />
  }
  return (
    <div className={classNames('rounded-full bg-primary-900 text-primary-300 flex items-center justify-center font-semibold', sizeMap[size], className)}>
      {name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
    </div>
  )
}
