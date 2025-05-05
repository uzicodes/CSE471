// /app/api/top-users/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI as string);

export async function GET() {
  try {
    await client.connect();
    const db = client.db('biterush');
    
    // Aggregate orders by customerEmail to count orders
    const topUsers = await db.collection('orders').aggregate([
      {
        $group: {
          _id: "$customerEmail", // Group by customer email
          orderCount: { $sum: 1 } // Count number of orders per user
        }
      },
      {
        $sort: { orderCount: -1 } // Sort users by the number of orders in descending order
      },
      { $limit: 3 } // Get top 3 users
    ]).toArray();
    
    return NextResponse.json(topUsers, { status: 200 });
  } catch (error) {
    console.error("Error fetching top users:", error);
    return NextResponse.json({ message: "Failed to fetch top users" }, { status: 500 });
  } finally {
    await client.close();
  }
}
