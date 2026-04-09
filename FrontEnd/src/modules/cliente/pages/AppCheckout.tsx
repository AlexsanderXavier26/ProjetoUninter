// Alexsander Xavier - 4338139
// Checkout específico do APP - considera retirada/entrega
import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useCliente } from '../context/ClienteContext'
import CardRegistration, { CreditCard } from '../components/CardRegistration'
import styles from './AppCheckout.module.css'

interface Address {
  cep: string
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
}

const AppCheckout: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { cart, total } = useCliente()

  const [pedidoType] = useState<'retirada' | 'entrega'>(searchParams.get('type') as 'retirada' | 'entrega' || 'retirada')
  const location = useLocation()
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'debito' | 'credito' | 'dinheiro' | ''>('')
  const [address, setAddress] = useState<Address | null>(null)
  const [processing, setProcessing] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [showCardForm, setShowCardForm] = useState(false)
  const [orderId, setOrderId] = useState<string>('')
  const [savedCards, setSavedCards] = useState<CreditCard[]>([])
  const [selectedCard, setSelectedCard] = useState<string>('')

  // Carrega endereço enviado pelo formulário de entrega
  useEffect(() => {
    if (pedidoType !== 'entrega') return

    const stateAddress = (location.state as { address?: Address } | null)?.address
    if (stateAddress) {
      setAddress(stateAddress)
      return
    }

    setAddress(null)
  }, [pedidoType, location.state])

  const addressRequired = pedidoType === 'entrega'
  const canPay = paymentMethod !== '' && (!addressRequired || !!address)

  // Carrega cartões salvos
  useEffect(() => {
    const cards = JSON.parse(localStorage.getItem('user_cards') || '[]')
    setSavedCards(cards)
    if (cards.length > 0) {
      setSelectedCard(cards[0].id)
    }
  }, [])

  // Valida pagamento com cartão
  const validateCardPayment = (): boolean => {
    if (paymentMethod === 'credito' || paymentMethod === 'debito') {
      if (savedCards.length === 0) {
        setShowCardForm(true)
        return false
      }
      if (!selectedCard) {
        alert('Selecione um cartão')
        return false
      }
    }
    return true
  }

  // Simula processamento de pagamento
  const handlePayment = async () => {
    if (!paymentMethod) return
    if (pedidoType === 'entrega' && !address) {
      alert('Por favor, informe um endereço de entrega válido antes de continuar.')
      return
    }
    if (!validateCardPayment()) return

    setProcessing(true)

    // Simulação de processamento
    setTimeout(() => {
      if (paymentMethod === 'pix') {
        setShowQRCode(true)
        // Simula aprovação do PIX após 5-6 segundos
        setTimeout(() => {
          finalizeOrder()
        }, 5500)
      } else {
        // Cartão ou dinheiro é aprovado após 3 segundos
        setTimeout(() => {
          finalizeOrder()
        }, 3000)
      }
    }, 2000)
  }

  const finalizeOrder = () => {
    const newOrderId = `APP-${Date.now()}`
    setOrderId(newOrderId)
    setProcessing(false)
    setShowQRCode(false)

    // Salva pedido no localStorage para acompanhamento
    const orderData = {
      id: newOrderId,
      type: pedidoType,
      items: cart,
      total,
      paymentMethod,
      paymentCard: paymentMethod === 'credito' || paymentMethod === 'debito' ? selectedCard : null,
      address: pedidoType === 'entrega' ? address : null,
      status: 'recebido',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    localStorage.setItem(`order_${newOrderId}`, JSON.stringify(orderData))

    // Redireciona para status do pedido
    setTimeout(() => {
      navigate(`/app/pedido/${newOrderId}`)
    }, 2000)
  }

  const getQRCode = () => {
    // Simula QR Code do PIX
    return `PIX:${total.toFixed(2)}:${Date.now()}`
  }

  if (cart.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <h2>Carrinho vazio</h2>
          <p>Adicione produtos ao carrinho para continuar</p>
          <button onClick={() => navigate('/app')} className={styles.backButton}>
            ← Voltar ao Cardápio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>💳 Finalizar Pedido</h1>
        <p>Revise seu pedido e escolha a forma de pagamento</p>
      </div>

      <div className={styles.content}>
        {/* Resumo do pedido */}
        <div className={styles.orderSummary}>
          <h3>📋 Resumo do Pedido</h3>

          <div className={styles.orderType}>
            <span className={styles.typeIcon}>{pedidoType === 'retirada' ? '🏪' : '🚚'}</span>
            <span className={styles.typeText}>
              {pedidoType === 'retirada' ? 'Retirada no Local' : 'Entrega em Casa'}
            </span>
          </div>

          {pedidoType === 'entrega' && address && (
            <div className={styles.address}>
              <h4>📍 Endereço de Entrega</h4>
              <p>{address.rua}, {address.numero}</p>
              {address.complemento && <p>{address.complemento}</p>}
              <p>{address.bairro} - {address.cidade}/{address.estado}</p>
              <p>CEP: {address.cep}</p>
            </div>
          )}

          <div className={styles.items}>
            {cart.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.quantity}>{item.quantidade}x</span>
                  <span className={styles.name}>{item.nome}</span>
                </div>
                <span className={styles.price}>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className={styles.total}>
            <strong>Total: R$ {total.toFixed(2)}</strong>
          </div>
        </div>

        {/* Método de pagamento */}
        <div className={styles.paymentSection}>
          <h3>💳 Forma de Pagamento</h3>

          <div className={styles.paymentOptions}>
            <div
              className={`${styles.paymentOption} ${paymentMethod === 'pix' ? styles.selected : ''}`}
              onClick={() => setPaymentMethod('pix')}
            >
              <div className={styles.paymentIcon}>📱</div>
              <div className={styles.paymentInfo}>
                <h4>PIX</h4>
                <p>Aprovação instantânea</p>
              </div>
            </div>

            <div
              className={`${styles.paymentOption} ${paymentMethod === 'debito' ? styles.selected : ''}`}
              onClick={() => setPaymentMethod('debito')}
            >
              <div className={styles.paymentIcon}>💳</div>
              <div className={styles.paymentInfo}>
                <h4>Cartão de Débito</h4>
                <p>Insira ou aproxime</p>
              </div>
            </div>

            <div
              className={`${styles.paymentOption} ${paymentMethod === 'credito' ? styles.selected : ''}`}
              onClick={() => setPaymentMethod('credito')}
            >
              <div className={styles.paymentIcon}>💳</div>
              <div className={styles.paymentInfo}>
                <h4>Cartão de Crédito</h4>
                <p>Parcelamento disponível</p>
              </div>
            </div>

            <div
              className={`${styles.paymentOption} ${paymentMethod === 'dinheiro' ? styles.selected : ''}`}
              onClick={() => setPaymentMethod('dinheiro')}
            >
              <div className={styles.paymentIcon}>💵</div>
              <div className={styles.paymentInfo}>
                <h4>Dinheiro</h4>
                <p>Pagamento no caixa na retirada</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seleção de Cartão (se credito ou debito) */}
        {(paymentMethod === 'credito' || paymentMethod === 'debito') && (
          <div className={styles.cardSection}>
            <h3>💳 Cartão Salvo</h3>
            
            {savedCards.length > 0 ? (
              <div>
                <select
                  value={selectedCard}
                  onChange={(e) => setSelectedCard(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    fontSize: '0.95rem',
                    marginBottom: '1rem'
                  }}
                >
                  {savedCards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.cardholder} - {card.cardNumber} (Vence: {card.expiryMonth}/{card.expiryYear})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowCardForm(true)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#f5f5f5',
                    border: '2px dashed #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: '#666',
                    transition: 'all 0.2s'
                  }}
                >
                  ➕ Adicionar novo cartão
                </button>
              </div>
            ) : (
              <div style={{
                backgroundColor: '#fff3cd',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid #ffc107'
              }}>
                <p style={{ margin: 0, color: '#856404', fontSize: '0.9rem' }}>
                  📝 Você precisa cadastrar um cartão para continuar
                </p>
              </div>
            )}
          </div>
        )}

        {paymentMethod === 'dinheiro' && (
          <div style={{
            backgroundColor: '#f0f8ff',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #90caf9',
            color: '#0d47a1',
            marginBottom: '1rem'
          }}>
            Pagamento será realizado no caixa na retirada
          </div>
        )}

        {/* QR Code do PIX */}
        {showQRCode && paymentMethod === 'pix' && (
          <div className={styles.qrSection}>
            <h3>📱 Pague com PIX</h3>
            <div className={styles.qrCode}>
              <div className={styles.qrPlaceholder}>
                <div className={styles.qrPattern}></div>
                <p>QR Code PIX</p>
                <small>R$ {total.toFixed(2)}</small>
              </div>
            </div>
            <p className={styles.qrText}>
              Escaneie o código ou copie: <code>{getQRCode()}</code>
            </p>
            <div className={styles.processing}>
              <div className={styles.spinner}></div>
              <p>Aguardando pagamento...</p>
            </div>
          </div>
        )}

        {/* Processamento */}
        {processing && !showQRCode && (
          <div className={styles.processing}>
            <div className={styles.spinner}></div>
            <p>Processando pagamento...</p>
          </div>
        )}

        {/* Ações */}
        {!processing && !showQRCode && (
          <div className={styles.actions}>
            <button
              className={styles.backButton}
              onClick={() => navigate(pedidoType === 'retirada' ? '/app/pedido-tipo' : '/app/endereco')}
            >
              ← Voltar
            </button>

            <button
              className={`${styles.payButton} ${!canPay ? styles.disabled : ''}`}
              onClick={handlePayment}
              disabled={!canPay}
            >
              {paymentMethod === 'pix' ? '📱 Gerar PIX' :
               paymentMethod === 'debito' ? '💳 Pagar com Débito' :
               paymentMethod === 'credito' ? '💳 Pagar com Crédito' :
               'Selecione forma de pagamento'}
            </button>
          </div>
        )}

        {/* Modal de Cadastro de Cartão */}
        {showCardForm && (
          <CardRegistration
            onSave={(card) => {
              // Salva no localStorage
              const existingCards = JSON.parse(localStorage.getItem('user_cards') || '[]')
              existingCards.push(card)
              localStorage.setItem('user_cards', JSON.stringify(existingCards))
              
              // Atualiza estado
              setSavedCards(existingCards)
              setSelectedCard(card.id)
              setShowCardForm(false)
            }}
            onCancel={() => setShowCardForm(false)}
          />
        )}
      </div>
    </div>
  )
}

export default AppCheckout