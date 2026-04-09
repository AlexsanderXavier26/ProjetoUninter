// Totem de Autoatendimento - Permite pedidos sem login
/**
 * Fluxo:
 * 1. Seleção de unidade
 * 2. Visualização de produtos
 * 3. Adição ao carrinho
 * 4. Abre Checkout component para finalizar
 * 5. Redireciona para /pedido/:id após sucesso
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@contexts/ToastContext';
import Spinner from '@components/Spinner';
import Checkout from '@modules/pedido/components/Checkout';
import { unitService, Product } from '@services/unitService';
import { CartItem } from '@services/orderService';
import styles from './TotemPage.module.css';

interface LocalCartItem {
  product: Product;
  quantity: number;
}

const TotemPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<LocalCartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const toast = useToast();
  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  // Carrega unidades ao montar - Alexsander Xavier - 4338139
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        const data = await unitService.getUnits();
        setUnits(data);
        if (data.length > 0) {
          setSelectedUnit(data[0].id);
        }
      } catch (_err: any) {
        toast.showToast('Erro ao carregar unidades', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUnits();
  }, [toast]);

  // Carrega produtos quando unidade muda - Alexsander Xavier - 4338139
  useEffect(() => {
    if (!selectedUnit) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await unitService.getProductsByUnit(selectedUnit);
        setProducts(data);
        setError('');
      } catch (err: any) {
        setError(err.message);
        toast.showToast('Erro ao carregar produtos', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedUnit, toast]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.product.id === product.id
            ? { ...c, quantity: c.quantity + 1 }
            : c,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.showToast(`${product.name} adicionado`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  };

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty < 1) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        c.product.id === productId ? { ...c, quantity: newQty } : c,
      ),
    );
  };

  const handleCheckoutSuccess = (orderId: string, consumptionType?: 'local' | 'retirar') => {
    // Salvar pedido no localStorage
    const orderData = {
      id: orderId,
      type: consumptionType === 'local' ? 'local' : 'retirada',
      items: cart.map(c => ({
        productId: c.product.id,
        quantity: c.quantity,
        price: c.product.price,
        name: c.product.name
      })),
      total,
      paymentMethod: 'totem', // será atualizado se necessário
      status: 'recebido',
      createdAt: new Date().toISOString(),
      unitId: selectedUnit
    };
    localStorage.setItem(`order_${orderId}`, JSON.stringify(orderData));

    setCart([]);
    setShowCheckout(false);
    toast.showToast('Pedido realizado com sucesso!', 'success');
    // TOTEM: resetar estado e voltar para tela inicial
    setSelectedUnit(null);
  };

  const total = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0);

  // Renderiza o formulário de checkout - Alexsander Xavier - 4338139
  if (showCheckout && cart.length > 0) {
    const checkoutItems: typeof cart = cart;

    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
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
          items={checkoutItems.map((c) => ({
            productId: c.product.id,
            quantity: c.quantity,
            price: c.product.price,
            name: c.product.name,
          }))}
          channel="TOTEM"
          onSuccess={handleCheckoutSuccess}
          onCancel={() => setShowCheckout(false)}
          unitId={selectedUnit || ''}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div>
          <h1>Raízes do Nordeste</h1>
          <p>Selecione sua unidade e descubra sabores típicos do sertão com toque profissional.</p>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* Seletor de unidade - Alexsander Xavier - 4338139 */}
      <div className={styles.unitSelector}>
        <label>Selecione a Unidade:</label>
        <select
          disabled={loading || units.length === 0}
          value={selectedUnit || ''}
          onChange={(e) => setSelectedUnit(e.target.value)}
        >
          <option value="">-- Escolha uma unidade --</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* Grid de produtos - Alexsander Xavier - 4338139 */}
      <div className={styles.grid}>
        {loading && (
          <div className={styles.loader}>
            <Spinner />
            <p>Carregando produtos...</p>
          </div>
        )}
        {!loading && products.length === 0 && (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999' }}>
            Selecione uma unidade para ver os produtos
          </p>
        )}

        {products.map((p) => {
          const displayPrice = typeof p.price === 'number' && p.price >= 0 ? p.price : 0;
          // Alexsander Xavier - 4338139: Fallback para imagem se não existir
          const imageSrc = p.image || '/assets/images/produtos/placeholder.svg';

          return (
            <button
              key={p.id}
              className={styles.card}
              onClick={() => addToCart(p)}
              type="button"
              title="Adicionar ao carrinho"
            >
              <div className={styles.imageWrapper}>
                <img
                  src={imageSrc}
                  alt={p.name}
                  className={styles.productImage}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <span className={styles.categoryTag}>{unitService.getCategoryLabel(p.category)}</span>
              <strong>{p.name}</strong>
              {p.description && <p className={styles.description}>{p.description}</p>}
              <div className={styles.priceTag}>R$ {displayPrice.toFixed(2)}</div>
              <div className={styles.cta}>+ Adicionar</div>
            </button>
          );
        })}
      </div>

      {/* Seção do carrinho - Alexsander Xavier - 4338139 */}
      <div className={styles.cartSection}>
        <h2>📦 Meu Pedido</h2>

        {cart.length === 0 ? (
          <p className={styles.emptyCart}>Seu carrinho está vazio. Selecione produtos acima!</p>
        ) : (
          <>
            {/* Itens do carrinho */}
            <div className={styles.cartItems}>
              {cart.map((c) => {
                const productPrice = typeof c.product.price === 'number' ? c.product.price : 0;
                return (
                  <div key={c.product.id} className={styles.cartItemCard}>
                    <div className={styles.cartItemInfo}>
                      <h4>{c.product.name}</h4>
                    </div>
                    <div className={styles.cartItemControls}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(c.product.id, c.quantity - 1)}
                        disabled={loading}
                      >
                        −
                      </button>
                      <span className={styles.quantity}>{c.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(c.product.id, c.quantity + 1)}
                        disabled={loading}
                      >
                        +
                      </button>
                    </div>
                    <div className={styles.cartItemPrice}>
                      <div className={styles.subtotal}>
                        R$ {(productPrice * c.quantity).toFixed(2)}
                      </div>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => removeFromCart(c.product.id)}
                        title="Remover item"
                        disabled={loading}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rodapé do carrinho */}
            <div className={styles.cartFooter}>
              <div className={styles.totalSection}>
                <span>Total:</span>
                <strong className={styles.totalPrice}>R$ {total.toFixed(2)}</strong>
              </div>
              <button
                onClick={() => setShowCheckout(true)}
                disabled={cart.length === 0 || loading}
                className={styles.submitButton}
              >
                {loading ? '⏳ Carregando...' : '✓ Finalizar Pedido'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TotemPage;

