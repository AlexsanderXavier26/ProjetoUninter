// Alexsander Xavier - 4338139
// Serviço de Pagamento - Mock de processamento de pagamento
/**
 * Simula integração com gateway de pagamento
 * 90% sucesso, 10% falha
 * Delay realista de 1-3 segundos
 * 
 * Tipos de pagamento:
 * - PIX: instantâneo
 * - CARTAO: com delay
 */

export enum PaymentMethod {
  PIX = 'PIX',
  CARTAO_CREDITO = 'CARTAO_CREDITO',
  CARTAO_DEBITO = 'CARTAO_DEBITO',
  DINHEIRO = 'DINHEIRO',
}

export interface PaymentRequest {
  orderId: string
  amount: number
  method: PaymentMethod
  installments?: number // para cartão de crédito
}

export interface PaymentResponse {
  status: 'APPROVED' | 'REJECTED'
  transactionId: string
  method: PaymentMethod
  amount: number
  timestamp: Date
  message?: string
  retryable?: boolean // se pode tentar novamente
  qrCode?: string
}

class PaymentService {
  async processPayment(method: PaymentMethod, orderId: string, amount: number): Promise<PaymentResponse> {
    return new Promise((resolve) => {
      const delay = method === PaymentMethod.PIX ? Math.random() * 1000 + 5000 : 3000
      setTimeout(() => {
        const transactionId = this.generateTransactionId(method)
        resolve({
          status: 'APPROVED',
          transactionId,
          method,
          amount,
          timestamp: new Date(),
          qrCode: method === PaymentMethod.PIX ? `PIX-${orderId}-${transactionId}` : undefined,
        })
      }, delay)
    })
  }

  /**
   * Processa pagamento PIX com delay de 5-6 segundos
   * Alexsander Xavier - 4338139
   */
  async pagarPix(orderId: string, amount: number): Promise<{ sucesso: boolean; codigoPedido: string }> {
    return new Promise((resolve) => {
      // Delay de 5-6 segundos para PIX
      const delay = Math.random() * 1000 + 5000

      setTimeout(() => {
        // Sempre sucesso para PIX (simulação)
        resolve({
          sucesso: true,
          codigoPedido: this.generateOrderCode()
        })
      }, delay)
    })
  }

  /**
   * Processa pagamento com cartão com delay de 5-6 segundos
   * Alexsander Xavier - 4338139
   */
  async pagarCartao(orderId: string, amount: number, tipo: 'credito' | 'debito'): Promise<{ sucesso: boolean; codigoPedido: string }> {
    return new Promise((resolve) => {
      // Delay de 3 segundos para cartão
      const delay = 3000

      setTimeout(() => {
        resolve({
          sucesso: true,
          codigoPedido: this.generateOrderCode()
        })
      }, delay)
    })
  }

  /**
   * Gera código único do pedido
   * Alexsander Xavier - 4338139
   */
  private generateOrderCode(): string {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `PED${timestamp}${random}`
  }

  /**
   * Gera ID de transação único
   * Alexsander Xavier - 4338139
   */
  private generateTransactionId(method: PaymentMethod): string {
    const methodPrefix = {
      [PaymentMethod.PIX]: 'PIX',
      [PaymentMethod.CARTAO_CREDITO]: 'CCD',
      [PaymentMethod.CARTAO_DEBITO]: 'CDB',
      [PaymentMethod.DINHEIRO]: 'DNH',
    }

    const prefix = methodPrefix[method]
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()

    return `${prefix}-${timestamp}-${random}`
  }

  /**
   * Retorna descrição do método de pagamento
   * Alexsander Xavier - 4338139
   */
  getMethodLabel(method: PaymentMethod): string {
    const labels: { [key in PaymentMethod]: string } = {
      [PaymentMethod.PIX]: '📱 PIX',
      [PaymentMethod.CARTAO_CREDITO]: '💳 Cartão de Crédito',
      [PaymentMethod.CARTAO_DEBITO]: '💳 Cartão de Débito',
      [PaymentMethod.DINHEIRO]: '💵 Dinheiro',
    }
    return labels[method] || method
  }

  /**
   * Retorna ícone do status
   * Alexsander Xavier - 4338139
   */
  getStatusIcon(status: 'APPROVED' | 'REJECTED'): string {
    return status === 'APPROVED' ? '✅' : '❌'
  }

  /**
   * Formata valor para exibição
   * Alexsander Xavier - 4338139
   */
  formatAmount(amount: number): string {
    return `R$ ${amount.toFixed(2)}`
  }

  /**
   * Calcula valor de instalação
   * Alexsander Xavier - 4338139
   */
  calculateInstallment(amount: number, installments: number): {
    installmentValue: number
    totalWithInterest: number
    interestRate: number
  } {
    // Taxa padrão: 2.99% ao mês - Alexsander Xavier - 4338139
    const monthlyRate = 0.0299
    let totalWithInterest = amount

    if (installments > 1) {
      totalWithInterest = amount * (1 + monthlyRate * (installments - 1))
    }

    return {
      installmentValue: totalWithInterest / installments,
      totalWithInterest,
      interestRate: monthlyRate * 100,
    }
  }

  /**
   * Retorna métodos disponíveis por canal
   * Alexsander Xavier - 4338139
   */
  getAvailableMethods(channel: 'APP' | 'TOTEM' | 'BALCAO'): PaymentMethod[] {
    const methods: { [key: string]: PaymentMethod[] } = {
      APP: [
        PaymentMethod.PIX,
        PaymentMethod.CARTAO_CREDITO,
        PaymentMethod.CARTAO_DEBITO,
      ],
      TOTEM: [
        PaymentMethod.PIX,
        PaymentMethod.CARTAO_CREDITO,
        PaymentMethod.CARTAO_DEBITO,
        PaymentMethod.DINHEIRO,
      ],
      BALCAO: [
        PaymentMethod.PIX,
        PaymentMethod.CARTAO_CREDITO,
        PaymentMethod.CARTAO_DEBITO,
        PaymentMethod.DINHEIRO,
      ],
    }
    return methods[channel] || methods['APP']
  }
}

export const paymentService = new PaymentService()
