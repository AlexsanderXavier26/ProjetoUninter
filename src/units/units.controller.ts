// Alexsander Xavier - 4338139
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';

@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  async create(@Body() dto: CreateUnitDto, @Req() req: any) {
    return this.unitsService.create(dto, req.user);
  }

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.unitsService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.unitsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUnitDto,
    @Req() req: any,
  ) {
    return this.unitsService.update(id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async softDelete(@Param('id') id: string, @Req() req: any) {
    return this.unitsService.softDelete(id, req.user);
  }
}
