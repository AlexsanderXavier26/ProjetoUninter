// Alexsander Xavier - 4338139
import { Module } from '@nestjs/common';
import { RegionsController } from './regions.controller';
import { RegionsService } from './regions.service';
import { PrismaModule } from '@src/prisma/prisma.module';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Module({
  imports: [PrismaModule],
  controllers: [RegionsController],
  providers: [RegionsService, AuditoriaService],
})
export class RegionsModule {}
