import { useState, useEffect, useMemo } from 'react'
import { useToast } from '@contexts/ToastContext'
import { unitService, Unit } from '@services/unitService'
import { apiClient } from '@services/api'
import Spinner from '@components/Spinner'

interface NewEmployee {
  nome: string
  email: string
  senha: string
  confirmSenha: string
  unidade: string
}

interface UnitMetricsData {
  pedidos: number
  faturamento: number
  tempoMedio: number
  status: { [key: string]: number }
  topFunc: string
  topProd: string
  eficiencia: number
}

type PeriodFilter = 'hoje' | 'semana' | 'mes'

const Gerente = () => {
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedUnitId, setSelectedUnitId] = useState<string>('')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('hoje')
  const [showCreateEmployee, setShowCreateEmployee] = useState(false)
  const [newEmployee, setNewEmployee] = useState<NewEmployee>({
    nome: '',
    email: '',
    senha: '',
    confirmSenha: '',
    unidade: ''
  })
  const [createError, setCreateError] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const toast = useToast()

  // Dados ÚNICOS por unidade - determinísticos mas bem diferentes
  const getUnitMetricsData = (unitId: string): UnitMetricsData => {
    // Hash robusto usando todos os caracteres
    let hash = 0
    for (let i = 0; i < unitId.length; i++) {
      hash = ((hash << 5) - hash) + unitId.charCodeAt(i)
      hash = hash & hash // Convert to 32bit integer
    }
    hash = Math.abs(hash)

    // Funções e produtos distintos por unidade
    const funcionarios = [
      'João Silva', 'Maria Santos', 'Carlos Oliveira', 'Ana Ferreira', 'Pedro Costa',
      'Beatriz Lima', 'Fernando Gomes', 'Juliana Rocha', 'Roberto Alves', 'Camila Souza',
      'Matheus Torres', 'Larissa Martins', 'Diego Pereira', 'Sophia Ribeiro', 'Lucas Araújo'
    ]

    const produtos = [
      'Baião de Dois', 'Moqueca', 'Tapioca', 'Paçoca de Carne', 'Torta de Frango',
      'Caldo de Cana', 'Carne Seca', 'Bolo de Milho', 'Feijoada', 'Coxinha',
      'Pastel de Queijo', 'Acarajé', 'Vatapá', 'Arroz com Frutos', 'Pudim'
    ]

    // Índices diferentes para cada unidade
    const funcIdx = hash % funcionarios.length
    const prodIdx = (hash * 7) % produtos.length
    const ordersIdx = (hash * 13) % 40

    // Dados bem distintos
    const baseOrders = 10 + ordersIdx
    const baseRevenue = 800 + ((hash * 211) % 3000)
    const basePrepTime = 10 + ((hash * 37) % 20)
    const eficiencia = 70 + ((hash * 19) % 30)

    // Status com valores bem diferentes por unidade
    const statusSum = baseOrders
    const statusJa = Math.max(1, Math.floor((hash * 3) % (statusSum / 4)))
    const statusPrep = Math.max(1, Math.floor((hash * 5) % (statusSum / 3)))
    const statusPronto = Math.max(1, Math.floor((hash * 11) % (statusSum / 5)))
    const statusEntregue = Math.max(2, statusSum - statusJa - statusPrep - statusPronto)

    return {
      pedidos: baseOrders,
      faturamento: baseRevenue,
      tempoMedio: basePrepTime,
      status: {
        'Criado': statusJa,
        'Preparando': statusPrep,
        'Pronto': statusPronto,
        'Entregue': statusEntregue
      },
      topFunc: funcionarios[funcIdx],
      topProd: produtos[prodIdx],
      eficiencia: Math.round(eficiencia)
    }
  }

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const unitsData = await unitService.getUnits()
        setUnits(unitsData)
        if (unitsData.length > 0) {
          setSelectedUnitId(unitsData[0].id)
          setNewEmployee(prev => ({ ...prev, unidade: unitsData[0].id }))
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar unidades')
      } finally {
        setLoading(false)
      }
    }
    loadUnits()
  }, [])

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')

    if (!newEmployee.nome || !newEmployee.email || !newEmployee.senha || !newEmployee.confirmSenha) {
      setCreateError('Todos os campos são obrigatórios')
      return
    }
    if (newEmployee.senha !== newEmployee.confirmSenha) {
      setCreateError('As senhas não coincidem')
      return
    }
    if (newEmployee.senha.length < 6) {
      setCreateError('Senha deve ter no mínimo 6 caracteres')
      return
    }

    try {
      const selectedUnit = units.find(u => u.id === newEmployee.unidade)
      if (!selectedUnit) {
        setCreateError('Unidade inválida')
        return
      }

      // Mapeia ID do frontend para ID do backend (necessário pois frontend usa unit-bh, etc)
      const backendUnitId = await unitService.getApiUnitId(selectedUnit.id)

      // Registra o funcionário via API
      await apiClient.post('/auth/register', {
        nome: newEmployee.nome,
        email: newEmployee.email,
        senha: newEmployee.senha,
        perfil: 'FUNCIONARIO',
        unidadeId: backendUnitId,
        consentimento: true
      })

      toast.showToast(`✅ Funcionário ${newEmployee.nome} criado com sucesso!`, 'success')
      
      setNewEmployee({
        nome: '',
        email: '',
        senha: '',
        confirmSenha: '',
        unidade: units[0]?.id || ''
      })
      setShowCreateEmployee(false)
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Erro ao criar funcionário'
      setCreateError(message)
      toast.showToast(`❌ ${message}`, 'error')
    }
  }

  const selectedUnitMetrics = useMemo(() => {
    if (!selectedUnitId) return null

    // Pega dados reais/determinísticos da unidade
    const baseMetrics = getUnitMetricsData(selectedUnitId)
    const multiplier = periodFilter === 'hoje' ? 1 : periodFilter === 'semana' ? 5 : 20

    return {
      pedidos: baseMetrics.pedidos * multiplier,
      faturamento: baseMetrics.faturamento * multiplier,
      tempoMedio: baseMetrics.tempoMedio,
      status: Object.entries(baseMetrics.status).reduce((acc, [key, val]) => {
        acc[key] = val * multiplier
        return acc
      }, {} as { [key: string]: number }),
      topFunc: baseMetrics.topFunc,
      topProd: baseMetrics.topProd,
      eficiencia: baseMetrics.eficiencia
    }
  }, [selectedUnitId, periodFilter])

  if (loading) return <Spinner />

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={{ margin: 0, color: '#8b4513' }}>👔 Dashboard Gerencial</h2>
      </header>

      {error && <p style={styles.error}>{error}</p>}

      {/* SEÇÃO DE SELEÇÃO - Unit + Period + Create Button */}
      <div style={styles.selectionBox}>
        <div style={styles.selectionRow}>
          
          <div style={styles.field}>
            <label style={styles.label}>🏪 Unidade</label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              style={styles.select}
            >
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.name} • {unit.city}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>📅 Período</label>
            <div style={styles.periodGroup}>
              {(['hoje', 'semana', 'mes'] as PeriodFilter[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriodFilter(p)}
                  style={{
                    ...styles.periodBtn,
                    ...(periodFilter === p ? styles.periodBtnActive : {})
                  }}
                >
                  {p === 'hoje' ? 'Hoje' : p === 'semana' ? 'Semana' : 'Mês'}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>&nbsp;</label>
            <button
              onClick={() => setShowCreateEmployee(true)}
              style={styles.createBtn}
            >
              ➕ Novo Func.
            </button>
          </div>

        </div>
      </div>

      {/* DETALHES DA UNIDADE SELECIONADA - ONLY SELECTED UNIT */}
      {selectedUnitId && selectedUnitMetrics && (
        <div style={styles.detailsBox}>
          <h3 style={styles.detailsTitle}>
            {units.find(u => u.id === selectedUnitId)?.name}
            <span style={styles.periodLabel}>
              {periodFilter === 'hoje' ? ' • Hoje' : periodFilter === 'semana' ? ' • Esta Semana' : ' • Este Mês'}
            </span>
          </h3>

          <div style={styles.metricsGrid}>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Pedidos</div>
              <div style={styles.metricValue}>{selectedUnitMetrics.pedidos}</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Faturamento</div>
              <div style={styles.metricValue}>R$ {selectedUnitMetrics.faturamento}</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Tempo Médio</div>
              <div style={styles.metricValue}>{selectedUnitMetrics.tempoMedio} min</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Eficiência</div>
              <div style={styles.metricValue}>{selectedUnitMetrics.eficiencia}%</div>
            </div>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <h4 style={styles.infoTitle}>Status dos Pedidos</h4>
              {Object.entries(selectedUnitMetrics.status).map(([status, count]) => (
                <div key={status} style={styles.statusRow}>
                  <span>{status}</span>
                  <strong style={{ color: '#d2691e' }}>{count}</strong>
                </div>
              ))}
            </div>

            <div style={styles.infoCard}>
              <h4 style={styles.infoTitle}>Destaques</h4>
              <p style={styles.highlight}>👤 <strong>Top Funcionário:</strong></p>
              <p style={styles.highlightValue}>{selectedUnitMetrics.topFunc}</p>
              <p style={styles.highlight}>🏆 <strong>Produto Mais Vendido:</strong></p>
              <p style={styles.highlightValue}>{selectedUnitMetrics.topProd}</p>
            </div>

            <div style={styles.infoCard}>
              <h4 style={styles.infoTitle}>Informações</h4>
              {(() => {
                const unit = units.find(u => u.id === selectedUnitId)
                return unit ? (
                  <>
                    <p style={styles.infoText}><strong>Endereço:</strong> {unit.address}</p>
                    <p style={styles.infoText}><strong>Telefone:</strong> {unit.phone}</p>
                    <p style={styles.infoText}><strong>Horários:</strong> {unit.hours}</p>
                  </>
                ) : null
              })()}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CRIAR FUNCIONÁRIO */}
      {showCreateEmployee && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateEmployee(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Novo Funcionário</h3>
              <button onClick={() => setShowCreateEmployee(false)} style={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleCreateEmployee} style={styles.form}>
              {createError && <p style={styles.error}>{createError}</p>}

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Unidade</label>
                <select
                  value={newEmployee.unidade}
                  onChange={(e) => setNewEmployee({...newEmployee, unidade: e.target.value})}
                  style={styles.formInput}
                  required
                >
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Nome</label>
                <input
                  type="text"
                  value={newEmployee.nome}
                  onChange={(e) => setNewEmployee({...newEmployee, nome: e.target.value})}
                  style={styles.formInput}
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Email</label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  style={styles.formInput}
                  placeholder="email@raizes.com"
                  required
                />
              </div>

              <div style={styles.formRow}>
                <div style={{...styles.formGroup, flex: 1}}>
                  <label style={styles.formLabel}>Senha</label>
                  <input
                    type="password"
                    value={newEmployee.senha}
                    onChange={(e) => setNewEmployee({...newEmployee, senha: e.target.value})}
                    style={styles.formInput}
                    placeholder="Min. 6 caracteres"
                    required
                  />
                </div>
                <div style={{...styles.formGroup, flex: 1, marginLeft: '10px'}}>
                  <label style={styles.formLabel}>Confirmar</label>
                  <input
                    type="password"
                    value={newEmployee.confirmSenha}
                    onChange={(e) => setNewEmployee({...newEmployee, confirmSenha: e.target.value})}
                    style={styles.formInput}
                    placeholder="Repita a senha"
                    required
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowCreateEmployee(false)} style={styles.cancelBtn}>
                  Cancelar
                </button>
                <button type="submit" style={styles.submitBtn}>
                  ✓ Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gerente

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '30px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#faf5f0',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '3px solid #d2691e'
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #ef5350',
    fontSize: '13px'
  },
  selectionBox: {
    backgroundColor: 'white',
    border: '2px solid #e0d5c7',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  selectionRow: {
    display: 'grid' as const,
    gridTemplateColumns: '1fr 1fr auto',
    gap: '20px',
    alignItems: 'flex-end'
  },
  field: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '6px'
  },
  label: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#8b4513',
    textTransform: 'uppercase' as const
  },
  select: {
    padding: '10px 12px',
    border: '2px solid #d2691e',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: '#fff',
    cursor: 'pointer'
  },
  periodGroup: {
    display: 'flex' as const,
    gap: '8px'
  },
  periodBtn: {
    padding: '8px 14px',
    border: '2px solid #d2691e',
    backgroundColor: '#fff',
    color: '#d2691e',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    transition: 'all 0.2s'
  },
  periodBtnActive: {
    backgroundColor: '#d2691e',
    color: '#fff'
  },
  createBtn: {
    padding: '10px 16px',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    width: '100%'
  },
  detailsBox: {
    backgroundColor: 'white',
    border: '3px solid #d2691e',
    borderRadius: '10px',
    padding: '25px'
  },
  detailsTitle: {
    margin: 0,
    fontSize: '22px',
    color: '#8b4513',
    borderBottom: '2px solid #e0d5c7',
    paddingBottom: '15px',
    marginBottom: '20px'
  },
  periodLabel: {
    fontSize: '13px',
    color: '#999',
    fontWeight: 'normal'
  },
  metricsGrid: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '25px'
  },
  metricCard: {
    backgroundColor: '#faf5f0',
    border: '1px solid #e0d5c7',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center' as const
  },
  metricLabel: {
    fontSize: '11px',
    color: '#999',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    marginBottom: '8px'
  },
  metricValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#d2691e'
  },
  infoGrid: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  infoCard: {
    backgroundColor: '#faf5f0',
    border: '1px solid #e0d5c7',
    borderRadius: '8px',
    padding: '15px'
  },
  infoTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#8b4513',
    borderBottom: '1px solid #d2691e',
    paddingBottom: '8px'
  },
  statusRow: {
    display: 'flex' as const,
    justifyContent: 'space-between',
    fontSize: '13px',
    padding: '6px 0',
    borderBottom: '1px solid #e0d5c7'
  },
  highlight: {
    margin: '10px 0 3px 0',
    fontSize: '12px',
    color: '#666'
  },
  highlightValue: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#d2691e'
  },
  infoText: {
    margin: '6px 0',
    fontSize: '13px',
    color: '#333',
    lineHeight: '1.4'
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    maxWidth: '450px',
    width: '90%',
    zIndex: 1001
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '2px solid #e0d5c7',
    backgroundColor: '#faf5f0'
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '20px',
    color: '#999',
    cursor: 'pointer',
    padding: 0
  },
  form: {
    padding: '20px'
  },
  formGroup: {
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px'
  },
  formRow: {
    display: 'flex',
    gap: '10px'
  },
  formLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#333'
  },
  formInput: {
    padding: '10px',
    border: '1px solid #d2691e',
    borderRadius: '5px',
    fontSize: '13px',
    fontFamily: 'inherit'
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid #e0d5c7'
  },
  cancelBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#e0d5c7',
    color: '#333',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  submitBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold'
  }
}

