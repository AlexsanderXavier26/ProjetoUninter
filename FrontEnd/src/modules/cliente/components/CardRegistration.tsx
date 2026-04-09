// Alexsander Xavier - 4338139
// Componente de Cadastro de Cartão com Consentimento LGPD
import React, { useState } from 'react'

export interface CreditCard {
  id: string
  cardholder: string
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  isDefault: boolean
}

interface CardRegistrationProps {
  onSave: (card: CreditCard) => void
  onCancel: () => void
}

const CardRegistration: React.FC<CardRegistrationProps> = ({ onSave, onCancel }) => {
  const [cardHolder, setCardHolder] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryYear, setExpiryYear] = useState('')
  const [cvv, setCvv] = useState('')
  const [lgpdConsent, setLgpdConsent] = useState(false)
  const [showLgpdModal, setShowLgpdModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16)
    setCardNumber(value.replace(/(\d{4})/g, '$1 ').trim())
  }

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))
  }

  const validateCard = (): boolean => {
    if (!cardHolder.trim()) {
      setError('Nome do titular é obrigatório')
      return false
    }
    const cleanCard = cardNumber.replace(/\s/g, '')
    if (cleanCard.length !== 16 || !/^[0-9]{16}$/.test(cleanCard)) {
      setError('Número do cartão inválido (16 dígitos)')
      return false
    }
    const month = parseInt(expiryMonth)
    if (!expiryMonth || month < 1 || month > 12) {
      setError('Mês de validade inválido (01-12)')
      return false
    }
    if (!expiryYear) {
      setError('Ano de validade é obrigatório')
      return false
    }
    const currentYear = new Date().getFullYear()
    const year = parseInt(expiryYear)
    if (year < currentYear) {
      setError('Data de validade expirada')
      return false
    }
    if (cvv.length !== 3 || !/^[0-9]{3}$/.test(cvv)) {
      setError('CVV inválido (3 dígitos)')
      return false
    }
    if (!lgpdConsent) {
      setError('Você deve consentir com a LGPD para continuar')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async () => {
    if (!validateCard()) return

    setProcessing(true)

    // Simula validação com o backend
    setTimeout(() => {
      const newCard: CreditCard = {
        id: `card_${Date.now()}`,
        cardholder: cardHolder.trim(),
        cardNumber: `****${cardNumber.replace(/\s/g, '').slice(-4)}`,
        expiryMonth: String(expiryMonth).padStart(2, '0'),
        expiryYear,
        cvv,
        isDefault: true
      }

      // Salva no localStorage (apenas onSave fará o save para evitar duplicação)
      setProcessing(false)
      onSave(newCard)
    }, 1500)
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Cadastrar Cartão de Crédito</h2>

        {/* Campo Nome do Titular */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Nome do Titular</label>
          <input
            type="text"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
            placeholder="JOÃO SILVA"
            style={styles.input}
            disabled={processing}
          />
        </div>

        {/* Campo Número do Cartão */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Número do Cartão</label>
          <input
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            style={styles.input}
            disabled={processing}
          />
        </div>

        {/* Linha de Expiração e CVV */}
        <div style={styles.row}>
          <div style={{ ...styles.formGroup, flex: 1 }}>
            <label style={styles.label}>Mês de Validade</label>
            <select
              value={expiryMonth}
              onChange={(e) => setExpiryMonth(e.target.value)}
              style={styles.input}
              disabled={processing}
            >
              <option value="">--</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                  {String(i + 1).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          <div style={{ ...styles.formGroup, flex: 1, marginLeft: '1rem' }}>
            <label style={styles.label}>Ano de Validade</label>
            <select
              value={expiryYear}
              onChange={(e) => setExpiryYear(e.target.value)}
              style={styles.input}
              disabled={processing}
            >
              <option value="">----</option>
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() + i
                return (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                )
              })}
            </select>
          </div>

          <div style={{ ...styles.formGroup, flex: 1, marginLeft: '1rem' }}>
            <label style={styles.label}>CVV</label>
            <input
              type="text"
              value={cvv}
              onChange={handleCVVChange}
              placeholder="000"
              maxLength={3}
              style={styles.input}
              disabled={processing}
            />
          </div>
        </div>

        {/* LGPD Consent */}
        <div style={styles.consentSection}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={lgpdConsent}
              onChange={(e) => {
                setLgpdConsent(e.target.checked)
                setError('')
              }}
              disabled={processing}
              style={{ marginRight: '0.5rem', cursor: 'pointer' }}
            />
            <span>
              Consinto com o armazenamento seguro do meu cartão de acordo com a{' '}
              <button
                type="button"
                onClick={() => setShowLgpdModal(true)}
                style={styles.lgpdLink}
              >
                LGPD
              </button>
            </span>
          </label>
          <p style={styles.lgpdNotice}>
            🔒 Seus dados são criptografados e armazenados com segurança. Política de privacidade
          </p>
        </div>

        {/* Erro */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Botões */}
        <div style={styles.buttonGroup}>
          <button
            onClick={onCancel}
            disabled={processing}
            style={{ ...styles.button, ...styles.buttonSecondary }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={processing || !lgpdConsent}
            style={{ ...styles.button, ...styles.buttonPrimary }}
          >
            {processing ? '⏳ Salvando...' : '💾 Salvar Cartão'}
          </button>
        </div>

        {/* Modal LGPD */}
        {showLgpdModal && (
          <div style={styles.lgpdOverlay} onClick={() => setShowLgpdModal(false)}>
            <div style={styles.lgpdModal} onClick={(e) => e.stopPropagation()}>
              <h3 style={styles.lgpdTitle}>Política de Privacidade e LGPD</h3>
              <div style={styles.lgpdContent}>
                <h4>📋 Lei Geral de Proteção de Dados Pessoais (LGPD)</h4>
                <p>
                  Ao consentir com esta declaração, você autoriza a Raízes do Nordeste a:
                </p>
                <ul>
                  <li>✅ Coletar e armazenar seus dados de cartão de crédito de forma segura</li>
                  <li>✅ Utilizar esses dados para processamento de pagamentos relacionados aos seus pedidos</li>
                  <li>✅ Proteger seus dados com criptografia AES-256</li>
                  <li>✅ Manter seus dados apenas pelo tempo necessário (máximo 12 meses sem atividade)</li>
                  <li>✅ Não compartilhar seus dados com terceiros sem consentimento prévio</li>
                </ul>

                <h4>🔐 Segurança dos Dados</h4>
                <p>
                  Seus dados pessoais e informações de pagamento são tratados com o máximo cuidado e segurança.
                  Utilizamos as mais altas padrões de criptografia e conformidade com a LGPD.
                </p>

                <h4>👤 Direitos do Titular</h4>
                <p>Você possui os direitos de:</p>
                <ul>
                  <li>📝 Acessar seus dados pessoais</li>
                  <li>🔄 Corrigir dados incompletos ou inexatos</li>
                  <li>🗑️ Solicitar a exclusão de seus dados</li>
                  <li>📤 Portabilidade dos dados</li>
                  <li>⛔ Opor-se ao processamento de dados</li>
                </ul>

                <p style={{ marginTop: '1.5rem', fontStyle: 'italic', fontSize: '0.9rem' }}>
                  Para exercer seus direitos ou reportar problemas de privacidade,
                  entre em contato: privacy@raizesdnordeste.com.br
                </p>
              </div>
              <button
                onClick={() => setShowLgpdModal(false)}
                style={{ ...styles.button, ...styles.buttonPrimary, marginTop: '1rem', width: '100%' }}
              >
                ✅ Entendi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  },
  title: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.5rem',
    color: '#333',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  row: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  consentSection: {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    fontSize: '0.9rem',
    color: '#333',
    cursor: 'pointer',
  },
  lgpdLink: {
    background: 'none',
    border: 'none',
    color: '#2196f3',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: 'inherit',
    padding: 0,
  },
  lgpdNotice: {
    fontSize: '0.8rem',
    color: '#666',
    margin: '0.5rem 0 0 0',
    fontStyle: 'italic',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    border: '1px solid #ef5350',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  button: {
    flex: 1,
    padding: '0.75rem 1rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonPrimary: {
    backgroundColor: '#2196f3',
    color: '#fff',
  },
  buttonSecondary: {
    backgroundColor: '#f0f0f0',
    color: '#333',
    border: '1px solid #ddd',
  },
  lgpdOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  lgpdModal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5)',
  },
  lgpdTitle: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.3rem',
    color: '#333',
  },
  lgpdContent: {
    fontSize: '0.9rem',
    lineHeight: '1.6',
    color: '#555',
    marginBottom: '1.5rem',
  },
}

export default CardRegistration
