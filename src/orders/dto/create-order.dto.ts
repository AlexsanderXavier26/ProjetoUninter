// Alexsander Xavier - 4338139
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddOrderItemDto {
  @IsString()
  produtoId: string;

  @IsNumber()
  quantidade: number;

  @IsNumber()
  @IsOptional()
  precoUnitario?: number;
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  clienteId?: string;

  @IsOptional()
  @IsString()
  unidadeId?: string;

  @IsOptional()
  @IsNumber()
  valorTotal?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddOrderItemDto)
  itens: AddOrderItemDto[];
}
