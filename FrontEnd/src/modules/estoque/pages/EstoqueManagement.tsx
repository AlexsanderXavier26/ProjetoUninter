// Alexsander Xavier - 4338139
// Página de Gerenciamento de Estoque
/**
 * Acesso restrito: GERENTE e FUNCIONÁRIO
 * Funcionalidades:
 * - Listar produtos e quantidades
 * - Atualizar estoque
 * - Destacar baixo estoque
 * - Itens indisponíveis
 */

import React, { useEffect, useState } from 'react'
import { useToast } from '@contexts/ToastContext'
import { unitService, Product } from '@services/unitService'
import { stockService, StockItem } from '@services/stockService'
import Spinner from '@components/Spinner'
import styles from './EstoqueManagement.module.css'

const EstoqueManagement: React.FC = () => {
  const [units, setUnits] = useState<any[]>([])
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [stock, setStock] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const toast = useToast()

  // Carrega unidades ao montar - Alexsander Xavier - 4338139
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true)
        const data = await unitService.getUnits()
        setUnits(data)
        if (data.length > 0) {
          setSelectedUnit(data[0].id)
        }
      } catch (err: any) {
        toast.showToast('Erro ao carregar unidades', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchUnits()
  }, [toast])

  // Carrega produtos e estoque quando unidade muda - Alexsander Xavier - 4338139
  useEffect(() => {
    if (!selectedUnit) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const [productsData, stockData] = await Promise.all([
          unitService.getProductsByUnit(selectedUnit),
          stockService.getStockByUnit(selectedUnit),
        ])
        setProducts(productsData)
        setStock(stockData)
      } catch (err: any) {
        toast.showToast('Erro ao carregar dados', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedUnit, toast])

  // Inicia edição de estoque - Alexsander Xavier - 4338139
  const startEdit = (stockId: string, currentValue: number) => {
    setEditingId(stockId)
    setEditValue(currentValue)
  }

  // Salva alteração de estoque - Alexsander Xavier - 4338139
  const saveEdit = async (stockItem: StockItem) => {
    try {
      setLoading(true)
      await stockService.updateStock(stockItem.produtoId, selectedUnit || '', editValue)
      
      // Atualiza local - Alexsander Xavier - 4338139
      const updated = stock.map((s) =>
        s.id === stockItem.id ? { ...s, quantidade: editValue } : s
      )
      setStock(updated)
      
      setEditingId(null)
      toast.showToast('Estoque atualizado com sucesso', 'success')
    } catch (err: any) {
      toast.showToast('Erro ao atualizar estoque', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Cancela edição - Alexsander Xavier - 4338139
  const cancelEdit = () => {
    setEditingId(null)
    setEditValue(0)
  }

  // Verifica se estoque é baixo - Alexsander Xavier - 4338139
  const isBaixoEstoque = (item: StockItem): boolean => {
    return item.quantidade <= item.quantidadeMinima
  }

  // Verifica se está indisponível - Alexsander Xavier - 4338139
  const isIndisponivel = (item: StockItem): boolean => {
    return item.quantidade === 0
  }

  return (
    <div className={styles.container}>
      <h1>📦 Gerenciamento de Estoque</h1>
      <p className={styles.subtitle}>Atualizar quantidade de produtos por unidade</p>

      {/* Seletor de unidade - Alexsander Xavier - 4338139 */}
      <div className={styles.selector}>
        <label>Selecione a Unidade:</label>
        <select
          disabled={loading || units.length === 0}
          value={selectedUnit || ''}
          onChange={(e) => setSelectedUnit(e.target.value)}
        >
          <option value="">-- Escolha uma unidade --</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.tipo})
            </option>
          ))}
        </select>
      </div>

      {/* Tabela de estoque - Alexsander Xavier - 4338139 */}
      {loading ? (
        <div className={styles.loader}>
          <Spinner />
          <p>Carregando estoque...</p>
        </div>
      ) : stock.length === 0 ? (
        <p className={styles.empty}>Nenhum produto disponível</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th className={styles.colQty}>Quantidade</th>
                <th className={styles.colMin}>Mínimo</th>
                <th className={styles.colStatus}>Status</th>
                <th className={styles.colActions}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((item) => {
                const product = products.find((p) => p.id === item.produtoId)
                if (!product) return null

                const baixoEstoque = isBaixoEstoque(item)
                const indisponivel = isIndisponivel(item)
                const isEditing = editingId === item.id

                return (
                  <tr
                    key={item.id}
                    className={`
                      ${indisponivel ? styles.indisponivel : ''}
                      ${baixoEstoque ? styles.baixoEstoque : ''}
                    `}
                  >
                    <td className={styles.nameCell}>
                      <strong>{product.name}</strong>
                      {product.description && (
                        <small className={styles.desc}>{product.description}</small>
                      )}
                    </td>
                    <td>{unitService.getCategoryLabel(product.category)}</td>
                    <td>R$ {product.price.toFixed(2)}</td>
                    <td className={styles.colQty}>
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editValue}
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          className={styles.input}
                          disabled={loading}
                        />
                      ) : (
                        <strong
                          className={`
                            ${indisponivel ? styles.textDanger : ''}
                            ${baixoEstoque ? styles.textWarning : ''}
                          `}
                        >
                          {item.quantidade}
                        </strong>
                      )}
                    </td>
                    <td className={styles.colMin}>{item.quantidadeMinima}</td>
                    <td className={styles.colStatus}>
                      {indisponivel ? (
                        <span className={styles.badgeDanger}>❌ Indisponível</span>
                      ) : baixoEstoque ? (
                        <span className={styles.badgeWarning}>⚠️ Baixo Estoque</span>
                      ) : (
                        <span className={styles.badgeSuccess}>✓ OK</span>
                      )}
                    </td>
                    <td className={styles.colActions}>
                      {isEditing ? (
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.btnSave}
                            onClick={() => saveEdit(item)}
                            disabled={loading}
                          >
                            💾 Salvar
                          </button>
                          <button
                            className={styles.btnCancel}
                            onClick={cancelEdit}
                            disabled={loading}
                          >
                            ✕ Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          className={styles.btnEdit}
                          onClick={() => startEdit(item.id, item.quantidade)}
                          disabled={loading}
                        >
                          ✏️ Editar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Resumo - Alexsander Xavier - 4338139 */}
      {stock.length > 0 && (
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span>Total de Produtos:</span>
            <strong>{stock.length}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Baixo Estoque:</span>
            <strong className={styles.textWarning}>
              {stock.filter((s) => isBaixoEstoque(s) && !isIndisponivel(s)).length}
            </strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Indisponíveis:</span>
            <strong className={styles.textDanger}>{stock.filter((s) => isIndisponivel(s)).length}</strong>
          </div>
        </div>
      )}
    </div>
  )
}

export default EstoqueManagement
