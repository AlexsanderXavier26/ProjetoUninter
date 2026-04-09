// Alexsander Xavier - 4338139
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  nome: string;

  @IsString()
  descricao: string;

  @IsNumber()
  precoBase: number;

  @IsString()
  categoria: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean = true;

  @IsBoolean()
  produtoSazonal: boolean;

  @IsOptional()
  @IsDateString()
  dataInicioDisponibilidade?: string;

  @IsOptional()
  @IsDateString()
  dataFimDisponibilidade?: string;
}
