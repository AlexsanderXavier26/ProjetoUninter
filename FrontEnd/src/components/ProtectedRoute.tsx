// Alexsander Xavier - 4338139
// Componente ProtectedRoute - Protege rotas que exigem autenticação e permissões
import React, { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
}

/**
 * ProtectedRoute verifica:
 * 1. Se usuário está autenticado (tem token)
 * 2. Se tem permissão (role) para acessar a rota
 * 3. Se não autorizado, redireciona para a rota apropriada
 * 
 * Alexsander Xavier - 4338139
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, perfil, loading } = useAuth() as any

  // Enquanto está carregando, não redireciona - Alexsander Xavier - 4338139
  if (loading) {
    console.log('[ProtectedRoute] Ainda carregando, aguardando...')
    return null
  }

  // Se não está autenticado, redireciona para login - Alexsander Xavier - 4338139
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Não autenticado, redirecionando para /login')
    return <Navigate to="/login" replace />
  }

  // Verifica se tem role/permissão para acessar - Alexsander Xavier - 4338139
  if (allowedRoles && perfil && !allowedRoles.includes(perfil)) {
    // Redireciona para área padrão do seu perfil - Alexsander Xavier - 4338139
    const defaultPath = (() => {
      switch (perfil) {
        case 'ADMIN':
          return '/admin'
        case 'GERENTE':
        case 'GERENTE_REGIONAL':
          return '/gerente'
        case 'FUNCIONARIO':
          return '/funcionario'
        case 'CLIENTE':
        default:
          return '/app'
      }
    })()
    return <Navigate to={defaultPath} replace />;
  }

  // Usuário autorizado - renderiza componente protegido - Alexsander Xavier - 4338139
  return <>{children}</>
}

