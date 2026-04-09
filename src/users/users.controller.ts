// Alexsander Xavier - 4338139

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Patch,
  Query,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RoleGuard)
  async create(@Body() dto: CreateUserDto, @Req() req: any) {
    if (req.user.role !== 'ADMIN') {
      return { message: 'Acesso restrito a administradores' };
    }
    return this.usersService.create(dto, req.user);
  }

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.usersService.findAll(Number(page), Number(limit));
  }

  // convenient endpoint for frontend to get current user info
  @Get('me')
  async me(@Req() req: any) {
    return this.usersService.me(req.user);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: any,
  ) {
    return this.usersService.update(id, dto, req.user);
  }

  @Patch(':id/role')
  @UseGuards(RoleGuard)
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: any,
  ) {
    return this.usersService.updateRole(id, dto, req.user);
  }

  @Patch(':id/consentimento')
  async updateConsentimento(
    @Param('id') id: string,
    @Body('consentimento') consentimento: boolean,
    @Req() req: any,
  ) {
    return this.usersService.updateConsentimento(id, consentimento, req.user);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  async softDelete(@Param('id') id: string, @Req() req: any) {
    return this.usersService.softDelete(id, req.user);
  }

  @Patch(':id/anonimizar')
  @UseGuards(RoleGuard)
  async anonimizar(@Param('id') id: string, @Req() req: any) {
    return this.usersService.anonimizar(id, req.user);
  }
}
