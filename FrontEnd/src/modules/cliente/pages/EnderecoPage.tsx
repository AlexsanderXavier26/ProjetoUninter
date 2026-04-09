// Alexsander Xavier - 4338139
// Tela de endereço com CEP automático
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './EnderecoPage.module.css'

interface Address {
  cep: string
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
}

interface SavedAddress extends Address {
  id: string
  nome: string
}

const EnderecoPage: React.FC = () => {
  const navigate = useNavigate()
  const [address, setAddress] = useState<Address>({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  })
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [loading, setLoading] = useState(false)
  const [cepError, setCepError] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState('')

  // Carrega endereços salvos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedAddresses')
    if (saved) {
      try {
        setSavedAddresses(JSON.parse(saved))
      } catch (error) {
        console.error('Erro ao carregar endereços salvos:', error)
      }
    }
  }, [])

  // Busca CEP automaticamente
  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    setAddress(prev => ({ ...prev, cep: cleanCep }))
    setCepError('')

    if (cleanCep.length === 8) {
      setLoading(true)
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await response.json()

        if (data.erro) {
          setCepError('CEP não encontrado')
        } else {
          setAddress(prev => ({
            ...prev,
            rua: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || ''
          }))
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
        setCepError('Erro ao buscar CEP. Preencha manualmente.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleInputChange = (field: keyof Address, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }))
  }

  const handleUseSavedAddress = (saved: SavedAddress) => {
    setAddress({
      cep: saved.cep,
      rua: saved.rua,
      numero: saved.numero,
      complemento: saved.complemento,
      bairro: saved.bairro,
      cidade: saved.cidade,
      estado: saved.estado
    })
  }

  const handleSaveAddress = () => {
    if (!saveName.trim()) return

    const newSaved: SavedAddress = {
      id: Date.now().toString(),
      nome: saveName,
      ...address
    }

    const updated = [...savedAddresses, newSaved]
    setSavedAddresses(updated)
    localStorage.setItem('savedAddresses', JSON.stringify(updated))
    setShowSaveDialog(false)
    setSaveName('')
  }

  const isFormValid = () => {
    return address.cep.length === 8 &&
           address.rua.trim() &&
           address.numero.trim() &&
           address.bairro.trim() &&
           address.cidade.trim() &&
           address.estado.trim()
  }

  const handleContinue = () => {
    if (!isFormValid()) return

    navigate('/app/checkout?type=entrega', { state: { address } })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📍 Informe seu endereço</h1>
        <p>Para entrega do seu pedido</p>
      </div>

      {/* Endereços salvos */}
      {savedAddresses.length > 0 && (
        <div className={styles.savedSection}>
          <h3>Endereços Salvos</h3>
          <div className={styles.savedList}>
            {savedAddresses.map((saved) => (
              <div key={saved.id} className={styles.savedItem}>
                <div className={styles.savedInfo}>
                  <strong>{saved.nome}</strong>
                  <span>{saved.rua}, {saved.numero} - {saved.bairro}</span>
                  <small>{saved.cidade} - {saved.estado}</small>
                </div>
                <button
                  className={styles.useButton}
                  onClick={() => handleUseSavedAddress(saved)}
                >
                  Usar este
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulário de endereço */}
      <div className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>CEP *</label>
            <input
              type="text"
              placeholder="00000-000"
              value={address.cep}
              onChange={(e) => handleCepChange(e.target.value)}
              maxLength={8}
              className={cepError ? styles.error : ''}
            />
            {loading && <span className={styles.loading}>🔍 Buscando...</span>}
            {cepError && <span className={styles.errorText}>{cepError}</span>}
          </div>

          <div className={styles.field}>
            <label>Número *</label>
            <input
              type="text"
              placeholder="123"
              value={address.numero}
              onChange={(e) => handleInputChange('numero', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>Rua *</label>
          <input
            type="text"
            placeholder="Nome da rua"
            value={address.rua}
            onChange={(e) => handleInputChange('rua', e.target.value)}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Bairro *</label>
            <input
              type="text"
              placeholder="Nome do bairro"
              value={address.bairro}
              onChange={(e) => handleInputChange('bairro', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Complemento</label>
            <input
              type="text"
              placeholder="Apto, bloco, etc."
              value={address.complemento}
              onChange={(e) => handleInputChange('complemento', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Cidade *</label>
            <input
              type="text"
              placeholder="Nome da cidade"
              value={address.cidade}
              onChange={(e) => handleInputChange('cidade', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Estado *</label>
            <input
              type="text"
              placeholder="UF"
              value={address.estado}
              onChange={(e) => handleInputChange('estado', e.target.value)}
              maxLength={2}
            />
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className={styles.actions}>
        <button
          className={styles.backButton}
          onClick={() => navigate('/app/pedido-tipo')}
        >
          ← Voltar
        </button>

        <div className={styles.rightActions}>
          <button
            className={styles.saveButton}
            onClick={() => setShowSaveDialog(true)}
            disabled={!isFormValid()}
          >
            💾 Salvar Endereço
          </button>

          <button
            className={`${styles.continueButton} ${!isFormValid() ? styles.disabled : ''}`}
            onClick={handleContinue}
            disabled={!isFormValid()}
          >
            Continuar para Pagamento →
          </button>
        </div>
      </div>

      {/* Modal para salvar endereço */}
      {showSaveDialog && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Salvar Endereço</h3>
            <input
              type="text"
              placeholder="Nome do endereço (ex: Casa, Trabalho)"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              autoFocus
            />
            <div className={styles.modalActions}>
              <button onClick={() => setShowSaveDialog(false)}>Cancelar</button>
              <button onClick={handleSaveAddress} disabled={!saveName.trim()}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnderecoPage