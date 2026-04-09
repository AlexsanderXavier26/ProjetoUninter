// Alexsander Xavier - 4338139
import { Injectable } from '@nestjs/common';

export type PaymentResult = 'APROVADO' | 'NEGADO';

@Injectable()
export class PaymentService {
  async processPayment(
    pedidoId: string,
    valor: number,
  ): Promise<PaymentResult> {
    // Simula latência e falha aleatória
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 1000),
    );
    if (Math.random() < 0.15) {
      return 'NEGADO';
    }
    return 'APROVADO';
  }
}
