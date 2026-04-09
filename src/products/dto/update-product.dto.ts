// Alexsander Xavier - 4338139
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber()
  precoBase?: number;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsBoolean()
  produtoSazonal?: boolean;

  @IsOptional()
  @IsDateString()
  dataInicioDisponibilidade?: string;

  @IsOptional()
  @IsDateString()
  dataFimDisponibilidade?: string;
}
