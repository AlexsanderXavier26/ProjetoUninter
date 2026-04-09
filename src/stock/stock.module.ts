// Alexsander Xavier - 4338139
import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { PrismaModule } from '@src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StockController],
  providers: [StockService, AuditoriaService],
})
export class StockModule {}
