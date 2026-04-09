// Alexsander Xavier - 4338139
import { useEffect, useState } from 'react'
import { unitService, Unit } from '@services/unitService'

export function useUnits() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true)
        const data = await unitService.getUnits()
        setUnits(data)
      } catch (error) {
        console.error('Erro ao carregar unidades:', error)
        setUnits([])
      } finally {
        setLoading(false)
      }
    }

    fetchUnits()
  }, [])

  return { units, loading }
}
