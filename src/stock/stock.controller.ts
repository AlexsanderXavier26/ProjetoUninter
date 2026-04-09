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
  HttpCode,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  // POST /stock (apenas ADMIN)
  @Post()
  @UseGuards(RoleGuard)
  async create(@Body() dto: CreateStockDto, @Req() req: any) {
    return this.stockService.create(dto, req.user);
  }

  // GET /stock (ADMIN/FUNCIONARIO: todos, GERENTE_REGIONAL: só da sua região)
  @Get()
  async findAll(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.stockService.findAll(req.user, Number(page), Number(limit));
  }

  // GET /stock/unidade/:unitId
  @Get('unidade/:unitId')
  async findByUnit(
    @Param('unitId') unitId: string,
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.stockService.findByUnit(
      unitId,
      req.user,
      Number(page),
      Number(limit),
    );
  }

  // PATCH /stock/:id
  @Patch(':id')
  @UseGuards(RoleGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStockDto,
    @Req() req: any,
  ) {
    return this.stockService.update(id, dto, req.user);
  }

  // DELETE /stock/:id (soft delete)
  @Delete(':id')
  @UseGuards(RoleGuard)
  @HttpCode(204)
  async softDelete(@Param('id') id: string, @Req() req: any) {
    await this.stockService.softDelete(id, req.user);
    return;
  }
}
