// Alexsander Xavier - 4338139
import React from 'react'
import { useCliente, CartItem } from '../context/ClienteContext'
import styles from './ClienteCarrinho.module.css'

interface Props {
  onFinalize?: () => void
}

const ClienteCarrinho: React.FC<Props> = ({ onFinalize }) => {
  const { cart, updateQuantity, removeFromCart, total } = useCliente()

  return (
    <div className={styles.container}>
      <h3>🛒 Meu Carrinho</h3>
      {cart.length === 0 ? (
        <p className={styles.emptyMessage}>Seu carrinho está vazio</p>
      ) : (
        <>
          <div className={styles.cartList}>
            {cart.map((item: CartItem) => (
              <div key={item.id} className={styles.cartItemCard}>
                <img src={item.imagem || '/images/placeholder.png'} alt={item.nome} className={styles.itemImage} />
                <div className={styles.itemDetails}>
                  <h4>{item.nome}</h4>
                  <p className={styles.itemPrice}>R$ {item.preco.toFixed(2)}</p>
                </div>
                <div className={styles.itemControls}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                    title="Remover 1"
                  >
                    −
                  </button>
                  <span className={styles.qty}>{item.quantidade}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                    title="Adicionar 1"
                  >
                    +
                  </button>
                </div>
                <div className={styles.subtotal}>
                  R$ {(item.preco * item.quantidade).toFixed(2)}
                </div>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeFromCart(item.id)}
                  title="Remover do carrinho"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <div className={styles.cartFooter}>
            <div className={styles.totalInfo}>
              <span>Total:</span>
              <strong className={styles.totalAmount}>{(total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            </div>
            <button
              className={styles.finalizeBtn}
              disabled={cart.length === 0}
              onClick={onFinalize}
            >
              ✓ Finalizar Pedido
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ClienteCarrinho
