// Alexsander Xavier - 4338139
import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaymentService } from '../payment/payment.service';
import { StockService } from '../stock/stock.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { PrismaModule } from '@src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController],
  providers: [OrdersService, PaymentService, StockService, AuditoriaService],
  exports: [OrdersService],
})
export class OrdersModule {}
