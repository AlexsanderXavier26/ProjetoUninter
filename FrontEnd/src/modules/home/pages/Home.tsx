// Alexsander Xavier - 4338139
import React, { useEffect } from 'react'
import { useAuth } from '@contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

function Home() {
  const { isAuthenticated, perfil } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      switch (perfil) {
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
          break
      }
    }
  }, [isAuthenticated, perfil, navigate])

  return (
    <div style={styles.container}>
      {/* Banner com tema nordestino - Alexsander Xavier - 4338139 */}
      <div style={styles.banner}>
        <h1 style={styles.title}>🌾 Raízes do Nordeste</h1>
        <p style={styles.subtitle}>Sistema de Gestão de Pedidos</p>
      </div>

      {/* Seção de boas-vindas */}
      <div style={styles.welcomeSection}>
        <p style={styles.description}>
          Bem-vindo ao sistema de pedidos Raízes do Nordeste.<br />
          Escolha uma opção para começar:
        </p>
      </div>

      {/* Botões de ação - Alexsander Xavier - 4338139 */}
      <div style={styles.buttonsContainer}>
        {/* Botão Totem */}
        <button
          style={styles.button}
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLElement
            target.style.backgroundColor = '#d2691e'
            target.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLElement
            target.style.backgroundColor = '#cd853f'
            target.style.transform = 'scale(1)'
          }}
          onClick={() => navigate('/totem')}
        >
          <div style={styles.buttonEmoji}>📱</div>
          <div style={styles.buttonText}>Fazer Pedido (Totem)</div>
          <div style={styles.buttonSubtext}>Sem login necessário</div>
        </button>

        {/* Botão Login */}
        <button
          style={styles.button}
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLElement
            target.style.backgroundColor = '#d2691e'
            target.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLElement
            target.style.backgroundColor = '#cd853f'
            target.style.transform = 'scale(1)'
          }}
          onClick={() => navigate('/login')}
        >
          <div style={styles.buttonEmoji}>🔐</div>
          <div style={styles.buttonText}>Entrar</div>
          <div style={styles.buttonSubtext}>Já tenho conta</div>
        </button>

        {/* Botão Registrar */}
        <button
          style={styles.button}
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLElement
            target.style.backgroundColor = '#d2691e'
            target.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLElement
            target.style.backgroundColor = '#cd853f'
            target.style.transform = 'scale(1)'
          }}
          onClick={() => navigate('/register')}
        >
          <div style={styles.buttonEmoji}>✍️</div>
          <div style={styles.buttonText}>Criar Conta</div>
          <div style={styles.buttonSubtext}>Novo cliente</div>
        </button>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p>Raízes do Nordeste © UNINTER 2026 - Sistema de Gestão de Pedidos</p>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5deb3 0%, #daa520 100%)',
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
  },
  banner: {
    textAlign: 'center',
    marginBottom: '3rem',
    color: '#654321',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  subtitle: {
    fontSize: '1.2rem',
    margin: '0',
    color: '#8b4513',
  },
  welcomeSection: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  description: {
    fontSize: '1rem',
    color: '#654321',
    margin: '0',
    lineHeight: '1.6',
  },
  buttonsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
    maxWidth: '800px',
    width: '100%',
    marginBottom: '3rem',
  },
  button: {
    padding: '2rem 1.5rem',
    background: '#cd853f',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 'bold',
  },
  buttonEmoji: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
  },
  buttonText: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
  },
  buttonSubtext: {
    fontSize: '0.85rem',
    opacity: 0.9,
  },
  footer: {
    textAlign: 'center',
    color: '#654321',
    fontSize: '0.9rem',
    marginTop: 'auto',
  },
}

export default Home

