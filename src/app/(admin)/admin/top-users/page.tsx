"use client";

import { useState, useEffect } from "react";

interface TopUser {
  _id: string; // email of the user
  orderCount: number;
}

export default function TopUsersPage() {
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inputs for vouchers
  const [normalVoucher, setNormalVoucher] = useState({
    code: '',
    description: '',
    discountAmount: 0
  });

  const [specialVoucher, setSpecialVoucher] = useState({
    code: '',
    description: '',
    discountAmount: 0
  });

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const response = await fetch("/api/top-users");
        if (!response.ok) throw new Error("Failed to fetch top users");
        const data = await response.json();
        setTopUsers(data);
      } catch (error) {
        setError("Error fetching top users");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, []);

  const createVoucher = async (voucherData: any) => {
    try {
      const response = await fetch("/api/vouchers/vouchers_create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(voucherData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      alert("Voucher created successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to create voucher");
    }
  };

  const handleNormalVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createVoucher({
      ...normalVoucher,
      isSpecial: false,
    });
  };

  const handleSpecialVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allowedEmails = topUsers.slice(0, 3).map((user) => user._id);
    createVoucher({
      ...specialVoucher,
      isSpecial: true,
      allowedEmails
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Top 3 Users</h1>

      <div className="mb-10">
        {topUsers.length === 0 ? (
          <p>No top users found.</p>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6">
            <ul>
              {topUsers.map((user, index) => (
                <li
                  key={user._id}
                  className="p-4 mb-4 rounded-lg border bg-gray-50 flex justify-between items-center"
                >
                  <span>{index + 1}. {user._id}</span>
                  <span>Orders: {user.orderCount}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Normal Voucher Form */}
      <div className="bg-green-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-bold mb-4">Create Normal Voucher</h2>
        <form onSubmit={handleNormalVoucherSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Code"
            value={normalVoucher.code}
            onChange={(e) => setNormalVoucher({ ...normalVoucher, code: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Description"
            value={normalVoucher.description}
            onChange={(e) => setNormalVoucher({ ...normalVoucher, description: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Discount Amount"
            value={normalVoucher.discountAmount}
            onChange={(e) => setNormalVoucher({ ...normalVoucher, discountAmount: parseInt(e.target.value) })}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create Normal Voucher
          </button>
        </form>
      </div>

      {/* Special Voucher Form */}
      <div className="bg-blue-100 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Create Special Voucher for Top 3 Users</h2>
        <form onSubmit={handleSpecialVoucherSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Code"
            value={specialVoucher.code}
            onChange={(e) => setSpecialVoucher({ ...specialVoucher, code: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Description"
            value={specialVoucher.description}
            onChange={(e) => setSpecialVoucher({ ...specialVoucher, description: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Discount Amount"
            value={specialVoucher.discountAmount}
            onChange={(e) => setSpecialVoucher({ ...specialVoucher, discountAmount: parseInt(e.target.value) })}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Special Voucher
          </button>
        </form>
      </div>
    </div>
  );
}
