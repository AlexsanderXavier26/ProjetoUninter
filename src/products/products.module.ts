// Alexsander Xavier - 4338139
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaModule } from '@src/prisma/prisma.module';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController],
  providers: [ProductsService, AuditoriaService],
})
export class ProductsModule {}
