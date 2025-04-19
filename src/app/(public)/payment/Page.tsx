'use client';

import { useState, useEffect } from 'react';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  // other fields if needed
}

export default function PaymentPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [tip, setTip] = useState<number>(0);
  const [customTip, setCustomTip] = useState<string>('');

  // Load cart from localStorage and compute subtotal
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    const parsed: CartItem[] = saved ? JSON.parse(saved) : [];
    setCartItems(parsed);
  }, []);

  // Compute subtotal from cartItems
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Fixed delivery fee
  const deliveryFee = 45;

  // Compute total including tip
  const total = subtotal + deliveryFee + tip;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Order Placed!\n` +
      `Subtotal: ৳${subtotal.toFixed(2)}\n` +
      `Delivery Fee: ৳${deliveryFee.toFixed(2)}\n` +
      `Tip: ৳${tip.toFixed(2)}\n` +
      `Total: ৳${total.toFixed(2)}\n\n` +
      `Delivery: ${deliveryMethod}\n` +
      `Payment: ${paymentMethod}`
    );
  };

  const backgroundImageUrl =
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1920&q=80";

  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center p-6"
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(0,0,0,0.3)',
      }}
    >
      <img
        src="/images/rider-cartoon.png"
        alt="Rider delivering food"
        className="absolute bottom-0 left-4 w-48 opacity-20 pointer-events-none"
      />

      <form
        onSubmit={handleSubmit}
        className="relative backdrop-blur-md p-8 rounded-xl shadow-2xl max-w-lg w-full border border-yellow-600"
        style={{ backgroundColor: '#deecbb' }}
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-black">
          🧾 Payment & Delivery
        </h2>

        {/* Delivery Options */}
        <div className="mb-4">
          <label className="font-semibold block mb-2 text-black">
            Delivery Options
          </label>
          <select
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value)}
            required
            className="w-full border-2 border-black p-2 rounded"
          >
            <option value="">-- Select --</option>
            <option value="Saver">Saver (35 – 50 min)</option>
            <option value="Standard">Standard (25 – 40 min)</option>
            <option value="Priority">Priority (20 – 35 min)</option>
          </select>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <label className="font-semibold block mb-2 text-black">
            Payment Methods
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
            className="w-full border-2 border-black p-2 rounded"
          >
            <option value="">-- Select --</option>
            <option value="Cash on Delivery">Cash on Delivery</option>
            <option value="Bkash">Bkash</option>
            <option value="Card or Debit Card">Card or Debit Card</option>
          </select>
        </div>

        {/* Tip Section */}
        <div className="mb-6">
          <label className="font-semibold block mb-2 text-black">Tip Your Rider</label>
          <div className="flex items-center space-x-2 mb-2">
            {[10, 20, 30].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setTip(amt);
                  setCustomTip('');
                }}
                className={`py-2 px-4 rounded ${
                  tip === amt ? 'bg-green-700 text-white' : 'bg-green-500 text-white'
                } hover:bg-green-600`}
              >
                ৳{amt}
              </button>
            ))}
          </div>
          <div className="flex items-center">
            <input
              type="number"
              min="0"
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value)}
              onBlur={() => setTip(parseFloat(customTip) || 0)}
              placeholder="Other amount"
              className="flex-1 border-2 border-black p-2 rounded"
            />
            <span className="ml-2 text-black">Tk</span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-6 space-y-1 text-black">
          <h3 className="font-bold text-xl">Order Summary</h3>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>৳{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>৳{deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tip</span>
            <span>৳{tip.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>৳{total.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          className="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-600 w-full font-semibold shadow-md"
        >
          Confirm Order 
        </button>
      </form>
    </div>
  );
}
