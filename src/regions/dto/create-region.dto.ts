// Alexsander Xavier - 4338139
import { IsString } from 'class-validator';

export class CreateRegionDto {
  @IsString()
  nome: string;
}
