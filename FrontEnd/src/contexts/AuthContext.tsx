// Contexto de Autenticação - Gerencia estado de login e usuário
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@services/api'

interface User {
  id: number
  name: string
  email: string
  role: string
  unitId?: string
}

interface LoginResponse {
  accessToken: string
  user: User
}

interface AuthState {
  token: string | null
  user: User | null
}

interface AuthContextData extends AuthState {
  // Faz login do usuário (email + senha)
  login: (email: string, senha: string) => Promise<string | void>
  // Registra novo usuário
  register: (data: { nome: string; email: string; senha: string; perfil: string; codigo?: string }) => Promise<string | any>
  // Logout do usuário
  logout: () => void
  // Indica se há usuário logado
  isAuthenticated: boolean
  // Role/perfil do usuário logado
  perfil: string | null
  // Indica se ainda está carregando autenticação do localStorage
  loading: boolean
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ token: null, user: null })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Recupera dados de autenticação persistidos no localStorage - Alexsander Xavier - 4338139
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userString = localStorage.getItem('user')

    if (token && userString) {
      try {
        const user = JSON.parse(userString)
        setState({ token, user })
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  // Faz login do usuário - Alexsander Xavier - 4338139
  const login = async (email: string, senha: string) => {
    try {
      const loginPayload: any = { email, senha }
      
      // Se for admin, aceita alias de senha e adiciona código
      if (email === 'admin@admin.com' && senha === 'admin') {
        loginPayload.codigo = '123456'
        loginPayload.senha = 'adm123'
      }
      
      const response = await apiClient.post<any>('/auth/login', loginPayload)
      const data = response.data

      // Persiste credenciais - Alexsander Xavier - 4338139
      const token = data.accessToken || data.access_token
      const user = data.user || { 
        id: data.id,
        name: data.nome,
        email: data.email,
        role: data.perfil,
        unitId: data.unitId
      }
      
      // Decodifica JWT para pegar dados adicionais (unitId, regiaoId)
      try {
        const parts = token.split('.')
        if (parts.length === 3) {
          const decoded = JSON.parse(atob(parts[1]))
          if (decoded.unidadeId && !user.unitId) {
            user.unitId = decoded.unidadeId
          }
        }
      } catch (e) {
        // Ignore JWT decode errors
      }
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setState({ token, user })
    } catch (err: any) {
      // Fallback: se API falhar, permite login local para desenvolvimento
      // Alexsander Xavier - 4338139
      if (err?.code === 'ERR_NETWORK' || err?.message?.includes('CORS') || err?.message?.includes('Network Error')) {
        // Login admin em modo offline
        if (email === 'admin@admin.com' && senha === 'adm123') {
          const fakeToken = 'fake-admin-token-' + Date.now()
          const user: User = {
            id: 0,
            name: 'Administrador Master',
            email: 'admin@admin.com',
            role: 'ADMIN',
          }
          localStorage.setItem('token', fakeToken)
          localStorage.setItem('user', JSON.stringify(user))
          setState({ token: fakeToken, user })
          return 'Offline mode'
        }

        // Login dev para testes
        if (email === 'dev@local.com' && senha === 'dev123') {
          const fakeToken = 'fake-dev-token-' + Date.now()
          const user: User = {
            id: 999,
            name: 'Desenvolvedor Local',
            email: 'dev@local.com',
            role: 'ADMIN',
          }
          localStorage.setItem('token', fakeToken)
          localStorage.setItem('user', JSON.stringify(user))
          setState({ token: fakeToken, user })
          return 'Login em modo desenvolvimento (API indisponível)'
        }

        return 'Erro de conexão com servidor. Tente novamente mais tarde.'
      }

      // Retorna mensagem de erro como string pura
      return err?.response?.data?.message || err?.response?.data?.mensagem || 'Email ou senha inválidos'
    }
  }

  // Registra novo usuário - Alexsander Xavier - 4338139
  const register = async (data: { nome: string; email: string; senha: string; perfil: string; codigo?: string }) => {
    try {
      const response = await apiClient.post('/auth/register', data)
      if (response.status === 201 || response.status === 200) {
        return response.data
      }
    } catch (err: any) {
      // Trata erro 409 (usuário já existe) - Alexsander Xavier - 4338139
      if (err?.response?.status === 409) {
        return { error: 'Usuário já cadastrado. Tente fazer login.' }
      }

      // Fallback: se API falhar, simula registro para desenvolvimento
      // Alexsander Xavier - 4338139
      if (err?.code === 'ERR_NETWORK' || err?.message?.includes('CORS') || err?.message?.includes('Network Error')) {
        // Simula registro bem-sucedido para desenvolvimento
        const fakeUser = {
          id: Date.now(),
          name: data.nome,
          email: data.email,
          role: data.perfil.toUpperCase(),
          message: 'Registro realizado em modo desenvolvimento (API indisponível)'
        }

        return fakeUser
      }

      const message = err?.response?.data?.message || err?.message || 'Erro ao registrar'
      throw new Error(message)
    }
  }

  // Logout do usuário - Alexsander Xavier - 4338139
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setState({ token: null, user: null })
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        perfil: state.user?.role || null,
        login,
        register,
        logout,
        isAuthenticated: !!state.token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar contexto de autenticação - Alexsander Xavier - 4338139
export const useAuth = () => useContext(AuthContext)

