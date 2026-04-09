// Alexsander Xavier - 4338139
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './ClientePedidoStatus.module.css'

interface OrderData {
  id: string
  type: 'retirada' | 'entrega'
  items: any[]
  total: number
  paymentMethod: string
  address?: any
  status: string
  timestamp?: string
  createdAt?: string
}

const ClientePedidoStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [currentStatus, setCurrentStatus] = useState<string>('recebido')

  // Carrega dados do pedido
  useEffect(() => {
    if (!id) return

    const orderData = localStorage.getItem(`order_${id}`)
    if (orderData) {
      try {
        const parsed = JSON.parse(orderData)
        setOrder(parsed)
        setCurrentStatus(parsed.status)
      } catch (error) {
        console.error('Erro ao carregar pedido:', error)
      }
    }
  }, [id])

  // Simula progresso automático do status
  useEffect(() => {
    if (!order) return

    const statusFlow = order.type === 'entrega'
      ? ['recebido', 'em_preparo', 'saiu_para_entrega', 'entregue']
      : ['recebido', 'em_preparo', 'pronto_para_retirada']

    let currentIndex = statusFlow.indexOf(currentStatus)

    if (currentIndex < statusFlow.length - 1) {
      const timer = setTimeout(() => {
        const nextStatus = statusFlow[currentIndex + 1]
        setCurrentStatus(nextStatus)

        // Atualiza no localStorage
        const updatedOrder = { ...order, status: nextStatus }
        setOrder(updatedOrder)
        localStorage.setItem(`order_${id}`, JSON.stringify(updatedOrder))
      }, 8000) // Muda status a cada 8 segundos

      return () => clearTimeout(timer)
    }
  }, [currentStatus, order, id])

  const getStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { label: string, icon: string, color: string, description: string } } = {
      recebido: {
        label: 'Pedido Recebido',
        icon: '✅',
        color: '#4caf50',
        description: 'Seu pedido foi confirmado e estamos processando'
      },
      em_preparo: {
        label: 'Em Preparo',
        icon: '👨‍🍳',
        color: '#ff6f00',
        description: 'Nossos chefs estão preparando seu pedido com carinho'
      },
      saiu_para_entrega: {
        label: 'Saiu para Entrega',
        icon: '🚚',
        color: '#2196f3',
        description: 'Seu pedido está a caminho! Acompanhe pelo mapa'
      },
      pronto_para_retirada: {
        label: 'Pronto para Retirada',
        icon: '🏪',
        color: '#9c27b0',
        description: 'Seu pedido está pronto! Dirija-se ao balcão de retirada'
      },
      entregue: {
        label: 'Entregue',
        icon: '🎉',
        color: '#4caf50',
        description: 'Pedido entregue com sucesso! Bom apetite!'
      }
    }

    return statusMap[status] || statusMap.recebido
  }

  const getStatusSteps = () => {
    if (!order) return []

    return order.type === 'entrega'
      ? ['recebido', 'em_preparo', 'saiu_para_entrega', 'entregue']
      : ['recebido', 'em_preparo', 'pronto_para_retirada']
  }

  const formatTime = (order: OrderData) => {
    const dateStr = order.createdAt || order.timestamp
    if (!dateStr) return 'Data não disponível'
    try {
      return new Date(dateStr).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Data inválida'
    }
  }

  if (!order) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <h2>Carregando pedido...</h2>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(currentStatus)
  const steps = getStatusSteps()
  const currentStepIndex = steps.indexOf(currentStatus)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📋 Acompanhar Pedido</h1>
        <p className={styles.orderId}>Pedido #{order.id}</p>
        <p className={styles.orderTime}>
          Realizado em {formatTime(order)}
        </p>
      </div>

      {/* Status atual em destaque */}
      <div className={styles.currentStatus} style={{ backgroundColor: statusInfo.color + '20', borderColor: statusInfo.color }}>
        <div className={styles.statusIcon}>{statusInfo.icon}</div>
        <div className={styles.statusContent}>
          <h2 style={{ color: statusInfo.color }}>{statusInfo.label}</h2>
          <p>{statusInfo.description}</p>
        </div>
      </div>

      {/* Timeline de progresso */}
      <div className={styles.timeline}>
        {steps.map((step, index) => {
          const stepInfo = getStatusInfo(step)
          const isCompleted = index <= currentStepIndex
          const isCurrent = index === currentStepIndex

          return (
            <div key={step} className={`${styles.timelineStep} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`}>
              <div className={styles.stepIcon} style={{ backgroundColor: isCompleted ? stepInfo.color : '#e0e0e0' }}>
                {isCompleted ? stepInfo.icon : '⏳'}
              </div>
              <div className={styles.stepContent}>
                <h4 style={{ color: isCompleted ? stepInfo.color : '#999' }}>
                  {stepInfo.label}
                </h4>
                <p>{stepInfo.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detalhes do pedido */}
      <div className={styles.orderDetails}>
        <h3>📦 Detalhes do Pedido</h3>

        <div className={styles.detailRow}>
          <span>Tipo:</span>
          <span>{order.type === 'entrega' ? '🚚 Entrega em Casa' : '🏪 Retirada no Local'}</span>
        </div>

        <div className={styles.detailRow}>
          <span>Pagamento:</span>
          <span>
            {order.paymentMethod === 'pix' ? '📱 PIX' :
             order.paymentMethod === 'debito' ? '💳 Débito' :
             '💳 Crédito'}
          </span>
        </div>

        <div className={styles.detailRow}>
          <span>Total:</span>
          <span className={styles.total}>R$ {order.total.toFixed(2)}</span>
        </div>

        {order.type === 'entrega' && order.address && (
          <div className={styles.address}>
            <h4>📍 Endereço de Entrega</h4>
            <p>{order.address.rua}, {order.address.numero}</p>
            {order.address.complemento && <p>{order.address.complemento}</p>}
            <p>{order.address.bairro} - {order.address.cidade}/{order.address.estado}</p>
            <p>CEP: {order.address.cep}</p>
          </div>
        )}

        <div className={styles.items}>
          <h4>Itens do Pedido</h4>
          {order.items.map((item: any) => (
            <div key={item.id} className={styles.item}>
              <span className={styles.quantity}>{item.quantidade}x</span>
              <span className={styles.name}>{item.nome}</span>
              <span className={styles.price}>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ações */}
      <div className={styles.actions}>
        <button
          className={styles.newOrderButton}
          onClick={() => navigate('/app')}
        >
          🍽️ Fazer Novo Pedido
        </button>

        <button
          className={styles.supportButton}
          onClick={() => navigate('/app/suporte')}
        >
          💬 Falar com Suporte
        </button>
      </div>
    </div>
  )
}

export default ClientePedidoStatus
