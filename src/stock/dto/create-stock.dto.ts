// Alexsander Xavier - 4338139
export class CreateStockDto {
  productId: string;
  unitId: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  ativo?: boolean = true;
}
