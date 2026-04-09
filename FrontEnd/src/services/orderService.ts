// Serviço de Pedidos - Camada única para TODOS os canais (APP, TOTEM, BALCÃO)
/**
 * Responsável por:
 * - Criar pedido com validações
 * - Processar pagamento
 * - Atualizar status
 * - Rastreamento
 * 
 * Fluxo unificado:
 * 1. Selecionar unidade
 * 2. Buscar cardápio
 * 3. Selecionar produtos
 * 4. Criar pedido
 * 5. Processar pagamento
 * 6. Confirmar pedido
 * 7. Atualizar status
 */

import { apiClient } from './api'
import { stockService } from './stockService'

// Tipos de pedido - Alexsander Xavier - 4338139
export enum OrderStatus {
  CRIADO = 'CRIADO',
  AGUARDANDO_PAGAMENTO = 'AGUARDANDO_PAGAMENTO',
  RECEBIDO = 'RECEBIDO',
  PAGO = 'PAGO',
  EM_PREPARO = 'EM_PREPARO',
  PRONTO = 'PRONTO',
  SAIU_PARA_ENTREGA = 'SAIU_PARA_ENTREGA',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO',
}

export enum DeliveryType {
  RETIRADA = 'RETIRADA',
  ENTREGA = 'ENTREGA',
  PICKUP = 'PICKUP',
}

export interface CartItem {
  productId: string
  quantity: number
  price: number
  name: string
}

export interface OrderRequest {
  unitId: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  items: CartItem[]
  deliveryType: DeliveryType
  deliveryAddress?: {
    street: string
    number: string
    neighborhood: string
    city: string
    cep: string
    complement?: string
  }
  notes?: string
  channel: 'APP' | 'TOTEM' | 'BALCAO' | 'PICKUP'
  userId?: number
}

export interface Order {
  id: string
  unitId: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  items: CartItem[]
  subtotal: number
  tax: number
  deliveryFee: number
  total: number
  status: OrderStatus
  deliveryType: DeliveryType
  deliveryAddress?: any
  channel: string
  createdAt: Date
  updatedAt: Date
  transactionId?: string
  estimatedTime?: number // minutos
  loyalty_points?: number
}

class OrderService {
  private localOrders: Map<string, Order> = new Map()

  private storeLocalOrder(order: Order): Order {
    this.localOrders.set(order.id, order)
    try {
      localStorage.setItem(`order-${order.id}`, JSON.stringify(order))
    } catch {
      // Se localStorage não estiver disponível, mantém apenas em memória
    }
    return order
  }

  private loadPersistedOrder(orderId: string): Order | null {
    try {
      const saved = localStorage.getItem(`order-${orderId}`)
      if (!saved) return null
      return JSON.parse(saved) as Order
    } catch {
      return null
    }
  }

  /**
   * Cria pedido em qualquer canal
   * Alexsander Xavier - 4338139
   * 
   * Fluxo:
   * 1. Valida dados do pedido
   * 2. Verifica se produto tem estoque
   * 3. Cria pedido no backend (ou mock)
   * 4. Mantém ordem local para rastreamento offline
   */
  async createOrder(request: OrderRequest): Promise<Order> {
    try {
      // Validações básicas - Alexsander Xavier - 4338139
      if (!request.unitId) throw new Error('Unidade é obrigatória')
      if (!request.clientName?.trim()) throw new Error('Nome do cliente é obrigatório')
      if (!request.items || request.items.length === 0) throw new Error('Carrinho vazio')

      // Se entrega, endereço é obrigatório - Alexsander Xavier - 4338139
      if (request.deliveryType === DeliveryType.ENTREGA && !request.deliveryAddress) {
        throw new Error('Endereço é obrigatório para entrega')
      }

      // Verifica estoque antes de criar pedido - Alexsander Xavier - 4338139
      for (const item of request.items) {
        const temEstoque = await stockService.temEstoque(item.productId, request.unitId, item.quantity)
        if (!temEstoque) {
          throw new Error(`Produto indisponível. Estoque insuficiente para: ${item.name}`)
        }
      }

      // Calcula totais - Alexsander Xavier - 4338139
      const subtotal = request.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const tax = subtotal * 0.08 // 8% de taxa
      const deliveryFee = request.deliveryType === DeliveryType.ENTREGA ? 5.0 : 0
      const initialStatus = OrderStatus.AGUARDANDO_PAGAMENTO

      // Tenta criar no backend, usa mock se falhar - Alexsander Xavier - 4338139
      let order: Order
      try {
        // Mapeia para o formato esperado pelo backend (CreateOrderDto)
        const backendPayload = {
          unidadeId: request.unitId,
          itens: request.items.map(item => ({
            produtoId: item.productId,
            quantidade: item.quantity,
            precoUnitario: item.price,
          })),
        }
        const response = await apiClient.post<Order>('/orders', backendPayload)
        order = response.data
      } catch (apiError) {
        // Fallback: simula pedido localmente - Alexsander Xavier - 4338139
        order = {
          id: `ORD-${Date.now()}`,
          unitId: request.unitId,
          clientName: request.clientName,
          clientEmail: request.clientEmail,
          clientPhone: request.clientPhone,
          items: request.items,
          subtotal,
          tax,
          deliveryFee,
          total: subtotal + tax + deliveryFee,
          status: initialStatus,
          deliveryType: request.deliveryType,
          deliveryAddress: request.deliveryAddress,
          channel: request.channel,
          createdAt: new Date(),
          updatedAt: new Date(),
          estimatedTime: 30,
          // Pontos apenas para CLIENTE logado, NÃO para TOTEM - Alexsander Xavier - 4338139
          loyalty_points: request.channel === 'APP' ? Math.floor(subtotal) : 0,
        }
      }

      this.storeLocalOrder(order)
      return order
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar pedido')
    }
  }

  /**
   * Busca pedido por ID
   * Alexsander Xavier - 4338139
   */
  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await apiClient.get<Order>(`/orders/${orderId}`)
      const order = response.data
      this.storeLocalOrder(order)
      return order
    } catch (error: any) {
      const localOrder = this.localOrders.get(orderId) || this.loadPersistedOrder(orderId)
      if (localOrder) {
        return localOrder
      }
      throw new Error('Pedido não encontrado')
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const response = await apiClient.patch<Order>(`/orders/${orderId}`, { status })
      const order = response.data
      if (this.localOrders.has(order.id)) {
        this.localOrders.set(order.id, order)
      }
      return order
    } catch (error: any) {
      const localOrder = this.localOrders.get(orderId)
      if (localOrder) {
        const updatedOrder = {
          ...localOrder,
          status,
          updatedAt: new Date(),
        }
        this.localOrders.set(orderId, updatedOrder)
        return updatedOrder
      }
      throw new Error('Erro ao atualizar status')
    }
  }

  async confirmOrderPayment(orderId: string, transactionId: string): Promise<Order> {
    const order = await this.getOrder(orderId)
    const updatedOrder = await this.updateOrderStatus(orderId, OrderStatus.RECEBIDO)

    const finalOrder = {
      ...updatedOrder,
      transactionId,
      updatedAt: new Date(),
    }

    this.storeLocalOrder(finalOrder)

    // Reduz estoque após pagamento confirmado - Alexsander Xavier - 4338139
    for (const item of finalOrder.items) {
      stockService.reduceStock(item.productId, finalOrder.unitId, item.quantity).catch((_err) => {
        // Silently handle stock reduction errors
      })
    }

    this.simulateOrderProgression(orderId, finalOrder)
    return finalOrder
  }

  /**
   * Simula máquina de estados do pedido
   * Automaticamente avança de status em intervalos
   * Alexsander Xavier - 4338139
   */
  simulateOrderProgression(orderId: string, initialOrder: Order): void {
    // Sequências diferentes baseadas no tipo de entrega
    const statusSequences: { [key in DeliveryType]: OrderStatus[] } = {
      [DeliveryType.RETIRADA]: [
        OrderStatus.RECEBIDO,
        OrderStatus.EM_PREPARO,
        OrderStatus.PRONTO,
      ],
      [DeliveryType.ENTREGA]: [
        OrderStatus.RECEBIDO,
        OrderStatus.EM_PREPARO,
        OrderStatus.SAIU_PARA_ENTREGA,
        OrderStatus.ENTREGUE,
      ],
      [DeliveryType.PICKUP]: [
        OrderStatus.RECEBIDO,
        OrderStatus.EM_PREPARO,
        OrderStatus.PRONTO,
      ],
    }

    const statusSequence = statusSequences[initialOrder.deliveryType] || statusSequences[DeliveryType.RETIRADA]
    let currentIndex = statusSequence.findIndex((s) => s === initialOrder.status)

    // Se não encontrou o status inicial, começa do primeiro
    if (currentIndex === -1) {
      currentIndex = 0
    }

    const interval = setInterval(async () => {
      currentIndex++
      if (currentIndex >= statusSequence.length) {
        clearInterval(interval)
        return
      }

      try {
        await this.updateOrderStatus(orderId, statusSequence[currentIndex])
      } catch (_error) {
        // Status update failed silently
      }
    }, 5000) // 5 segundos para progressão automática
  }

  /**
   * Busca pedidos do cliente
   * Alexsander Xavier - 4338139
   */
  async getClientOrders(clientId?: number): Promise<Order[]> {
    try {
      const response = await apiClient.get<{ data: Order[] }>('/orders', {
        params: clientId ? { clientId } : {},
      })
      return Array.isArray(response.data) ? response.data : response.data.data || []
    } catch (error: any) {
      // Mock: retorna pedidos vazios - Alexsander Xavier - 4338139
      return []
    }
  }

  /**
   * Calcula pontos de fidelização
   * 1 ponto por real gasto
   * Alexsander Xavier - 4338139
   */
  calculateLoyaltyPoints(totalAmount: number): number {
    return Math.floor(totalAmount)
  }

  /**
   * Formata status para exibição
   * Alexsander Xavier - 4338139
   */
  getStatusLabel(status: OrderStatus): string {
    const labels: { [key in OrderStatus]: string } = {
      [OrderStatus.CRIADO]: '📝 Pedido Criado',
      [OrderStatus.AGUARDANDO_PAGAMENTO]: '⏳ Aguardando Pagamento',
      [OrderStatus.RECEBIDO]: '📩 Pedido Recebido',
      [OrderStatus.PAGO]: '✅ Pagamento Confirmado',
      [OrderStatus.EM_PREPARO]: '👨‍🍳 Em Preparo',
      [OrderStatus.PRONTO]: '📦 Pronto para Retirada',
      [OrderStatus.SAIU_PARA_ENTREGA]: '🚗 Saiu para Entrega',
      [OrderStatus.ENTREGUE]: '✨ Entregue',
      [OrderStatus.CANCELADO]: '❌ Cancelado',
    }
    return labels[status] || status
  }

  /**
   * Retorna cor visual do status
   * Alexsander Xavier - 4338139
   */
  getStatusColor(status: OrderStatus): string {
    const colors: { [key in OrderStatus]: string } = {
      [OrderStatus.CRIADO]: '#ff9800',
      [OrderStatus.AGUARDANDO_PAGAMENTO]: '#f44336',
      [OrderStatus.RECEBIDO]: '#2196f3',
      [OrderStatus.PAGO]: '#1976d2',
      [OrderStatus.EM_PREPARO]: '#9c27b0',
      [OrderStatus.PRONTO]: '#4caf50',
      [OrderStatus.SAIU_PARA_ENTREGA]: '#3f51b5',
      [OrderStatus.ENTREGUE]: '#8bc34a',
      [OrderStatus.CANCELADO]: '#9e9e9e',
    }
    return colors[status] || '#999'
  }
}

export const orderService = new OrderService()
