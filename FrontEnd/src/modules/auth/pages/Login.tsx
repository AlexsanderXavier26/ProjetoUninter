import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import { useToast } from '@contexts/ToastContext'
import { getErrorMessage } from '../../../utils/errorHandler'
import styles from './Login.module.css'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, isAuthenticated, perfil } = useAuth()

  // se já autenticado, redirecionar conforme perfil
  React.useEffect(() => {
    if (isAuthenticated) {
      switch (perfil) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'GERENTE':
        case 'GERENTE_REGIONAL':
          navigate('/gerente');
          break;
        case 'FUNCIONARIO':
          navigate('/funcionario');
          break;
        case 'CLIENTE':
        default:
          navigate('/app');
      }
    }
  }, [isAuthenticated, perfil, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !senha) {
      const msg = 'Email e senha são obrigatórios'
      setError(msg)
      toast.showToast(msg, 'error')
      return
    }
    setLoading(true)

    try {
      // Chama função de login - Alexsander Xavier - 4338139
      const res = await login(email, senha)
      
      if (typeof res === 'string' && res) {
        setError(res)
        toast.showToast(res, 'error')
        setLoading(false)
        return
      }

      // Aguarda o localStorage e contexto se estabilizarem
      await new Promise((resolve) => setTimeout(resolve, 150))

      const userString = localStorage.getItem('user')
      const loggedUser = userString ? JSON.parse(userString) : null

      if (!loggedUser) {
        setError('Usuário não encontrado após login')
        toast.showToast('Usuário não encontrado após login', 'error')
        setLoading(false)
        return
      }

      toast.showToast('Login bem‑sucedido', 'success')
      // Redireciona conforme perfil (role) do usuário - Alexsander Xavier - 4338139
      switch (loggedUser?.role) {
        case 'ADMIN':
          navigate('/admin')
          break
        case 'GERENTE':
        case 'GERENTE_REGIONAL':
          navigate('/gerente')
          break
        case 'FUNCIONARIO':
          navigate('/funcionario')
          break
        case 'CLIENTE':
          navigate('/app')
          break
        default:
          navigate('/')
      }
      setLoading(false)
    } catch (err: any) {
      const msg = getErrorMessage(err)
      setError(msg)
      toast.showToast(msg, 'error')
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1>Raízes do Nordeste</h1>
          <p className={styles.subtitle}>Sistema de Gestão de Pedidos</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          {/* apenas campos de login */}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              disabled={loading}
            />
          </div>


          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => navigate('/register')}
            >
              Registrar nova conta
            </button>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => navigate('/totem')}
            >
              Acessar Totem
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
