// Alexsander Xavier - 4338139
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Listagem pública
  @Get()
  async findAllPublic(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.productsService.findAllPublic(Number(page), Number(limit));
  }

  // Protegido: criar produto
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  async create(@Body() dto: CreateProductDto, @Req() req: any) {
    return this.productsService.create(dto, req.user);
  }

  // Protegido: editar produto
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: any,
  ) {
    return this.productsService.update(id, dto, req.user);
  }

  // Protegido: soft delete
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async softDelete(@Param('id') id: string, @Req() req: any) {
    return this.productsService.softDelete(id, req.user);
  }

  // Protegido: definir disponibilidade por unidade
  @Patch(':id/unidades')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async setDisponibilidadePorUnidade(
    @Param('id') id: string,
    @Body('unidadeIds') unidadeIds: string[],
    @Req() req: any,
  ) {
    return this.productsService.setDisponibilidadePorUnidade(
      id,
      unidadeIds,
      req.user,
    );
  }

  // Listar produtos disponíveis em uma unidade
  @Get('unidade/:unitId')
  async getProdutosDisponiveisPorUnidade(@Param('unitId') unitId: string) {
    return this.productsService.getProdutosDisponiveisPorUnidade(unitId);
  }
}
