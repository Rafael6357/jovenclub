import { useState, useEffect, useCallback } from 'react'

export function useLiveQuery<T>(queryFn: () => Promise<T>, deps: unknown[] = []): T | undefined {
  const [data, setData] = useState<T | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const result = await queryFn()
      setData(result)
    } catch (e) {
      console.error('useLiveQuery error:', e)
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    refresh()
  }, [refresh])

  return data
}
