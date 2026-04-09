// Alexsander Xavier - 4338139
// Página de Tracking de Pedidos - Timeline visual com atualizações de status
/**
 * Exibe:
 * - Status atual do pedido
 * - Timeline visual da progressão
 * - Informações do pedido
 * - Tempo estimado
 * - Atualizações automáticas
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '@contexts/ToastContext'
import { orderService, Order, OrderStatus } from '@services/orderService'
import Spinner from '@components/Spinner'

const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshCount, setRefreshCount] = useState(0)

  // Simula atualização em tempo real - Alexsander Xavier - 4338139
  useEffect(() => {
    if (!id) return

    const fetchOrder = async () => {
      try {
        setLoading(true)
        const data = await orderService.getOrder(id)
        setOrder(data)
        setError('')
      } catch (err: any) {
        setError(err.message)
        toast.showToast('Pedido não encontrado', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()

    // Recarrega a cada 5 segundos para simular atualizações - Alexsander Xavier - 4338139
    const interval = setInterval(() => {
      setRefreshCount((prev) => prev + 1)
      fetchOrder()
    }, 5000)

    return () => clearInterval(interval)
  }, [id, toast])

  if (loading) return <Spinner />
  if (error)
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <p>{error}</p>
          <button style={styles.button} onClick={() => navigate('/')}>
            Voltar para Home
          </button>
        </div>
      </div>
    )

  if (!order)
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <p>Pedido não encontrado</p>
          <button style={styles.button} onClick={() => navigate('/')}>
            Voltar para Home
          </button>
        </div>
      </div>
    )

  // Timeline de status - Alexsander Xavier - 4338139
  const timeline = [
    { status: OrderStatus.CRIADO, label: '📝 Criado' },
    { status: OrderStatus.AGUARDANDO_PAGAMENTO, label: '⏳ Aguardando Pagamento' },
    { status: OrderStatus.RECEBIDO, label: '📩 Pedido Recebido' },
    { status: OrderStatus.EM_PREPARO, label: '👨‍🍳 Em Preparo' },
    { status: OrderStatus.PRONTO, label: '📦 Pronto' },
    order.deliveryType === 'ENTREGA'
      ? { status: OrderStatus.SAIU_PARA_ENTREGA, label: '🚗 Saiu para Entrega' }
      : { status: OrderStatus.ENTREGUE, label: '✨ Entregue' },
  ]

  const getProgress = (): number => {
    const currentIndex = timeline.findIndex((t) => t.status === order.status)
    return currentIndex === -1 ? 0 : ((currentIndex + 1) / timeline.length) * 100
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🛍️ Acompanhamento de Pedido</h1>
        <p>Pedido #{order.id}</p>
      </div>

      {/* Card de status principal - Alexsander Xavier - 4338139 */}
      <div style={styles.statusCard}>
        <div
          style={{
            ...styles.statusBadge,
            backgroundColor: orderService.getStatusColor(order.status),
          }}
        >
          {orderService.getStatusLabel(order.status)}
        </div>
        {order.estimatedTime && (
          <p style={{ marginTop: '1rem', color: '#666' }}>
            ⏱️ Tempo estimado: <strong>{order.estimatedTime} minutos</strong>
          </p>
        )}
      </div>

      {/* Timeline visual - Alexsander Xavier - 4338139 */}
      <div style={styles.timeline}>
        <div style={{ ...styles.progressBar, width: `${getProgress()}%` }} />
        <div style={styles.timelineItems}>
          {timeline.map((item, idx) => (
            <div key={idx} style={styles.timelineItem}>
              <div
                style={{
                  ...styles.dot,
                  backgroundColor:
                    timeline.findIndex((t) => t.status === order.status) >= idx
                      ? '#4caf50'
                      : '#ddd',
                }}
              />
              <p
                style={{
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  marginTop: '0.5rem',
                  color:
                    timeline.findIndex((t) => t.status === order.status) >= idx
                      ? '#333'
                      : '#999',
                }}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Detalhes do pedido - Alexsander Xavier - 4338139 */}
      <div style={styles.details}>
        <h3>📋 Detalhes do Pedido</h3>

        <div style={styles.detailsGrid}>
          <div>
            <strong>Cliente:</strong>
            <p>{order.clientName}</p>
          </div>
          <div>
            <strong>Canal:</strong>
            <p>{order.channel}</p>
          </div>
          <div>
            <strong>Tipo:</strong>
            <p>{order.deliveryType === 'ENTREGA' ? '🚗 Entrega' : '🏪 Retirada'}</p>
          </div>
          {order.clientPhone && (
            <div>
              <strong>Telefone:</strong>
              <p>{order.clientPhone}</p>
            </div>
          )}
        </div>

        {/* Endereço de entrega - Alexsander Xavier - 4338139 */}
        {order.deliveryAddress && (
          <div style={{ marginTop: '1rem' }}>
            <strong>Endereço de Entrega:</strong>
            <p>
              {order.deliveryAddress.street}, {order.deliveryAddress.number}
              {order.deliveryAddress.complement ? ` - ${order.deliveryAddress.complement}` : ''}
            </p>
            <p>
              {order.deliveryAddress.neighborhood}, {order.deliveryAddress.city} -{' '}
              {order.deliveryAddress.cep}
            </p>
          </div>
        )}

        {/* Itens do pedido - Alexsander Xavier - 4338139 */}
        <div style={{ marginTop: '1.5rem' }}>
          <strong>Itens:</strong>
          <div style={styles.itemsList}>
            {order.items.map((item, idx) => (
              <div key={idx} style={styles.itemRow}>
                <span>{item.quantity}x</span>
                <span style={{ flex: 1 }}>{item.name}</span>
                <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totais - Alexsander Xavier - 4338139 */}
        <div style={styles.totalsSection}>
          <div style={styles.totalRow}>
            <span>Subtotal:</span>
            <span>R$ {order.subtotal.toFixed(2)}</span>
          </div>
          <div style={styles.totalRow}>
            <span>Taxa:</span>
            <span>R$ {order.tax.toFixed(2)}</span>
          </div>
          {order.deliveryFee > 0 && (
            <div style={styles.totalRow}>
              <span>Entrega:</span>
              <span>R$ {order.deliveryFee.toFixed(2)}</span>
            </div>
          )}
          <div style={styles.totalRowBold}>
            <span>TOTAL:</span>
            <span>R$ {order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Pontos de fidelidade - Alexsander Xavier - 4338139 */}
        {order.loyalty_points && (
          <div style={styles.loyaltyBox}>
            <p>⭐ Você ganhou {order.loyalty_points} pontos de fidelidade!</p>
          </div>
        )}
      </div>

      {/* Botões de ação - Alexsander Xavier - 4338139 */}
      <div style={styles.actions}>
        <button
          style={styles.button}
          onClick={() => {
            setRefreshCount((prev) => prev + 1)
            toast.showToast('Atualizado', 'info')
          }}
        >
          🔄 Atualizar
        </button>
        <button
          style={{ ...styles.button, backgroundColor: '#ddd', color: '#333' }}
          onClick={() => navigate('/')}
        >
          ← Voltar
        </button>
      </div>

      {/* Indicador de atualização - Alexsander Xavier - 4338139 */}
      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#999', marginTop: '1rem' }}>
        Atualizado há poucos segundos (#{refreshCount})
      </p>
    </div>
  )
}

// Estilos - Alexsander Xavier - 4338139
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
    borderBottom: '2px solid #cd853f',
    paddingBottom: '1rem',
  },
  statusCard: {
    padding: '1.5rem',
    border: '2px solid #cd853f',
    borderRadius: '8px',
    backgroundColor: '#fffaf0',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    borderRadius: '24px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  timeline: {
    position: 'relative',
    marginBottom: '2rem',
    padding: '2rem 0',
  },
  progressBar: {
    position: 'absolute',
    top: '24px',
    left: '0',
    height: '4px',
    backgroundColor: '#4caf50',
    transition: 'width 0.3s ease',
  },
  timelineItems: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  timelineItem: {
    flex: 1,
    textAlign: 'center',
  },
  dot: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    margin: '0 auto',
    border: '3px solid white',
    boxShadow: '0 0 0 3px #ddd',
  },
  details: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1.5rem',
    backgroundColor: '#f9f9f9',
    marginBottom: '2rem',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  itemsList: {
    marginTop: '1rem',
    border: '1px solid #eee',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #eee',
    fontSize: '0.95rem',
  },
  totalsSection: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '2px solid #ddd',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  totalRowBold: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '0.5rem',
    paddingTop: '0.5rem',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#cd853f',
  },
  loyaltyBox: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#fff3cd',
    borderRadius: '4px',
    textAlign: 'center',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
  },
  button: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#cd853f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  error: {
    textAlign: 'center',
    padding: '2rem',
    color: '#d32f2f',
  },
}

export default OrderTracking
