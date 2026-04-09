// Alexsander Xavier - 4338139
// Seleção de tipo de pedido - Retirada ou Entrega
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './PedidoTypeSelection.module.css'

const PedidoTypeSelection: React.FC = () => {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState<'retirada' | 'entrega' | null>(null)

  const handleContinue = () => {
    if (!selectedType) return

    if (selectedType === 'retirada') {
      navigate('/app/checkout?type=retirada')
    } else {
      navigate('/app/endereco')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Como deseja receber seu pedido?</h1>
        <p>Escolha a opção que melhor atende suas necessidades</p>
      </div>

      <div className={styles.options}>
        <div
          className={`${styles.option} ${selectedType === 'retirada' ? styles.selected : ''}`}
          onClick={() => setSelectedType('retirada')}
        >
          <div className={styles.icon}>🏪</div>
          <h3>Retirar no Local</h3>
          <p>Retire seu pedido diretamente na unidade selecionada</p>
          <ul className={styles.benefits}>
            <li>✅ Sem taxa de entrega</li>
            <li>✅ Mais rápido</li>
            <li>✅ Evita contato</li>
          </ul>
        </div>

        <div
          className={`${styles.option} ${selectedType === 'entrega' ? styles.selected : ''}`}
          onClick={() => setSelectedType('entrega')}
        >
          <div className={styles.icon}>🚚</div>
          <h3>Entrega em Casa</h3>
          <p>Receba seu pedido no conforto da sua casa</p>
          <ul className={styles.benefits}>
            <li>✅ Conveniência</li>
            <li>✅ Sem sair de casa</li>
            <li>✅ Acompanhamento em tempo real</li>
          </ul>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.backButton}
          onClick={() => navigate('/app')}
        >
          ← Voltar ao Cardápio
        </button>

        <button
          className={`${styles.continueButton} ${!selectedType ? styles.disabled : ''}`}
          onClick={handleContinue}
          disabled={!selectedType}
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}

export default PedidoTypeSelection