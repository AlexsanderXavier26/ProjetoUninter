// Alexsander Xavier - 4338139
import { IsOptional, IsString } from 'class-validator';

export class UpdateRegionDto {
  @IsOptional()
  @IsString()
  nome?: string;
}
