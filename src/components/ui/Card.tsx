import { type ReactNode } from 'react'
import { classNames } from '../../lib/utils'

type Props = {
  children: ReactNode
  className?: string
  padding?: boolean
}

export function Card({ children, className, padding = true }: Props) {
  return (
    <div className={classNames('bg-white rounded-xl shadow-sm border border-gray-200', padding && 'p-6', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={classNames('mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={classNames('text-lg font-semibold text-gray-900', className)}>{children}</h3>
}
