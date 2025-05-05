"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function PaymentPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [tip, setTip] = useState<number>(0);
  const [customTip, setCustomTip] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState('+880');
  const [cardNumber, setCardNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [couponCode, setCouponCode] = useState(''); // State for coupon code
  const [couponDiscount, setCouponDiscount] = useState(0); // State for coupon discount
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    const parsed: CartItem[] = saved ? JSON.parse(saved) : [];
    setCartItems(parsed);

    // Retrieve customer data from localStorage (checkoutData)
    const checkoutData = localStorage.getItem('checkoutData');
    if (checkoutData) {
      const parsedData = JSON.parse(checkoutData);
      setCustomerName(parsedData.name);  // Set customer name from CheckoutPage form
      setCustomerEmail(parsedData.email); // Set customer email from CheckoutPage form
      setMobileNumber(parsedData.phone); // Set customer phone number from CheckoutPage form
    }
  }, []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Dynamically set delivery fee based on delivery method
  const deliveryFee = deliveryMethod === 'Priority' ? 60 : 45;

  const totalBeforeCoupon = subtotal + deliveryFee + tip;
  const total = totalBeforeCoupon - couponDiscount;  // Apply coupon discount to total

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deliveryMethod || !paymentMethod) {
      alert('Please select all required options.');
      return;
    }

    if (paymentMethod === 'Bkash' || paymentMethod === 'Nagad') {
      if (!/^(\+880)(\d{10})$/.test(mobileNumber)) {
        alert(`Please enter a valid ${paymentMethod} number starting with +880 followed by 10 digits.`);
        return;
      }
    }

    if (paymentMethod === 'Card/Debit Card') {
      const cardDigits = cardNumber.replace(/\s/g, '');
      if (!/^\d{16}$/.test(cardDigits)) {
        alert('Please enter a valid 16-digit card number.');
        return;
      }
    }

    // Collect order data to send to the backend API
    const orderData = {
      customerName,  // Use the customer name from localStorage
      customerEmail, // Use the customer email from CheckoutPage form
      customerPhone: mobileNumber,
      orderItems: cartItems,  // Ensure cartItems is populated
      deliveryMethod,
      paymentMethod,
      tip,
      subtotal,  // Sending correct subtotal from PaymentPage
      couponCode,  // Send the coupon code as well
      total,      // Send the total amount calculated in PaymentPage
    };

    try {
      // Send order data to Next.js API route (/api/orders)
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to confirm order");
      }

      // Redirect to order success page after successful order submission
      localStorage.removeItem('cart');  // Clear the cart after order
      router.push('/payment/success');  // Redirect to the success page

    } catch (error: any) {
      alert(`Error: ${error.message || "An unexpected error occurred"}`);
      console.error("Error confirming order:", error);
    }
  };

  // Function to format card number input
  const formatCardInput = (value: string) => {
    return value
      .replace(/\D/g, '')  // Remove all non-numeric characters
      .replace(/(.{4})/g, '$1 ')  // Add space after every 4 digits
      .trim()  // Remove trailing spaces
      .slice(0, 19);  // Limit input to 19 characters (16 digits + 3 spaces)
  };

  // Handle phone number input
  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.startsWith('880')) {
      input = '+' + input;
    } else {
      input = '+880' + input;
    }
    setMobileNumber(input.slice(0, 14));  // Ensure it doesn't exceed 14 digits
  };

  const backgroundImageUrl = "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1920&q=80";

  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center p-6"
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(0,0,0,0.3)',  // Slight dark overlay for text visibility
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
          Payment & Delivery
        </h2>

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
            <option value="Standard">Standard (30 – 40 min)</option>
            <option value="Priority">Priority (20 – 30 min)</option>
          </select>
        </div>

        {/* Payment Method */}
        <div className="mb-4">
          <label className="font-semibold block mb-2 text-black">
            Payment Methods
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setMobileNumber('+880');
              setCardNumber('');
            }}
            required
            className="w-full border-2 border-black p-2 rounded"
          >
            <option value="">-- Select --</option>
            <option value="Cash on Delivery">Cash on Delivery</option>
            <option value="Bkash">Bkash</option>
            <option value="Nagad">Nagad</option>
            <option value="Card/Debit Card">Card/Debit Card</option>
          </select>
        </div>

        {/* Phone Number Input for Bkash or Nagad */}
        {(paymentMethod === 'Bkash' || paymentMethod === 'Nagad') && (
          <div className="mb-4">
            <input
              type="text"
              value={mobileNumber}
              onChange={handleMobileNumberChange}
              placeholder={`Enter your ${paymentMethod} number (+880XXXXXXXXXX)`}
              className="w-full border-2 border-black p-2 rounded"
            />
            <small className="text-gray-500">
              {`Please enter your ${paymentMethod} Number`}
            </small>
          </div>
        )}

        {/* Card Number Input for Card/Debit Card */}
        {paymentMethod === 'Card/Debit Card' && (
          <div className="mb-4">
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
              placeholder="Enter your 16-digit card number"
              className="w-full border-2 border-black p-2 rounded"
            />
          </div>
        )}

        {/* Tip Your Rider */}
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
                className={`py-2 px-4 rounded ${tip === amt ? 'bg-green-700 text-white' : 'bg-green-500 text-white'} hover:bg-green-600`}
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

        {/* Coupon Code Section */}
        <div className="mb-4">
          <label className="font-semibold block mb-2 text-black">
            Apply Coupon
          </label>
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Enter your coupon code"
            className="w-full border-2 border-black p-2 rounded"
          />
          <button
            type="button"
            onClick={async () => {
              if (!couponCode || !customerEmail) {
                alert("Please enter a coupon code and make sure your email is available.");
                return;
              }
            
              try {
                const response = await fetch(`/api/vouchers/validate_voucher?code=${couponCode}&email=${customerEmail}`);
                const data = await response.json();
            
                if (!response.ok) {
                  setCouponDiscount(0);
                  alert(data.message || "Invalid or unauthorized coupon.");
                  return;
                }
            
                setCouponDiscount((subtotal * data.discountAmount) / 100);
                alert("Coupon applied successfully!");
              } catch (error) {
                console.error("Error validating coupon:", error);
                setCouponDiscount(0);
                alert("Failed to validate coupon. Please try again.");
              }
            }}
            
            className="mt-2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Apply Coupon
          </button>
        </div>

        <div className="mb-6 space-y-2 text-black text-center">
          <h3 className="font-bold text-xl">Order Summary</h3>
          <div className="w-full">
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
            <div className="flex justify-between">
              <span>Coupon Discount</span>
              <span>৳{couponDiscount.toFixed(2)}</span>
            </div>
            <hr className="border-t-2 border-black my-4" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>৳{total.toFixed(2)}</span>
            </div>
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
