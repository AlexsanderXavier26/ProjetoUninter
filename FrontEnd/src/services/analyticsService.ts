// Alexsander Xavier - 4338139
// Analytics Service - Dados simulados para dashboard do gerente
// Responsável por fornecer KPIs, produtividade e indicadores por unidade

export interface UnitAnalytics {
  id: string
  name: string
  type: 'COMPLETA' | 'REDUZIDA'
  ordersToday: number
  revenueToday: number
  avgTicket: number
  avgPrepTime: number
  cancellationRate: number
  employees: EmployeeAnalytics[]
}

export interface EmployeeAnalytics {
  id: string
  name: string
  unitId: string
  unitName: string
  ordersHandled: number
  avgTime: number // em minutos
  efficiency: number // porcentagem
}

export interface ManagerKPIs {
  totalOrders: number
  totalRevenue: number
  avgTicket: number
  avgPrepTime: number
  cancellationRate: number
  totalEmployees: number
}

// Unidades padronizadas
const UNITS = [
  { id: 'unit-bh', name: 'Raízes Belo Horizonte', type: 'COMPLETA' as const },
  { id: 'unit-rj', name: 'Raízes Rio de Janeiro', type: 'COMPLETA' as const },
  { id: 'unit-sp', name: 'Raízes São Paulo', type: 'COMPLETA' as const },
  { id: 'unit-ctba', name: 'Raízes Curitiba', type: 'REDUZIDA' as const },
  { id: 'unit-cl', name: 'Raízes Conselheiro Lafaiete', type: 'REDUZIDA' as const }
]

// Funcionários simulados por unidade
const EMPLOYEES: EmployeeAnalytics[] = [
  // Belo Horizonte (COMPLETA - mais funcionários)
  { id: 'emp-bh-1', name: 'Maria Silva', unitId: 'unit-bh', unitName: 'Raízes Belo Horizonte', ordersHandled: 45, avgTime: 12, efficiency: 92 },
  { id: 'emp-bh-2', name: 'João Santos', unitId: 'unit-bh', unitName: 'Raízes Belo Horizonte', ordersHandled: 38, avgTime: 15, efficiency: 85 },
  { id: 'emp-bh-3', name: 'Ana Costa', unitId: 'unit-bh', unitName: 'Raízes Belo Horizonte', ordersHandled: 52, avgTime: 11, efficiency: 95 },
  { id: 'emp-bh-4', name: 'Pedro Lima', unitId: 'unit-bh', unitName: 'Raízes Belo Horizonte', ordersHandled: 41, avgTime: 13, efficiency: 88 },

  // Rio de Janeiro (COMPLETA)
  { id: 'emp-rj-1', name: 'Carla Oliveira', unitId: 'unit-rj', unitName: 'Raízes Rio de Janeiro', ordersHandled: 48, avgTime: 10, efficiency: 96 },
  { id: 'emp-rj-2', name: 'Roberto Ferreira', unitId: 'unit-rj', unitName: 'Raízes Rio de Janeiro', ordersHandled: 35, avgTime: 14, efficiency: 82 },
  { id: 'emp-rj-3', name: 'Luciana Pereira', unitId: 'unit-rj', unitName: 'Raízes Rio de Janeiro', ordersHandled: 50, avgTime: 9, efficiency: 98 },

  // São Paulo (COMPLETA)
  { id: 'emp-sp-1', name: 'Fernando Alves', unitId: 'unit-sp', unitName: 'Raízes São Paulo', ordersHandled: 55, avgTime: 8, efficiency: 99 },
  { id: 'emp-sp-2', name: 'Patricia Rodrigues', unitId: 'unit-sp', unitName: 'Raízes São Paulo', ordersHandled: 42, avgTime: 12, efficiency: 90 },
  { id: 'emp-sp-3', name: 'Carlos Mendes', unitId: 'unit-sp', unitName: 'Raízes São Paulo', ordersHandled: 47, avgTime: 11, efficiency: 93 },
  { id: 'emp-sp-4', name: 'Sandra Gomes', unitId: 'unit-sp', unitName: 'Raízes São Paulo', ordersHandled: 39, avgTime: 13, efficiency: 87 },

  // Curitiba (REDUZIDA - menos funcionários)
  { id: 'emp-ctba-1', name: 'Marcos Vieira', unitId: 'unit-ctba', unitName: 'Raízes Curitiba', ordersHandled: 28, avgTime: 16, efficiency: 78 },
  { id: 'emp-ctba-2', name: 'Juliana Castro', unitId: 'unit-ctba', unitName: 'Raízes Curitiba', ordersHandled: 32, avgTime: 14, efficiency: 84 },

  // Conselheiro Lafaiete (REDUZIDA)
  { id: 'emp-cl-1', name: 'Ricardo Barbosa', unitId: 'unit-cl', unitName: 'Raízes Conselheiro Lafaiete', ordersHandled: 25, avgTime: 17, efficiency: 75 },
  { id: 'emp-cl-2', name: 'Beatriz Souza', unitId: 'unit-cl', unitName: 'Raízes Conselheiro Lafaiete', ordersHandled: 30, avgTime: 15, efficiency: 80 }
]

// Dados simulados por unidade
const UNIT_ANALYTICS: UnitAnalytics[] = [
  {
    id: 'unit-bh',
    name: 'Raízes Belo Horizonte',
    type: 'COMPLETA',
    ordersToday: 176,
    revenueToday: 15480,
    avgTicket: 88,
    avgPrepTime: 13,
    cancellationRate: 2.1,
    employees: EMPLOYEES.filter(e => e.unitId === 'unit-bh')
  },
  {
    id: 'unit-rj',
    name: 'Raízes Rio de Janeiro',
    type: 'COMPLETA',
    ordersToday: 133,
    revenueToday: 11870,
    avgTicket: 89,
    avgPrepTime: 11,
    cancellationRate: 1.8,
    employees: EMPLOYEES.filter(e => e.unitId === 'unit-rj')
  },
  {
    id: 'unit-sp',
    name: 'Raízes São Paulo',
    type: 'COMPLETA',
    ordersToday: 183,
    revenueToday: 16240,
    avgTicket: 89,
    avgPrepTime: 10,
    cancellationRate: 1.5,
    employees: EMPLOYEES.filter(e => e.unitId === 'unit-sp')
  },
  {
    id: 'unit-ctba',
    name: 'Raízes Curitiba',
    type: 'REDUZIDA',
    ordersToday: 60,
    revenueToday: 4920,
    avgTicket: 82,
    avgPrepTime: 15,
    cancellationRate: 3.2,
    employees: EMPLOYEES.filter(e => e.unitId === 'unit-ctba')
  },
  {
    id: 'unit-cl',
    name: 'Raízes Conselheiro Lafaiete',
    type: 'REDUZIDA',
    ordersToday: 55,
    revenueToday: 4180,
    avgTicket: 76,
    avgPrepTime: 16,
    cancellationRate: 2.8,
    employees: EMPLOYEES.filter(e => e.unitId === 'unit-cl')
  }
]

// Função para obter KPIs gerais do gerente
export const getManagerKPIs = (): ManagerKPIs => {
  const totalOrders = UNIT_ANALYTICS.reduce((sum, unit) => sum + unit.ordersToday, 0)
  const totalRevenue = UNIT_ANALYTICS.reduce((sum, unit) => sum + unit.revenueToday, 0)
  const avgTicket = Math.round(totalRevenue / totalOrders)
  const avgPrepTime = Math.round(UNIT_ANALYTICS.reduce((sum, unit) => sum + unit.avgPrepTime, 0) / UNIT_ANALYTICS.length)
  const cancellationRate = Number((UNIT_ANALYTICS.reduce((sum, unit) => sum + unit.cancellationRate, 0) / UNIT_ANALYTICS.length).toFixed(1))
  const totalEmployees = EMPLOYEES.length

  return {
    totalOrders,
    totalRevenue,
    avgTicket,
    avgPrepTime,
    cancellationRate,
    totalEmployees
  }
}

// Função para obter analytics por unidade
export const getUnitAnalytics = (): UnitAnalytics[] => {
  return UNIT_ANALYTICS
}

// Função para obter produtividade dos funcionários
export const getEmployeeAnalytics = (): EmployeeAnalytics[] => {
  return EMPLOYEES
}

// Função para filtrar analytics por unidade
export const getUnitAnalyticsById = (unitId: string): UnitAnalytics | undefined => {
  return UNIT_ANALYTICS.find(unit => unit.id === unitId)
}

// Função para obter unidades disponíveis
export const getUnits = () => {
  return UNITS
}