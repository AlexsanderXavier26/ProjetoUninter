// Alexsander Xavier - 4338139
// Modal de Pagamento - Simula processamento de transação
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paymentService, PaymentMethod } from '@services/paymentService'

interface PaymentModalProps {
  method: PaymentMethod
  amount: number
  orderId: string
  onComplete: (method: PaymentMethod) => void
  onCancel: () => void
  channel?: 'APP' | 'TOTEM' | 'BALCAO' | 'PICKUP'
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  method,
  amount,
  orderId,
  onComplete,
  onCancel,
  channel = 'APP'
}) => {
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)
  const [orderCode, setOrderCode] = useState<string | null>(null)

  // Inicia processamento quando modal abre - Alexsander Xavier - 4338139
  React.useEffect(() => {
    const processPayment = async () => {
      setProcessing(true)
      try {
        const result = await paymentService.processPayment(method, orderId, amount)
        // Gera código do pedido de 0-9999 para TOTEM
        const code = channel === 'TOTEM' ? String(Math.floor(Math.random() * 10000)).padStart(4, '0') : (result.qrCode ?? result.transactionId)
        setOrderCode(code)
        
        // TOTEM: deixa ver a tela de sucesso por 3 segundos antes de voltar
        // APP: 2 segundos (o usuário vai para /app/pedido/:id)
        const completeDelay = channel === 'TOTEM' ? 0 : 2000
        setTimeout(() => {
          onComplete(method)
        }, completeDelay)
      } catch (_error) {
        onCancel()
      }
    }

    // Delay inicial para mostrar a interface
    const delayTime = channel === 'TOTEM' ? 500 : 1000
    setTimeout(() => {
      processPayment()
    }, delayTime)
  }, [method, amount, orderId, onComplete, onCancel, channel])

  const handleReturnHome = () => {
    navigate('/')
  }

  return (
    <div style={styles.overlay}>
      <div style={{
        ...styles.modal,
        maxWidth: channel === 'TOTEM' ? '500px' : '400px'
      }}>
        <div style={styles.content}>
          {!processing ? (
            <>
              <h3 style={{ fontSize: channel === 'TOTEM' ? '1.5rem' : '1.2rem' }}>
                {paymentService.getMethodLabel(method)}
              </h3>
              <p style={{ fontSize: channel === 'TOTEM' ? '1.1rem' : '1rem', marginBottom: '1rem' }}>
                Valor: <strong>R$ {amount.toFixed(2)}</strong>
              </p>
              
              {method === 'PIX' ? (
                <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                  <div style={{
                    ...styles.qrPlaceholder,
                    width: channel === 'TOTEM' ? '250px' : '150px',
                    height: channel === 'TOTEM' ? '250px' : '150px',
                    fontSize: channel === 'TOTEM' ? '3rem' : '1.2rem'
                  }}>
                    📱<br/>QR Code PIX
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                    Escaneie o QR Code com seu aplicativo bancário
                  </p>
                </div>
              ) : method === 'DINHEIRO' ? (
                <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                  <div style={{
                    ...styles.cardInsert,
                    fontSize: channel === 'TOTEM' ? '3rem' : '1.5rem'
                  }}>
                    💵<br/>Leve a Nota Fiscal ao Caixa
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                    Retire seu pedido após pagamento em dinheiro
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                  <div style={{
                    ...styles.cardInsert,
                    width: channel === 'TOTEM' ? '250px' : '200px',
                    height: channel === 'TOTEM' ? '150px' : '120px',
                    fontSize: channel === 'TOTEM' ? '2.5rem' : '1.5rem'
                  }}>
                    💳<br/>Insira ou aproxime o cartão
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                    Posicione o cartão no leitor
                  </p>
                </div>
              )}
              
              <div style={styles.waiting}>
                <div style={styles.spinner}>⏳</div>
                <p>Aguardando confirmação...</p>
              </div>
            </>
          ) : orderCode ? (
            <>
              <div style={styles.success}>
                <div style={styles.checkIcon}>✅</div>
                <h3 style={{ fontSize: channel === 'TOTEM' ? '1.8rem' : '1.3rem' }}>
                  {channel === 'TOTEM' ? 'Obrigado pela sua compra!' : (method === 'DINHEIRO' ? 'Pedido Confirmado!' : 'Pagamento Aprovado!')}
                </h3>
                <p style={{ fontSize: channel === 'TOTEM' ? '1.1rem' : '0.95rem', marginTop: '1.5rem' }}>
                  Código do Pedido:
                </p>
                <div style={{
                  ...styles.orderCode,
                  fontSize: channel === 'TOTEM' ? '3rem' : '1.5rem',
                  padding: channel === 'TOTEM' ? '1.5rem' : '0.5rem 1rem'
                }}>
                  {orderCode}
                </div>
                {channel === 'TOTEM' && (
                  <>
                    <p style={{ fontSize: '1rem', color: '#666', marginTop: '2rem' }}>
                      {method === 'DINHEIRO' ? 'Leve este código ao caixa para pagar' : 'Guarde este código para futuras referências'}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '0.5rem' }}>
                      Retornando à tela inicial...
                    </p>
                  </>
                )}
                {channel !== 'TOTEM' && (
                  <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                    Guarde este código para acompanhar seu pedido
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div style={styles.spinner}>⏳</div>
              <p>Processando pagamento...</p>
              <p style={{ fontSize: '0.9rem', color: '#999' }}>
                Por favor, não feche esta janela
              </p>
            </>
          )}
        </div>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '400px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  content: {
    textAlign: 'center',
  },
  qrPlaceholder: {
    border: '2px dashed #ccc',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
  },
  cardInsert: {
    border: '2px solid #4caf50',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    backgroundColor: '#f0f8f0',
  },
  waiting: {
    marginTop: '1rem',
  },
  spinner: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  success: {
    color: '#4caf50',
  },
  checkIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  orderCode: {
    fontWeight: 'bold',
    backgroundColor: '#f0f8f0',
    borderRadius: '8px',
    border: '2px solid #4caf50',
    display: 'inline-block',
    margin: '0.5rem 0',
    letterSpacing: '3px',
  },
}

export default PaymentModal
