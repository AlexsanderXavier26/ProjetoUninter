// Alexsander Xavier - 4338139
import { Module } from '@nestjs/common';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { PrismaModule } from '@src/prisma/prisma.module';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Module({
  imports: [PrismaModule],
  controllers: [UnitsController],
  providers: [UnitsService, AuditoriaService],
})
export class UnitsModule {}
