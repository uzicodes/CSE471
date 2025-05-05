import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Voucher from './schema';

export async function GET() {
  try {
    await dbConnect(); // Ensure DB connection
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    return NextResponse.json(vouchers);
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return NextResponse.json({ message: "Server error while fetching vouchers." }, { status: 500 });
  }
}
