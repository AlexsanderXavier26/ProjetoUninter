import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import { useToast } from '@contexts/ToastContext'
import { getErrorMessage } from '../../../utils/errorHandler'
import styles from './Login.module.css'

const Register: React.FC = () => {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmSenha, setConfirmSenha] = useState('')
  const [aceitaLGPD, setAceitaLGPD] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const { register, login, isAuthenticated, perfil } = useAuth()

  // Se já autenticado, redirecionar conforme perfil - Alexsander Xavier - 4338139
  React.useEffect(() => {
    if (isAuthenticated) {
      switch (perfil) {
        case 'ADMIN':
          navigate('/admin');
          break;
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
    
    // Validações - Alexsander Xavier - 4338139
    if (!nome || !email || !senha || !confirmSenha) {
      const msg = 'Preencha todos os campos'
      setError(msg)
      toast.showToast(msg, 'error')
      return
    }
    
    if (!aceitaLGPD) {
      const msg = 'Você deve aceitar os termos e uso dos dados (LGPD)'
      setError(msg)
      toast.showToast(msg, 'error')
      return
    }
    
    if (senha.length < 6) {
      const msg = 'A senha deve ter no mínimo 6 caracteres'
      setError(msg)
      toast.showToast(msg, 'error')
      return
    }
    
    if (senha !== confirmSenha) {
      const msg = 'As senhas não coincidem'
      setError(msg)
      toast.showToast(msg, 'error')
      return
    }

    try {
      setLoading(true)
      // Registra cliente - Alexsander Xavier - 4338139
      await register({ nome, email, senha, perfil: 'CLIENTE' })
      
      // Auto-login após cadastro bem-sucedido - Alexsander Xavier - 4338139
      await login(email, senha)
      
      toast.showToast('Cadastro realizado com sucesso!', 'success')
      navigate('/app')
    } catch (err: any) {
      const msg = getErrorMessage(err)
      setError(msg)
      toast.showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1>Raízes do Nordeste</h1>
          <p className={styles.subtitle}>Cadastro de Cliente</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="nome">Nome completo</label>
            <input
              id="nome"
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              disabled={loading}
            />
          </div>

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

          <div className={styles.formGroup}>
            <label htmlFor="confirmSenha">Confirmar senha</label>
            <input
              id="confirmSenha"
              type="password"
              placeholder="Repita a senha"
              value={confirmSenha}
              onChange={(e) => setConfirmSenha(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Checkbox LGPD - Alexsander Xavier - 4338139 */}
          <div style={{ marginBottom: '1rem' }} className={styles.formGroup}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={aceitaLGPD}
                onChange={(e) => setAceitaLGPD(e.target.checked)}
                disabled={loading}
                required
                style={{ marginTop: '4px' }}
              />
              <span style={{ fontSize: '0.9rem' }}>
                Aceito os{' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacy(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#d2691e',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: 0,
                    font: 'inherit'
                  }}
                >
                  termos e proteção de dados (LGPD)
                </button>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Registrar'}
          </button>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => navigate('/login')}
            >
              Voltar ao login
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

        {/* PrivacyModal - Alexsander Xavier - 4338139 */}
        {showPrivacy && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowPrivacy(false)}
          >
            <div
              style={{
                background: '#faf5f0',
                borderRadius: '8px',
                padding: '2rem',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '2px solid #d2691e'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ color: '#8b4513', marginBottom: '1rem', fontSize: '1.5rem' }}>
                Termos de Proteção de Dados
              </h2>

              <div style={{ color: '#5d4037', lineHeight: '1.6', fontSize: '0.95rem' }}>
                <h3 style={{ color: '#d2691e', marginTop: '1rem', marginBottom: '0.5rem' }}>
                  1. LGPD (Lei Geral de Proteção de Dados)
                </h3>
                <p>
                  Conforme a Lei Geral de Proteção de Dados Pessoais (LGPD), ao concordar com estes termos, você autoriza:
                </p>
                <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                  <li>Coleta e armazenamento de seu nome, email e dados de perfil</li>
                  <li>Processamento de pedidos e histórico de compras</li>
                  <li>Análise de dados para melhorar nossos serviços</li>
                  <li>Comunicações relacionadas à sua conta e pedidos</li>
                </ul>

                <h3 style={{ color: '#d2691e', marginTop: '1rem', marginBottom: '0.5rem' }}>
                  2. Direitos do Usuário
                </h3>
                <p>
                  Você possui os seguintes direitos sobre seus dados pessoais:
                </p>
                <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                  <li><strong>Acesso</strong>: Solicitar cópia de seus dados</li>
                  <li><strong>Correção</strong>: Atualizar informações incorretas</li>
                  <li><strong>Exclusão</strong>: Solicitar remoção de seus dados (direito ao esquecimento)</li>
                  <li><strong>Portabilidade</strong>: Receber dados em formato portável</li>
                  <li><strong>Revogação</strong>: Retirar consentimento a qualquer momento</li>
                </ul>

                <h3 style={{ color: '#d2691e', marginTop: '1rem', marginBottom: '0.5rem' }}>
                  3. Segurança dos Dados
                </h3>
                <p>
                  Implementamos medidas técnicas e organizacionais para proteger seus dados contra:
                </p>
                <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                  <li>Acesso não autorizado</li>
                  <li>Alteração ou destruição indevida</li>
                  <li>Vazamento de informações</li>
                </ul>

                <h3 style={{ color: '#d2691e', marginTop: '1rem', marginBottom: '0.5rem' }}>
                  4. Retenção de Dados
                </h3>
                <p>
                  Seus dados serão mantidos pelo tempo necessário para os fins declarados ou conforme exigido pela lei.
                  Você pode solicitar exclusão a qualquer momento.
                </p>

                <h3 style={{ color: '#d2691e', marginTop: '1rem', marginBottom: '0.5rem' }}>
                  5. Contato
                </h3>
                <p>
                  Para exercer seus direitos LGPD ou esclarecer dúvidas, entre em contato através de nossos canais oficiais.
                </p>

                <div style={{
                  background: '#fff8f0',
                  border: '1px solid #d2691e',
                  padding: '1rem',
                  borderRadius: '6px',
                  marginTop: '1.5rem',
                  fontSize: '0.9rem'
                }}>
                  <strong style={{ color: '#8b4513' }}>Consentimento:</strong> Ao marcar "Aceito os termos e proteção de dados (LGPD)",
                  você declara que leu, entendeu e concorda com esta política de proteção de dados.
                </div>
              </div>

              <button
                onClick={() => setShowPrivacy(false)}
                style={{
                  marginTop: '2rem',
                  padding: '0.75rem 2rem',
                  backgroundColor: '#d2691e',
                  color: '#faf5f0',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#8b4513')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#d2691e')}
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Register

