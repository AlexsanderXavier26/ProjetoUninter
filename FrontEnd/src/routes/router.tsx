// Definição de rotas da aplicação
/**
 * Estrutura de rotas:
 * - "/" (Home) - Landing page pública
 * - "/login" - Login de usuários
 * - "/register" - Registro de novos clientes
 * - "/totem" - Totem de autoatendimento (sem login)
 * - "/admin" - Dashboard administrativo (requer ADMIN)
 * - "/gerente" - Área do gerente regional (requer GERENTE_REGIONAL)
 * - "/funcionario" - Área do funcionário (requer FUNCIONARIO)
 * - "/app" - Cardápio do cliente (requer CLIENTE)
 * - "/app/pedido/:id" - Status do pedido (requer CLIENTE)
 * 
 * Alexsander Xavier - 4338139
 */

import { ReactNode } from 'react'
import Home from '@modules/home/pages/Home'
import Login from '@modules/auth/pages/Login'
import Register from '@modules/auth/pages/Register'
import Admin from '@modules/admin/pages/Admin'
import Gerente from '@modules/gerente/pages/Gerente'
import Funcionario from '@modules/funcionario/pages/Funcionario'
import EstoqueManagement from '@modules/estoque/pages/EstoqueManagement'
import ClienteDashboard from '../modules/cliente/pages/ClienteDashboard'
import ClientePedidoStatus from '../modules/cliente/pages/ClientePedidoStatus'
import PedidoTypeSelection from '../modules/cliente/pages/PedidoTypeSelection'
import EnderecoPage from '../modules/cliente/pages/EnderecoPage'
import AppCheckout from '../modules/cliente/pages/AppCheckout'
import OrderTracking from '@modules/pedido/pages/OrderTracking'
import TotemPage from '../pages/TotemPage'
import { ProtectedRoute } from '@components/ProtectedRoute'

export interface RouteConfig {
  path: string
  element: ReactNode
  protected?: boolean
  allowedRoles?: string[]
}

export const routes: RouteConfig[] = [
  // Rota pública - Home/Landing page - Alexsander Xavier - 4338139
  {
    path: '/',
    element: <Home />,
  },
  
  // Rotas de autenticação (públicas) - Alexsander Xavier - 4338139
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },

  // Totem de autoatendimento (sem login) - Alexsander Xavier - 4338139
  {
    path: '/totem',
    element: <TotemPage />,
  },

  // Rastreamento de pedido (público - qualquer um pode acompanhar com ID) - Alexsander Xavier - 4338139
  {
    path: '/pedido/:id',
    element: <OrderTracking />,
  },

  // Rotas protegidas por perfil - Alexsander Xavier - 4338139
  
  // ADMIN: Gerenciamento de usuários e dashboard
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['ADMIN']}><Admin /></ProtectedRoute>,
    protected: true,
  },

  // GERENTE_REGIONAL: Gerenciar funcionários e pedidos da região
  {
    path: '/gerente',
    element: <ProtectedRoute allowedRoles={['GERENTE_REGIONAL']}><Gerente /></ProtectedRoute>,
    protected: true,
  },

  // FUNCIONARIO: Registrar e atualizar pedidos
  {
    path: '/funcionario',
    element: <ProtectedRoute allowedRoles={['FUNCIONARIO']}><Funcionario /></ProtectedRoute>,
    protected: true,
  },

  // GERENTE / FUNCIONÁRIO: Gerenciar estoque de produtos por unidade - Alexsander Xavier - 4338139
  {
    path: '/estoque',
    element: <ProtectedRoute allowedRoles={['GERENTE_REGIONAL', 'FUNCIONARIO']}><EstoqueManagement /></ProtectedRoute>,
    protected: true,
  },

  // CLIENTE: Visualizar cardápio e fazer pedidos
  {
    path: '/app',
    element: <ProtectedRoute allowedRoles={['CLIENTE']}><ClienteDashboard /></ProtectedRoute>,
    protected: true,
  },

  // CLIENTE: Selecionar tipo de pedido (retirada/entrega)
  {
    path: '/app/pedido-tipo',
    element: <ProtectedRoute allowedRoles={['CLIENTE']}><PedidoTypeSelection /></ProtectedRoute>,
    protected: true,
  },

  // CLIENTE: Informar endereço para entrega
  {
    path: '/app/endereco',
    element: <ProtectedRoute allowedRoles={['CLIENTE']}><EnderecoPage /></ProtectedRoute>,
    protected: true,
  },

  // CLIENTE: Checkout do APP
  {
    path: '/app/checkout',
    element: <ProtectedRoute allowedRoles={['CLIENTE']}><AppCheckout /></ProtectedRoute>,
    protected: true,
  },

  // CLIENTE: Ver status do pedido específico
  {
    path: '/app/pedido/:id',
    element: <ProtectedRoute allowedRoles={['CLIENTE']}><ClientePedidoStatus /></ProtectedRoute>,
    protected: true,
  },
]

