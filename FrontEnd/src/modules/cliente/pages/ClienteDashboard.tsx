// Alexsander Xavier - 4338139
import React, { useState, useEffect, useMemo } from 'react'
import { apiClient } from '@services/api'
import { useCliente, Product } from '../context/ClienteContext'
import { useUnits } from '../hooks/useUnits'
import { useProducts } from '../hooks/useProducts'
import ClienteCarrinho from '../components/ClienteCarrinho'
import Checkout from '@modules/pedido/components/Checkout'
import { useNavigate } from 'react-router-dom'
import styles from './ClienteDashboard.module.css'
import ConsentModal from '@modules/cliente/components/ConsentModal'

const ClienteDashboard: React.FC = () => {
  const { units, loading: unitsLoading } = useUnits()
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const { products, loading: productsLoading } = useProducts(selectedUnit)
  const { cart, addToCart, consent, giveConsent, loyaltyPoints, pointsToNext } = useCliente()
  const [categoriaFiltro, setCategoriaFiltro] = useState<'tudo' | 'prato' | 'cerveja' | 'refrigerante' | 'combo'>('tudo')
  const [origemFiltro, setOrigemFiltro] = useState<string>('tudo')
  const [showCheckout, setShowCheckout] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (units.length > 0 && selectedUnit === null) {
      setSelectedUnit(units[0].id)
    }
  }, [units, selectedUnit])

  const handleFinalize = () => {
    if (cart.length === 0) return
    navigate('/app/pedido-tipo')
  }

  const handleCheckoutSuccess = (orderId: string) => {
    setShowCheckout(false)
    navigate(`/app/pedido/${orderId}`)
  }

  const menuFiltrado = useMemo(() => {
    let lista = products
    if (categoriaFiltro !== 'tudo') {
      lista = lista.filter((p) => p.categoria === categoriaFiltro)
    }
    if (origemFiltro !== 'tudo') {
      lista = lista.filter((p) => p.origem?.toLowerCase().includes(origemFiltro.toLowerCase()))
    }
    return lista
  }, [products, categoriaFiltro, origemFiltro])

  const origensDisponiveis = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => p.origem && set.add(p.origem))
    return Array.from(set)
  }, [products])

  return (
    <div className={styles.container}>
      {!consent && <ConsentModal onAccept={giveConsent} />}

      <div className={styles.header}>
        <div className={styles.selector}>
          <label>Unidade:</label>
          <select
            disabled={unitsLoading}
            value={selectedUnit ?? ''}
            onChange={(e) => setSelectedUnit(e.target.value)}
          >
            <option value="">-- Selecione uma unidade --</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          {unitsLoading && <span className={styles.loading}>carregando...</span>}
        </div>

        <div className={styles.filters}>
          <label>
            Categoria:
            <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value as any)}>
              <option value="tudo">Tudo</option>
              <option value="prato">Prato</option>
              <option value="cerveja">Cerveja</option>
              <option value="refrigerante">Refrigerante</option>
              <option value="combo">Combo</option>
            </select>
          </label>
          <label>
            Origem:
            <select value={origemFiltro} onChange={(e) => setOrigemFiltro(e.target.value)}>
              <option value="tudo">Tudo</option>
              {origensDisponiveis.map((origem) => (
                <option key={origem} value={origem}>{origem}</option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.loyalty}>
          <strong>Pontos:</strong> {loyaltyPoints} (<em>{pointsToNext} para próximo desconto</em>)
        </div>
      </div>

      <div className={styles.announce}>
        <h2>Combos em destaque</h2>
        <span>Promoções sempre no topo</span>
      </div>

      <div className={styles.productGrid}>
        {productsLoading && <p>Carregando produtos...</p>}
        {!productsLoading && menuFiltrado.length === 0 && <p>Nenhum produto encontrado com os filtros selecionados.</p>}

        {menuFiltrado.map((p) => (
          <article key={p.id} className={`${styles.card} ${p.categoria === 'combo' ? styles.cardCombo : ''}`}>
            <img src={p.imagem || '/images/placeholder.png'} alt={p.nome} className={styles.thumbnail} />
            <div className={styles.cardBody}>
              <h3>{p.nome}</h3>
              <p className={styles.description}>{p.descricao}</p>
              <p className={styles.origin}>Origem: {p.origem}</p>
              <p className={styles.price}>{p.preco ? p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Preço não disponível'}</p>
              <button className={styles.addBtn} onClick={() => addToCart(p)}>
                Adicionar
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.cartWrapper}>
        {showCheckout && cart.length > 0 ? (
          <>
            <button
              onClick={() => setShowCheckout(false)}
              style={{
                marginBottom: '1rem',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                backgroundColor: '#ddd',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              ← Voltar
            </button>
            <Checkout
              items={cart.map((c: any) => ({
                productId: c.id,
                quantity: c.quantidade,
                price: c.preco,
                name: c.nome,
              }))}
              channel="APP"
              onSuccess={handleCheckoutSuccess}
              onCancel={() => setShowCheckout(false)}
              unitId={selectedUnit || ''}
            />
          </>
        ) : (
          <ClienteCarrinho onFinalize={handleFinalize} />
        )}
      </div>
    </div>
  )
}

export default ClienteDashboard
