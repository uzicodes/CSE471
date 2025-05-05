import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Voucher from '../schema';

export async function POST(request: Request) {
  try {
    await dbConnect(); // Connect to MongoDB

    const data = await request.json();
    const { code, description, discountAmount, isSpecial, allowedEmails } = data;

    if (!code || !description || !discountAmount) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const newVoucher = new Voucher({
      code,
      description,
      discountAmount,
      isSpecial,
      allowedEmails: isSpecial ? allowedEmails || [] : [],
    });

    await newVoucher.save();

    return NextResponse.json({ message: "Voucher created successfully", voucher: newVoucher }, { status: 201 });
  } catch (error) {
    console.error("Voucher creation failed:", error);
    return NextResponse.json({ message: "Server error while creating voucher." }, { status: 500 });
  }
}
