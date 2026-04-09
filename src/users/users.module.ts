// Alexsander Xavier - 4338139

import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '@src/prisma/prisma.module';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, AuditoriaService],
})
export class UsersModule {}
