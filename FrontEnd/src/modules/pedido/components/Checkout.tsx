// Alexsander Xavier - 4338139
// Checkout Component - 4-step form: Review/Delivery/Payment/Processing
import React, { useState } from 'react';
import { useToast } from '@contexts/ToastContext';
import { orderService, OrderRequest, DeliveryType } from '@services/orderService';
import { paymentService, PaymentMethod } from '@services/paymentService';
import PaymentModal from './PaymentModal';

interface CheckoutItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

interface CheckoutProps {
  items: CheckoutItem[];
  channel: 'APP' | 'TOTEM' | 'BALCAO' | 'PICKUP';
  onSuccess: (orderId: string, consumptionType?: 'local' | 'retirar') => void;
  onCancel: () => void;
  unitId: string;
}

type Step = 'delivery_type' | 'review' | 'consumption_type' | 'delivery' | 'payment' | 'processing';

const Checkout: React.FC<CheckoutProps> = ({ items, channel, onSuccess, onCancel, unitId }) => {
  const [currentStep, setCurrentStep] = useState<Step>(channel === 'APP' ? 'delivery_type' : 'review');
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [consumptionType, setConsumptionType] = useState<'local' | 'retirar' | null>(null);
  const [deliveryType, setDeliveryType] = useState<'entrega' | 'retirada' | null>(null);
  const toast = useToast();

  const processOrder = async (paymentMethod: PaymentMethod | null) => {
    if (!paymentMethod) {
      toast.showToast('Selecione um método de pagamento', 'error');
      return;
    }

    if (channel === 'APP' && deliveryType === 'entrega' && !deliveryInfo.address) {
      toast.showToast('Preencha o endereço de entrega', 'error');
      return;
    }

    let finalDeliveryType = DeliveryType.ENTREGA;
    if (channel === 'TOTEM') {
      finalDeliveryType = consumptionType === 'local' ? DeliveryType.PICKUP : DeliveryType.RETIRADA;
    } else if (channel === 'APP') {
      finalDeliveryType = deliveryType === 'entrega' ? DeliveryType.ENTREGA : DeliveryType.RETIRADA;
    }

    const orderRequest: OrderRequest = {
      unitId,
      clientName: deliveryInfo.name || (channel === 'TOTEM' ? 'Cliente Totem' : ''),
      clientPhone: deliveryInfo.phone || (channel === 'TOTEM' ? '0000000000' : ''),
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
      })),
      deliveryType: finalDeliveryType,
      deliveryAddress: finalDeliveryType === DeliveryType.ENTREGA ? {
        street: deliveryInfo.address,
        number: '',
        neighborhood: '',
        city: '',
        cep: '',
      } : undefined,
      channel,
    };

    try {
      const order = await orderService.createOrder(orderRequest);
      setOrderId(order.id);
      if (channel === 'TOTEM') {
        setShowPaymentModal(true);
      } else {
        setCurrentStep('processing');
        setShowPaymentModal(true);
      }
    } catch (error: any) {
      toast.showToast(error.message || 'Erro ao criar pedido', 'error');
    }
  };
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleNext = async () => {
    if (currentStep === 'delivery_type') {
      if (!deliveryType) {
        toast.showToast('Selecione o tipo de entrega', 'error');
        return;
      }
      setCurrentStep('review');
    } else if (currentStep === 'review') {
      if (channel === 'TOTEM') {
        setCurrentStep('consumption_type');
      } else if (channel === 'APP') {
        if (deliveryType === 'entrega') {
          setCurrentStep('delivery');
        } else {
          setCurrentStep('payment');
        }
      } else {
        setCurrentStep('delivery');
      }
    } else if (currentStep === 'consumption_type') {
      if (!consumptionType) {
        toast.showToast('Selecione o tipo de consumo', 'error');
        return;
      }
      setCurrentStep('payment');
    } else if (currentStep === 'delivery') {
      if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
        toast.showToast('Preencha todos os campos de entrega', 'error');
        return;
      }
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      await processOrder(selectedPaymentMethod);
    }
  };

  const handlePaymentComplete = async (method: PaymentMethod) => {
    setShowPaymentModal(false);
    if (orderId) {
      try {
        await orderService.confirmOrderPayment(orderId, `${channel}-${method}-${Date.now()}`);
      } catch (_error) {
        // Ainda avança para a tela final mesmo se a confirmação não puder ser sincronizada.
      }
      onSuccess(orderId, consumptionType || undefined);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setCurrentStep('payment');
  };

  const renderReviewStep = () => (
    <div>
      <h2>Revisar Pedido</h2>
      {channel === 'TOTEM' && (
        <div style={{ marginBottom: '1rem' }}>
          <h3>Informações para Retirada</h3>
          <input
            type="text"
            placeholder="Nome"
            value={deliveryInfo.name}
            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })}
            style={{ display: 'block', marginBottom: '0.5rem', padding: '0.5rem', width: '100%' }}
          />
          <input
            type="text"
            placeholder="Telefone"
            value={deliveryInfo.phone}
            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
            style={{ display: 'block', marginBottom: '0.5rem', padding: '0.5rem', width: '100%' }}
          />
        </div>
      )}
      {channel === 'APP' && (
        <div style={{ marginBottom: '1rem' }}>
          <h3>Informações do Cliente</h3>
          <input
            type="text"
            placeholder="Nome"
            value={deliveryInfo.name}
            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })}
            style={{ display: 'block', marginBottom: '0.5rem', padding: '0.5rem', width: '100%' }}
          />
          <input
            type="text"
            placeholder="Telefone"
            value={deliveryInfo.phone}
            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
            style={{ display: 'block', marginBottom: '0.5rem', padding: '0.5rem', width: '100%' }}
          />
        </div>
      )}
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item.name} - Quantidade: {item.quantity} - R$ {(item.price * item.quantity).toFixed(2)}
          </li>
        ))}
      </ul>
      <p><strong>Total: R$ {total.toFixed(2)}</strong></p>
      <button onClick={handleNext}>Próximo</button>
    </div>
  );

  const renderDeliveryTypeStep = () => (
    <div>
      <h2>Como deseja receber?</h2>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <input
            type="radio"
            id="entrega"
            name="deliveryType"
            value="entrega"
            checked={deliveryType === 'entrega'}
            onChange={() => setDeliveryType('entrega')}
          />
          <label htmlFor="entrega">🚗 Entrega em casa</label>
        </div>
        <div>
          <input
            type="radio"
            id="retirada"
            name="deliveryType"
            value="retirada"
            checked={deliveryType === 'retirada'}
            onChange={() => setDeliveryType('retirada')}
          />
          <label htmlFor="retirada">🚪 Retirar na unidade</label>
        </div>
      </div>
      <button onClick={handleNext}>Próximo</button>
    </div>
  );

  const renderDeliveryStep = () => (
    <div>
      <h2>Informações de Entrega</h2>
      <input
        type="text"
        placeholder="Nome"
        value={deliveryInfo.name}
        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Telefone"
        value={deliveryInfo.phone}
        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
      />
      <input
        type="text"
        placeholder="Endereço"
        value={deliveryInfo.address}
        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
      />
      <button onClick={handleNext}>Próximo</button>
    </div>
  );

  const renderPaymentStep = () => (
    <div style={{ padding: channel === 'TOTEM' ? '2rem' : '1rem' }}>
      <h2 style={{ fontSize: channel === 'TOTEM' ? '2rem' : '1.5rem', marginBottom: '2rem' }}>
        {channel === 'TOTEM' ? '💳 Forma de Pagamento' : 'Selecionar Pagamento'}
      </h2>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: channel === 'TOTEM' ? '1.5rem' : '1rem',
        margin: '1.5rem 0'
      }}>
        {paymentService.getAvailableMethods(channel === 'PICKUP' ? 'BALCAO' : channel).map(method => (
          <div
            key={method}
            onClick={() => {
              setSelectedPaymentMethod(method);
              if (channel === 'TOTEM') {
                processOrder(method);
              }
            }}
            style={{
              padding: channel === 'TOTEM' ? '1.5rem' : '0.75rem',
              border: selectedPaymentMethod === method ? '3px solid #4caf50' : '2px solid #ddd',
              borderRadius: '12px',
              cursor: 'pointer',
              backgroundColor: selectedPaymentMethod === method ? '#f0f8f0' : '#fff',
              transition: 'all 0.2s',
              fontSize: channel === 'TOTEM' ? '1.3rem' : '1rem',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            {paymentService.getMethodLabel(method)}
          </div>
        ))}
      </div>
      {channel !== 'TOTEM' && (
        <button onClick={handleNext} style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: selectedPaymentMethod ? 'pointer' : 'not-allowed',
          opacity: selectedPaymentMethod ? 1 : 0.5
        }}>
          Finalizar
        </button>
      )}
    </div>
  );

  const renderProcessingStep = () => (
    <div>
      <h2>Processando...</h2>
      <p>Aguarde enquanto processamos seu pedido.</p>
    </div>
  );

  const renderConsumptionTypeStep = () => (
    <div>
      <h2>Como deseja consumir?</h2>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <input
            type="radio"
            id="local"
            name="consumption"
            value="local"
            checked={consumptionType === 'local'}
            onChange={() => setConsumptionType('local')}
          />
          <label htmlFor="local">🍽️ Consumir no local</label>
        </div>
        <div>
          <input
            type="radio"
            id="retirar"
            name="consumption"
            value="retirar"
            checked={consumptionType === 'retirar'}
            onChange={() => setConsumptionType('retirar')}
          />
          <label htmlFor="retirar">🥡 Retirar</label>
        </div>
      </div>
      <button onClick={handleNext}>Próximo</button>
    </div>
  );

  return (
    <div>
      {currentStep === 'delivery_type' && renderDeliveryTypeStep()}
      {currentStep === 'review' && renderReviewStep()}
      {currentStep === 'consumption_type' && renderConsumptionTypeStep()}
      {currentStep === 'delivery' && renderDeliveryStep()}
      {currentStep === 'payment' && renderPaymentStep()}
      {currentStep === 'processing' && renderProcessingStep()}
      {showPaymentModal && selectedPaymentMethod && orderId && (
        <PaymentModal
          method={selectedPaymentMethod}
          amount={total}
          orderId={orderId}
          channel={channel}
          onComplete={handlePaymentComplete}
          onCancel={handlePaymentCancel}
        />
      )}
      <button onClick={onCancel}>Cancelar</button>
    </div>
  );
};

export default Checkout;