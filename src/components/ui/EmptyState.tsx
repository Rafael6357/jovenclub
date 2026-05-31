import { Inbox } from 'lucide-react'

type Props = {
  icon?: React.ReactNode
  title: string
  description?: string
}

export function EmptyState({ icon, title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      {icon || <Inbox className="w-12 h-12 mb-4 text-gray-600" />}
      <h3 className="text-lg font-medium text-gray-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  )
}
