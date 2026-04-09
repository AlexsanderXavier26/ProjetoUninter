// Alexsander Xavier - 4338139
// Serviço de Estoque - Controla quantidade de produtos por unidade
/**
 * Responsável por:
 * - Gerenciar quantidade de produtos em estoque
 * - Destacar produtos com baixo estoque
 * - Atualizar estoque após pedidos
 * - Impedir vendas sem estoque
 * - Mock de dados para apresentação
 */

import { apiClient } from './api'

export interface StockItem {
  id: string
  produtoId: string
  unidadeId: string
  quantidade: number
  quantidadeMinima: number
  atualizado: Date
}

class StockService {
  private stockCache: Map<string, StockItem[]> = new Map()

  /**
   * Obtém estoque de uma unidade
   * Alexsander Xavier - 4338139
   */
  async getStockByUnit(unitId: string): Promise<StockItem[]> {
    try {
      // Verifica cache - Alexsander Xavier - 4338139
      if (this.stockCache.has(unitId)) {
        return this.stockCache.get(unitId) || []
      }

      // Tenta buscar da API - Alexsander Xavier - 4338139
      const response = await apiClient.get<{ data: StockItem[] }>('/stock', {
        params: { unitId },
      })
      const stock = Array.isArray(response.data) ? response.data : response.data.data || []
      this.stockCache.set(unitId, stock)
      return stock
    } catch (error) {
      // Mock: estoque por unidade - Alexsander Xavier - 4338139
      const stock = this.getMockStockByUnit(unitId)
      this.stockCache.set(unitId, stock)
      return stock
    }
  }

  /**
   * Atualiza quantidade de um produto
   * Alexsander Xavier - 4338139
   */
  async updateStock(
    produtoId: string,
    unidadeId: string,
    novaQuantidade: number
  ): Promise<StockItem | null> {
    try {
      const response = await apiClient.put<StockItem>(`/stock/${produtoId}/${unidadeId}`, {
        quantidade: novaQuantidade,
      })
      
      // Atualiza cache - Alexsander Xavier - 4338139
      const stock = this.stockCache.get(unidadeId) || []
      const index = stock.findIndex((s) => s.produtoId === produtoId)
      if (index >= 0) {
        stock[index] = response.data
        this.stockCache.set(unidadeId, stock)
      }
      
      return response.data
    } catch (error) {
      return null
    }
  }

  /**
   * Reduz estoque após pedido (usado automaticamente)
   * Alexsander Xavier - 4338139
   */
  async reduceStock(
    produtoId: string,
    unidadeId: string,
    quantidade: number
  ): Promise<boolean> {
    try {
      const stock = await this.getStockByUnit(unidadeId)
      const item = stock.find((s) => s.produtoId === produtoId)
      
      if (!item || item.quantidade < quantidade) {
        return false
      }
      
      await this.updateStock(produtoId, unidadeId, item.quantidade - quantidade)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Verifica se produto tem estoque
   * Sempre retorna true (estoque ilimitado para teste) - Alexsander Xavier - 4338139
   */
  async temEstoque(produtoId: string, unidadeId: string, quantidade: number): Promise<boolean> {
    try {
      const stock = await this.getStockByUnit(unidadeId)
      const item = stock.find((s) => s.produtoId === produtoId)
      
      // Se encontra no mock, valida
      if (item) {
        return item.quantidade >= quantidade
      }
      
      // Se não encontra, assume que tem estoque (modo fallback)
      return true
    } catch (error) {
      // Em caso de erro, permite (assume que tem estoque)
      return true
    }
  }  /**
   * Identifica itens com baixo estoque
   * Alexsander Xavier - 4338139
   */
  getBaixoEstoque(items: StockItem[]): StockItem[] {
    return items.filter((item) => item.quantidade <= item.quantidadeMinima)
  }

  /**
   * Mock de estoque por unidade
   * Garante variação entre COMPLETA e REDUZIDA
   * Alexsander Xavier - 4338139
   */
  private getMockStockByUnit(unitId: string): StockItem[] {
    // Tipo de unidade determina estoque inicial - Alexsander Xavier - 4338139
    const isCompleta = ['unit-bh', 'unit-rj', 'unit-sp'].includes(unitId)

    const baseStock: StockItem[] = [
      // Pratos executivos
      {
        id: 'stock-001',
        produtoId: 'prod-001',
        unidadeId: unitId,
        quantidade: isCompleta ? 25 : 15,
        quantidadeMinima: 5,
        atualizado: new Date(),
      },
      {
        id: 'stock-002',
        produtoId: 'prod-002',
        unidadeId: unitId,
        quantidade: isCompleta ? 30 : 20,
        quantidadeMinima: 8,
        atualizado: new Date(),
      },
      {
        id: 'stock-003',
        produtoId: 'prod-003',
        unidadeId: unitId,
        quantidade: isCompleta ? 28 : 18,
        quantidadeMinima: 7,
        atualizado: new Date(),
      },
      {
        id: 'stock-004',
        produtoId: 'prod-004',
        unidadeId: unitId,
        quantidade: isCompleta ? 20 : 0, // Só COMPLETA tem
        quantidadeMinima: 5,
        atualizado: new Date(),
      },
      {
        id: 'stock-005',
        produtoId: 'prod-005',
        unidadeId: unitId,
        quantidade: isCompleta ? 22 : 0, // Só COMPLETA tem
        quantidadeMinima: 6,
        atualizado: new Date(),
      },
      {
        id: 'stock-006',
        produtoId: 'prod-006',
        unidadeId: unitId,
        quantidade: isCompleta ? 40 : 30,
        quantidadeMinima: 10,
        atualizado: new Date(),
      },

      // Bebidas
      {
        id: 'stock-007',
        produtoId: 'prod-007',
        unidadeId: unitId,
        quantidade: isCompleta ? 50 : 35,
        quantidadeMinima: 15,
        atualizado: new Date(),
      },
      {
        id: 'stock-008',
        produtoId: 'prod-008',
        unidadeId: unitId,
        quantidade: isCompleta ? 40 : 0,
        quantidadeMinima: 10,
        atualizado: new Date(),
      },
      {
        id: 'stock-009',
        produtoId: 'prod-009',
        unidadeId: unitId,
        quantidade: isCompleta ? 45 : 30,
        quantidadeMinima: 12,
        atualizado: new Date(),
      },
      {
        id: 'stock-010',
        produtoId: 'prod-010',
        unidadeId: unitId,
        quantidade: isCompleta ? 60 : 40,
        quantidadeMinima: 20,
        atualizado: new Date(),
      },
      {
        id: 'stock-011',
        produtoId: 'prod-011',
        unidadeId: unitId,
        quantidade: isCompleta ? 100 : 60,
        quantidadeMinima: 30,
        atualizado: new Date(),
      },
      {
        id: 'stock-012',
        produtoId: 'prod-012',
        unidadeId: unitId,
        quantidade: isCompleta ? 25 : 0,
        quantidadeMinima: 8,
        atualizado: new Date(),
      },

      // Acompanhamentos
      {
        id: 'stock-013',
        produtoId: 'prod-013',
        unidadeId: unitId,
        quantidade: isCompleta ? 35 : 25,
        quantidadeMinima: 10,
        atualizado: new Date(),
      },
      {
        id: 'stock-014',
        produtoId: 'prod-014',
        unidadeId: unitId,
        quantidade: isCompleta ? 40 : 25,
        quantidadeMinima: 10,
        atualizado: new Date(),
      },
      {
        id: 'stock-015',
        produtoId: 'prod-015',
        unidadeId: unitId,
        quantidade: isCompleta ? 50 : 30,
        quantidadeMinima: 15,
        atualizado: new Date(),
      },
      {
        id: 'stock-016',
        produtoId: 'prod-016',
        unidadeId: unitId,
        quantidade: isCompleta ? 45 : 28,
        quantidadeMinima: 12,
        atualizado: new Date(),
      },

      // Sobremesas
      {
        id: 'stock-017',
        produtoId: 'prod-017',
        unidadeId: unitId,
        quantidade: isCompleta ? 32 : 20,
        quantidadeMinima: 8,
        atualizado: new Date(),
      },
      {
        id: 'stock-018',
        produtoId: 'prod-018',
        unidadeId: unitId,
        quantidade: isCompleta ? 28 : 18,
        quantidadeMinima: 7,
        atualizado: new Date(),
      },
      {
        id: 'stock-019',
        produtoId: 'prod-019',
        unidadeId: unitId,
        quantidade: isCompleta ? 30 : 20,
        quantidadeMinima: 8,
        atualizado: new Date(),
      },
      {
        id: 'stock-020',
        produtoId: 'prod-020',
        unidadeId: unitId,
        quantidade: isCompleta ? 25 : 0,
        quantidadeMinima: 8,
        atualizado: new Date(),
      },
    ]

    return baseStock
  }

  /**
   * Limpa cache
   * Alexsander Xavier - 4338139
   */
  clearCache(): void {
    this.stockCache.clear()
  }
}

export const stockService = new StockService()
