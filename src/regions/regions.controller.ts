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
import { RegionsService } from './regions.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';

@Controller('regions')
@UseGuards(JwtAuthGuard)
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Post()
  @UseGuards(RoleGuard)
  async create(@Body() dto: CreateRegionDto, @Req() req: any) {
    return this.regionsService.create(dto, req.user);
  }

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.regionsService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.regionsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRegionDto,
    @Req() req: any,
  ) {
    return this.regionsService.update(id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  async softDelete(@Param('id') id: string, @Req() req: any) {
    return this.regionsService.softDelete(id, req.user);
  }
}
