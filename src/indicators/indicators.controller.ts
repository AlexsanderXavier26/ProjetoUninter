// Alexsander Xavier - 4338139
import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { IndicatorsService } from './indicators.service';

@Controller('indicators')
@UseGuards(JwtAuthGuard, RoleGuard)
export class IndicatorsController {
  constructor(private readonly indicatorsService: IndicatorsService) {}

  // Produto mais vendido por região (dados agregados, sem dados pessoais)
  @Get('produto-mais-vendido')
  async getProdutoMaisVendido(
    @Query('regionId') regionId: string,
    @Req() req: any,
  ) {
    if (!regionId) throw new ForbiddenException('Região obrigatória');
    return this.indicatorsService.getProdutoMaisVendido(regionId);
  }

  // Vendas por unidade (dados agregados, sem dados pessoais)
  @Get('vendas-por-unidade')
  async getVendasPorUnidade(
    @Query('regionId') regionId: string,
    @Req() req: any,
  ) {
    if (!regionId) throw new ForbiddenException('Região obrigatória');
    return this.indicatorsService.getVendasPorUnidade(regionId);
  }
}
