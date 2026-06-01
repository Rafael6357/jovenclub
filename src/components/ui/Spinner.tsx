import { Loader2 } from 'lucide-react'

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return <Loader2 className={`${s[size]} animate-spin`} />
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
    </div>
  )
}

export function FullScreenLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-400 mx-auto mb-4" />
        <p className="text-gray-100 text-lg font-medium">Cargando...</p>
      </div>
    </div>
  )
}
