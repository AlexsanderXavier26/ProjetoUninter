// Alexsander Xavier - 4338139
import { useEffect, useState } from 'react'
import { Product } from '../context/ClienteContext'
import { unitService } from '@services/unitService'

export function useProducts(unitId: string | null) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!unitId) {
      setProducts([])
      return
    }

    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await unitService.getProductsByUnit(unitId)

        // Mapeia produtos do unitService para formato do ClienteContext
        const mappedProducts: Product[] = data.map(product => ({
          id: product.id,
          nome: product.name,
          preco: product.price,
          descricao: product.description,
          categoria: mapCategory(product.category),
          origem: 'Nordeste', // Adiciona origem padrão
          imagem: product.image,
          sazonal: product.seasonal
        }))

        setProducts(mappedProducts)
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [unitId])

  return { products, loading }
}

// Função auxiliar para mapear categorias - Alexsander Xavier - 4338139
function mapCategory(category: string): 'prato' | 'cerveja' | 'refrigerante' | 'combo' {
  switch (category) {
    case 'PRATOS_EXECUTIVOS':
      return 'prato'
    case 'BEBIDAS':
      // Tenta identificar tipo de bebida
      return 'cerveja' // fallback, poderia ser melhorado
    default:
      return 'prato'
  }
}
