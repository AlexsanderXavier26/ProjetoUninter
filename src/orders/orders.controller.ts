// Alexsander Xavier - 4338139
import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  UseGuards,
  Param,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // público: totem e clientes podem criar pedidos sem token
  @Post()
  async create(@Body() dto: CreateOrderDto, @Req() req: any) {
    // req.user pode ser undefined; service lida com clienteId nulo
    return this.ordersService.criarPedido(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const status = await this.ordersService.getStatus(id);
    return { status };
  }
}
