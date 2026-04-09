// Alexsander Xavier - 4338139
// Formulário para criação de usuários (Gerente, Funcionário)
import React, { useState } from 'react'
import { apiClient } from '@services/api'
import { useToast } from '@contexts/ToastContext'
import { getErrorMessage } from '../../../utils/errorHandler'

interface Props {
  role: 'GERENTE_REGIONAL' | 'FUNCIONARIO'
  label: string
  onUserCreated?: () => void
}

const UserForm: React.FC<Props> = ({ role, label, onUserCreated }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  // Submissão do formulário de criação de usuário - Alexsander Xavier - 4338139
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    
    // Validações - Alexsander Xavier - 4338139
    if (!email.trim() || !password.trim()) {
      const msg = 'Email e senha são obrigatórios'
      setMessage(msg)
      toast.showToast(msg, 'error')
      return
    }
    
    if (password.length < 6) {
      const msg = 'Senha deve ter no mínimo 6 caracteres'
      setMessage(msg)
      toast.showToast(msg, 'error')
      return
    }

    setLoading(true)
    try {
      // Tenta criar usuário na API - Alexsander Xavier - 4338139
      await apiClient.post('/users', { 
        email: email.trim(), 
        senha: password, // Campo correto: senha (não password)
        perfil: role,    // Campo correto: perfil (não role)
        nome: email.split('@')[0]
      })
      
      const msg = `${label} criado com sucesso!`
      setMessage(msg)
      toast.showToast(msg, 'success')
      setEmail('')
      setPassword('')
      onUserCreated?.() // Chama callback para recarregar lista
    } catch (err: any) {
      const msg = getErrorMessage(err)
      setMessage(msg)
      toast.showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h4>{label}</h4>
      
      <div style={styles.formGroup}>
        <label htmlFor={`email-${role}`}>Email:</label>
        <input
          id={`email-${role}`}
          type="email"
          placeholder="usuario@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label htmlFor={`password-${role}`}>Senha:</label>
        <input
          id={`password-${role}`}
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          style={styles.input}
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        style={styles.button}
      >
        {loading ? 'Criando...' : `Criar ${label}`}
      </button>

      {message && (
        <p style={styles.message}>
          {message}
        </p>
      )}
    </form>
  )
}

// Estilos do formulário - Alexsander Xavier - 4338139
const styles: { [key: string]: React.CSSProperties } = {
  form: {
    padding: '1.5rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#cd853f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  message: {
    marginTop: '0.75rem',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#4caf50',
  },
}

export default UserForm

