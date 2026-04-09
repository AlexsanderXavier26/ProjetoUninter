// Alexsander Xavier - 4338139
import { useEffect, useState } from 'react'
import { apiClient } from '@services/api'

export function useOrderStatus(orderId: string | undefined) {
  const [status, setStatus] = useState<string>('Pendente')

  useEffect(() => {
    if (!orderId) return
    let cancelled = false

    const fetch = async () => {
      try {
        const res = await apiClient.get<{ status: string }>(`/orders/${orderId}`)
        if (!cancelled && res.data.status) {
          setStatus(res.data.status)
        }
      } catch {
        // ignore
      }
    }

    fetch()
    const interval = setInterval(fetch, 5000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [orderId])

  return status
}
