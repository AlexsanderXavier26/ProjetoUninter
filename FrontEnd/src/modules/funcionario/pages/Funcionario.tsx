import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import { useToast } from '@contexts/ToastContext'
import { unitService, Unit } from '@services/unitService'
import Spinner from '@components/Spinner'

interface Order {
  id: string
  clientName: string
  total: number
  status: 'Criado' | 'Preparando' | 'Pronto' | 'Entregue'
  createdAt: Date
  timeAgo?: string
}

interface UnitMetrics {
  totalOrders: number
  totalRevenue: number
  avOrderValue: number
  lowerStockItems: number
  efficiency: number
}

const Funcionario = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [unit, setUnit] = useState<Unit | null>(null)
  const [frontendUnitId, setFrontendUnitId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'pedidos' | 'estoque'>('pedidos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [stock, setStock] = useState<{ [key: string]: number }>({})
  const [orders, setOrders] = useState<Order[]>([])
  const [metrics, setMetrics] = useState<UnitMetrics>({
    totalOrders: 0,
    totalRevenue: 0,
    avOrderValue: 0,
    lowerStockItems: 0,
    efficiency: 0
  })

  // Verifica se funcionário está ligado a uma unidade
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!user.unitId && user.role === 'FUNCIONARIO') {
      toast.showToast('Erro: Funcionário não atrelado a uma unidade', 'error')
      logout()
      navigate('/login')
      return
    }
    setLoading(false)
  }, [user, navigate, logout, toast])

  // Carrega dados da unidade
  useEffect(() => {
    if (!user?.unitId) return

    const loadUnit = async () => {
      try {
        // Obtém a unidade correspondente ao unidadeId do banco (unidade-1, unidade-2, etc)
        const selectedUnit = await unitService.getFrontendUnitByBackendId(user.unitId)
        if (selectedUnit) {
          setUnit(selectedUnit)
          setFrontendUnitId(selectedUnit.id) // Guarda o frontend unit ID
          // Carrega produtos da unidade
          const unitProducts = await unitService.getProductsByUnit(selectedUnit.id)
          // Usa os produtos reais para gerar dados simulados
          initializeDataWithProducts(selectedUnit.id, unitProducts)
        } else {
          setError('Unidade não encontrada no sistema')
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar unidade')
      }
    }

    loadUnit()
  }, [user?.unitId])

  // Gera dados únicos para a unidade
  const getUnitData = (unitId: string) => {
    let hash = 0
    for (let i = 0; i < unitId.length; i++) {
      hash = ((hash << 5) - hash) + unitId.charCodeAt(i)
      hash = hash & hash
    }
    hash = Math.abs(hash)

    return {
      baseStock: 15 + (hash % 25),
      numOrders: 6 + (hash % 8)
    }
  }

  const initializeDataWithProducts = (unitId: string, products: any[]) => {
    const data = getUnitData(unitId)

    // Calcula hash para variações de dados
    let hash = 0
    for (let j = 0; j < unitId.length; j++) {
      hash = ((hash << 5) - hash) + unitId.charCodeAt(j)
      hash = hash & hash
    }
    hash = Math.abs(hash)

    // Inicializa estoque com NOMES REAIS dos produtos
    const newStock: { [key: string]: number } = {}
    products.forEach((product, index) => {
      newStock[product.name] = data.baseStock + ((index + 1) * 3)
    })

    // Se não há produtos, gera alguns fictícios
    if (Object.keys(newStock).length === 0) {
      for (let i = 1; i <= 5; i++) {
        newStock[`Produto ${i}`] = data.baseStock + (i * 3)
      }
    }

    // Carrega estoque salvo
    const saved = localStorage.getItem(`stock_${unitId}`)
    if (saved) {
      setStock(JSON.parse(saved))
    } else {
      setStock(newStock)
    }

    // Gera pedidos simulados da unidade
    const mockOrders: Order[] = []
    const statuses: Array<'Criado' | 'Preparando' | 'Pronto' | 'Entregue'> = ['Criado', 'Preparando', 'Pronto', 'Entregue']
    const clientNames = ['João Silva', 'Maria Santos', 'Carlos Oliveira', 'Ana Ferreira', 'Pedro Costa', 'Lucia Martins']

    for (let i = 0; i < data.numOrders; i++) {
      const minutesAgo = 5 + (i * 12)
      const statusIdx = (hash + i) % 4

      mockOrders.push({
        id: `ORD-${1000 + i}`,
        clientName: clientNames[(i + hash) % clientNames.length],
        total: 45 + (i * 15),
        status: statuses[statusIdx],
        createdAt: new Date(Date.now() - minutesAgo * 60000),
        timeAgo: `${minutesAgo} min atrás`
      })
    }
    setOrders(mockOrders)

    // Calcula métricas da unidade baseado nos dados simulados
    const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0)
    const lowerStockCount = Object.values(newStock).filter(qty => qty < 5).length
    const completedOrders = mockOrders.filter(o => o.status === 'Entregue').length
    const efficiency = Math.round((completedOrders / mockOrders.length) * 100)

    setMetrics({
      totalOrders: mockOrders.length,
      totalRevenue,
      avOrderValue: Math.round(totalRevenue / mockOrders.length),
      lowerStockItems: lowerStockCount,
      efficiency: efficiency || 70 + Math.random() * 25 // valor padrão 70-95%
    })
  }

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(o =>
      o.id === orderId ? { ...o, status: newStatus } : o
    ))
    toast.showToast('Status atualizado com sucesso', 'success')
  }

  const handleStockChange = (productId: string, quantity: number) => {
    if (quantity < 0) {
      toast.showToast('Quantidade não pode ser negativa', 'error')
      return
    }
    const newStock = { ...stock, [productId]: quantity }
    setStock(newStock)
    if (frontendUnitId) {
      localStorage.setItem(`stock_${frontendUnitId}`, JSON.stringify(newStock))
    }
    toast.showToast('Estoque atualizado', 'success')
  }

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'todos') return orders
    return orders.filter(o => o.status === statusFilter)
  }, [orders, statusFilter])

  if (loading) return <Spinner />

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: '#8b4513' }}>👷 Dashboard do Funcionário</h2>
          {unit && <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>Unidade: {unit.name}</p>}
        </div>
        <button onClick={() => { logout(); navigate('/login') }} style={styles.logoutBtn}>Sair</button>
      </header>

      {error && <p style={styles.error}>{error}</p>}

      {/* MÉTRICAS DA UNIDADE */}
      {unit && (
        <div style={styles.metricsContainer}>
          <div style={styles.unitInfoCard}>
            <h3 style={styles.unitInfoTitle}>📍 {unit.name}</h3>
            <p style={styles.unitInfoDetail}>{unit.address || 'Endereço não disponível'}</p>
            <p style={styles.unitInfoDetail}>{unit.city}, {unit.estado}</p>
          </div>

          <div style={styles.metricsGrid}>
            <div style={styles.metricCard}>
              <div style={styles.metricValue}>{metrics.totalOrders}</div>
              <div style={styles.metricLabel}>Total de Pedidos</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricValue}>R$ {metrics.totalRevenue.toFixed(0)}</div>
              <div style={styles.metricLabel}>Faturamento</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricValue}>R$ {metrics.avOrderValue}</div>
              <div style={styles.metricLabel}>Ticket Médio</div>
            </div>
            <div style={styles.metricCard}>
              <div style={{...styles.metricValue, color: metrics.lowerStockItems > 0 ? '#d32f2f' : '#4caf50'}}>
                {metrics.lowerStockItems}
              </div>
              <div style={styles.metricLabel}>Itens com Baixo Estoque</div>
            </div>
            <div style={styles.metricCard}>
              <div style={{...styles.metricValue, color: metrics.efficiency > 80 ? '#4caf50' : '#ff9800'}}>
                {Math.round(metrics.efficiency)}%
              </div>
              <div style={styles.metricLabel}>Eficiência</div>
            </div>
          </div>
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.tabsContainer}>
        {(['pedidos', 'estoque'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.tabActive : {})
            }}
          >
            {tab === 'pedidos' ? '📋 Pedidos' : '📦 Estoque'}
          </button>
        ))}
      </div>

      {/* PEDIDOS */}
      {activeTab === 'pedidos' && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Pedidos da Unidade</h3>

          <div style={styles.filterBar}>
            <label style={styles.filterLabel}>Filtrar:</label>
            {['todos', 'Criado', 'Preparando', 'Pronto', 'Entregue'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  ...styles.filterBtn,
                  ...(statusFilter === s ? styles.filterBtnActive : {})
                }}
              >
                {s === 'todos' ? 'Todos' : s}
              </button>
            ))}
          </div>

          <div style={styles.ordersGrid}>
            {filteredOrders.length === 0 ? (
              <p style={styles.emptyText}>Nenhum pedido encontrado</p>
            ) : (
              filteredOrders.map(order => (
                <div key={order.id} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <span style={styles.orderId}>{order.id}</span>
                    <span style={styles.orderTime}>{order.timeAgo}</span>
                  </div>
                  <p style={styles.clientName}>{order.clientName}</p>
                  <p style={styles.total}>R$ {order.total.toFixed(2)}</p>

                  <div style={styles.statusSelect}>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                      style={styles.select}
                    >
                      <option value="Criado">Criado</option>
                      <option value="Preparando">Preparando</option>
                      <option value="Pronto">Pronto</option>
                      <option value="Entregue">Entregue</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ESTOQUE */}
      {activeTab === 'estoque' && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Gerenciar Estoque</h3>

          <div style={styles.stockGrid}>
            {Object.entries(stock).map(([productId, qty]) => (
              <div key={productId} style={styles.stockCard}>
                <label style={styles.productLabel}>{productId}</label>
                <div style={styles.stockControls}>
                  <button
                    onClick={() => handleStockChange(productId, qty - 1)}
                    style={styles.stockBtn}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => handleStockChange(productId, parseInt(e.target.value) || 0)}
                    style={styles.stockInput}
                  />
                  <button
                    onClick={() => handleStockChange(productId, qty + 1)}
                    style={styles.stockBtn}
                  >
                    +
                  </button>
                </div>
                <p style={{...styles.stockQty, color: qty < 5 ? '#d32f2f' : '#4caf50'}}>
                  {qty < 5 ? '⚠️ Baixo' : '✓ Ok'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '30px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#faf5f0',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '3px solid #d2691e'
  },
  logoutBtn: {
    padding: '10px 16px',
    backgroundColor: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #ef5350'
  },
  metricsContainer: {
    marginBottom: '30px'
  },
  unitInfoCard: {
    backgroundColor: '#fff',
    border: '2px solid #d2691e',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px'
  },
  unitInfoTitle: {
    margin: '0 0 10px 0',
    fontSize: '18px',
    color: '#8b4513',
    fontWeight: 'bold'
  },
  unitInfoDetail: {
    margin: '5px 0',
    fontSize: '14px',
    color: '#666'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '15px'
  },
  metricCard: {
    backgroundColor: '#fff',
    border: '1px solid #e0d5c7',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center' as const,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  metricValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#d2691e',
    marginBottom: '8px'
  },
  metricLabel: {
    fontSize: '12px',
    color: '#999',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  tabsContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px'
  },
  tab: {
    padding: '12px 20px',
    backgroundColor: '#fff',
    border: '2px solid #d2691e',
    color: '#d2691e',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.2s'
  },
  tabActive: {
    backgroundColor: '#d2691e',
    color: '#fff'
  },
  section: {
    backgroundColor: '#fff',
    border: '2px solid #d2691e',
    borderRadius: '10px',
    padding: '25px'
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '20px',
    color: '#8b4513',
    borderBottom: '2px solid #e0d5c7',
    paddingBottom: '15px'
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#faf5f0',
    borderRadius: '8px'
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#333'
  },
  filterBtn: {
    padding: '8px 14px',
    border: '1px solid #d2691e',
    backgroundColor: '#fff',
    color: '#d2691e',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  filterBtnActive: {
    backgroundColor: '#d2691e',
    color: '#fff'
  },
  ordersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '15px'
  },
  orderCard: {
    backgroundColor: '#faf5f0',
    border: '1px solid #e0d5c7',
    borderRadius: '8px',
    padding: '15px'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    paddingBottom: '10px',
    borderBottom: '1px solid #d2691e'
  },
  orderId: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#8b4513'
  },
  orderTime: {
    fontSize: '11px',
    color: '#999'
  },
  clientName: {
    margin: '8px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333'
  },
  total: {
    margin: '8px 0',
    fontSize: '13px',
    color: '#d2691e',
    fontWeight: 'bold'
  },
  statusSelect: {
    marginTop: '10px'
  },
  select: {
    width: '100%',
    padding: '8px',
    border: '1px solid #d2691e',
    borderRadius: '5px',
    fontSize: '13px',
    fontFamily: 'inherit'
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: '40px',
    gridColumn: '1 / -1'
  },
  stockGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px'
  },
  stockCard: {
    backgroundColor: '#faf5f0',
    border: '1px solid #e0d5c7',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center' as const
  },
  productLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#8b4513',
    marginBottom: '10px',
    textTransform: 'capitalize' as const
  },
  stockControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
    justifyContent: 'center'
  },
  stockBtn: {
    padding: '6px 12px',
    backgroundColor: '#d2691e',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  stockInput: {
    width: '50px',
    padding: '6px',
    border: '1px solid #d2691e',
    borderRadius: '4px',
    fontSize: '13px',
    textAlign: 'center' as const,
    fontFamily: 'inherit'
  },
  stockQty: {
    margin: 0,
    fontSize: '12px',
    fontWeight: 'bold'
  }
}

export default Funcionario

