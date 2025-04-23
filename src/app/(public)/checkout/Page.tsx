'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
}

interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  area: string;
  details?: string;
}


export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address: '',
    city: '',
    postalCode: '',
    area: '',
    details: '',
  });
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [tip, setTip] = useState<number>(0);
  const [customTip, setCustomTip] = useState<string>('');

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/sign-in?redirect=/checkout');
    }
  }, [status, router]);

  // Load cart from localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        const parsedCart = savedCart ? JSON.parse(savedCart) : [];
        
        if (parsedCart.length === 0) {
          // Redirect to cart if empty
          router.push('/cart');
          return;
        }
        
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart:', error);
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      loadCart();
    }
  }, [status, router]);

  // Calculate prices
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingPrice = 45;
  const total = subtotal + shippingPrice + tip;

  // Handle address form changes
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.area) {
        toast.error('Please complete your shipping address');
        setIsSubmitting(false);
        return;
      }

      if (!deliveryMethod) {
        toast.error('Please select a delivery method');
        setIsSubmitting(false);
        return;
      }

      if (!paymentMethod) {
        toast.error('Please select a payment method');
        setIsSubmitting(false);
        return;
      }

      // Create order items array
      const orderItems = cartItems.map(item => ({
        product: item._id,
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        price: item.price
      }));

      // Create order object
      const orderData = {
        orderItems,
        shippingAddress,
        paymentMethod,
        deliveryMethod,
        itemsPrice: subtotal,
        shippingPrice,
        tipAmount: tip,
        totalPrice: total,
      };

      // Submit order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Clear cart on successful order
      localStorage.removeItem('cart');
      
      // Redirect to order success page
      router.push(`/orders/${data.order._id}`);
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading checkout...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Shipping & Payment Details */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleAddressChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleAddressChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Area</label>
                <input
                  type="text"
                  name="area"
                  value={shippingAddress.area}
                  onChange={handleAddressChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Additional Details</label>
              <textarea
                name="details"
                value={shippingAddress.details}
                onChange={handleAddressChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Apartment number, floor, landmark, etc."
              ></textarea>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Delivery Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${deliveryMethod === 'Saver' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                onClick={() => setDeliveryMethod('Saver')}
              >
                <h3 className="font-medium">Saver</h3>
                <p className="text-sm text-gray-600">35 – 50 min</p>
              </div>
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${deliveryMethod === 'Standard' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                onClick={() => setDeliveryMethod('Standard')}
              >
                <h3 className="font-medium">Standard</h3>
                <p className="text-sm text-gray-600">25 – 40 min</p>
              </div>
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${deliveryMethod === 'Priority' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                onClick={() => setDeliveryMethod('Priority')}
              >
                <h3 className="font-medium">Priority</h3>
                <p className="text-sm text-gray-600">20 – 35 min</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === 'Cash on Delivery' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                onClick={() => setPaymentMethod('Cash on Delivery')}
              >
                <h3 className="font-medium">Cash on Delivery</h3>
                <p className="text-sm text-gray-600">Pay when you receive</p>
              </div>
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === 'Bkash' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                onClick={() => setPaymentMethod('Bkash')}
              >
                <h3 className="font-medium">Bkash</h3>
                <p className="text-sm text-gray-600">Mobile banking</p>
              </div>
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === 'Card or Debit Card' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                onClick={() => setPaymentMethod('Card or Debit Card')}
              >
                <h3 className="font-medium">Card Payment</h3>
                <p className="text-sm text-gray-600">Credit/Debit card</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Tip Your Rider</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {[0, 10, 20, 30, 50].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setTip(amount);
                    setCustomTip('');
                  }}
                  className={`py-2 px-4 rounded ${
                    tip === amount ? 'bg-green-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {amount === 0 ? 'No Tip' : `৳${amount}`}
                </button>
              ))}
            </div>
            <div className="flex items-center">
              <span className="mr-2">Custom:</span>
              <input
                type="number"
                min="0"
                value={customTip}
                onChange={(e) => setCustomTip(e.target.value)}
                onBlur={() => {
                  const value = parseInt(customTip);
                  if (!isNaN(value) && value >= 0) {
                    setTip(value);
                  } else {
                    setCustomTip('');
                  }
                }}
                className="border border-gray-300 rounded p-2 w-24"
                placeholder="Amount"
              />
              <span className="ml-2">৳</span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="max-h-60 overflow-y-auto mb-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex justify-between items-center mb-2 pb-2 border-b">
                  <div className="flex items-center">
                    <span className="mr-2">{item.quantity}x</span>
                    <span>{item.name}</span>
                  </div>
                  <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>৳{shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Rider Tip</span>
                <span>৳{tip.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>৳{total.toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded font-bold text-white ${
                isSubmitting ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}