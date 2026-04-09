// Alexsander Xavier - 4338139
import { IsString } from 'class-validator';

export class CreateUnitDto {
  @IsString()
  nome: string;

  @IsString()
  regiaoId: string;
}
