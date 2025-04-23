// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Order from '@/models/Order';
import Product from '@/models/Product';
import connectDB from '@/lib/dbConnect';
import { authOptions } from '../auth/[...nextauth]/option';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { 
      orderItems, 
      shippingAddress, 
      paymentMethod, 
      deliveryMethod, 
      itemsPrice, 
      shippingPrice, 
      tipAmount, 
      totalPrice 
    } = data;

    // Validate required fields
    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { message: 'No order items' },
        { status: 400 }
      );
    }

    // Verify products and prices
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json(
          { message: `Product not found: ${item.product}` },
          { status: 400 }
        );
      }
      
      // Verify price (optional security check)
      if (product.price !== item.price) {
        return NextResponse.json(
          { message: `Price mismatch for ${product.name}` },
          { status: 400 }
        );
      }
      
      // Check if product is in stock
      if (!product.inStock) {
        return NextResponse.json(
          { message: `${product.name} is out of stock` },
          { status: 400 }
        );
      }
    }

    // Create new order
    const order = await Order.create({
      user: session.user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      deliveryMethod,
      itemsPrice,
      taxPrice: 0, // Assuming tax is included or not applicable
      shippingPrice,
      tipAmount,
      totalPrice,
      isPaid: paymentMethod !== 'Cash on Delivery', // Mark as paid if not COD
      paidAt: paymentMethod !== 'Cash on Delivery' ? new Date() : undefined,
      status: 'pending'
    });

    return NextResponse.json({ 
      success: true, 
      order 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { message: error.message || 'Error creating order' },
      { status: 500 }
    );
  }
}

