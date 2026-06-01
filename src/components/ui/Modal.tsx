import { type ReactNode } from 'react'
import { X } from 'lucide-react'
import { classNames } from '../../lib/utils'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }

export function Modal({ open, onClose, title, children, size = 'md' }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={classNames('relative bg-gray-800 rounded-xl shadow-xl shadow-black/30 w-full mx-4 max-h-[90vh] overflow-y-auto', sizeMap[size])}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-200 focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
