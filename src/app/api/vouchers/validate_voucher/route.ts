import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Voucher from '../schema';

export async function GET(req: Request) {
  try {
    await dbConnect(); // Ensure DB is connected

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const email = searchParams.get('email');

    if (!code || !email) {
      return NextResponse.json({ message: "Missing voucher code or user email" }, { status: 400 });
    }

    const voucher = await Voucher.findOne({ code });

    if (!voucher) {
      return NextResponse.json({ message: "Invalid voucher code" }, { status: 404 });
    }

    if (voucher.isSpecial && !voucher.allowedEmails.includes(email)) {
      return NextResponse.json({ message: "Not authorized to use this special voucher" }, { status: 403 });
    }

    return NextResponse.json({
      code: voucher.code,
      discountAmount: voucher.discountAmount,
      description: voucher.description,
    });
  } catch (error) {
    console.error("Voucher validation failed:", error);
    return NextResponse.json({ message: "Server error while validating voucher." }, { status: 500 });
  }
}
