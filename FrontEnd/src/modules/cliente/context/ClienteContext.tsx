// Alexsander Xavier - 4338139
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react'
import { apiClient } from '@services/api'
import { useAuth } from '@contexts/AuthContext'

export interface Product {
  id: string
  nome: string
  preco: number
  descricao?: string
  categoria?: 'prato' | 'cerveja' | 'refrigerante' | 'combo'
  origem?: string
  imagem?: string
  sazonal?: boolean
}

export interface CartItem extends Product {
  quantidade: number
}

interface ClienteContextData {
  cart: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantidade: number) => void
  total: number
  loyaltyPoints: number
  pointsToNext: number
  consent: boolean
  giveConsent: () => Promise<void>
}

const ClienteContext = createContext<ClienteContextData>({} as ClienteContextData)

export const ClienteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, user } = useAuth()

  const [cart, setCart] = useState<CartItem[]>([])
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0)
  const [consent, setConsent] = useState<boolean>(true)

  useEffect(() => {
    if (!token) {
      setLoyaltyPoints(0)
      setConsent(true)
      return
    }
    // fetch user profile with points and consent
    apiClient
      .get<any>('/users/me')
      .then((r) => {
        if (r.data && typeof r.data === 'object') {
          setLoyaltyPoints(r.data.pontos ?? 0)
          setConsent(r.data.consentimento ?? true)
        }
      })
      .catch((err) => {
        console.warn('Erro ao carregar perfil do usuário:', err?.response?.status, err?.message)
        setLoyaltyPoints(0)
        setConsent(true)
      })
  }, [token])

  const addToCart = (product: Product) => {
    setCart((old) => {
      const existing = old.find((i) => i.id === product.id)
      if (existing) {
        return old.map((i) =>
          i.id === product.id ? { ...i, quantidade: i.quantidade + 1 } : i
        )
      }
      return [...old, { ...product, quantidade: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((old) => old.filter((i) => i.id !== productId))
  }

  const updateQuantity = (productId: string, quantidade: number) => {
    setCart((old) =>
      old
        .map((i) =>
          i.id === productId ? { ...i, quantidade: Math.max(1, quantidade) } : i
        )
        .filter((i) => i.quantidade > 0)
    )
  }

  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.preco * item.quantidade, 0)
  }, [cart])

  const pointsToNext = useMemo(() => {
    // sample: every 100 points for a discount
    return 100 - (loyaltyPoints % 100)
  }, [loyaltyPoints])

  const giveConsent = async () => {
    try {
      if (!user || !user.id) {
        console.warn('Usuário não autenticado para dar consentimento')
        return
      }
      // PATCH /users/:id/consentimento to update consent
      await apiClient.patch(`/users/${user.id}/consentimento`, { consentimento: true })
      setConsent(true)
    } catch (err) {
      console.warn('Erro ao atualizar consentimento:', err)
    }
  }

  return (
    <ClienteContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        total,
        loyaltyPoints,
        pointsToNext,
        consent,
        giveConsent,
      }}
    >
      {children}
    </ClienteContext.Provider>
  )
}

export const useCliente = () => useContext(ClienteContext)
