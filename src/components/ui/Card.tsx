import { type ReactNode } from 'react'
import { classNames } from '../../lib/utils'

type Props = {
  children: ReactNode
  className?: string
  padding?: boolean
}

export function Card({ children, className, padding = true }: Props) {
  return (
    <div className={classNames('bg-gray-800 rounded-xl shadow-sm shadow-black/30 border border-gray-700', padding && 'p-6', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={classNames('mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={classNames('text-lg font-semibold text-gray-100', className)}>{children}</h3>
}
