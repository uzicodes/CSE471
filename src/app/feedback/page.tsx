"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageSquare, Star, User } from "lucide-react";

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
  
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, comment, rating }),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit feedback.");
      }
  
      setSubmitted(true);
    } catch (err) {
      console.error("Feedback submission failed:", err);
      alert("Something went wrong! Please try again.");
    }
  };
  

  const renderStars = () => {
    return (
      <div className="flex justify-center gap-1 text-yellow-400 text-2xl">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`hover:scale-110 transition-transform ${
              rating >= star ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            <Star fill={rating >= star ? "#facc15" : "none"} strokeWidth={2} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8">
        <div className="flex items-center mb-6">
          <MessageSquare className="text-orange-600 w-7 h-7 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">We value your feedback</h2>
        </div>

        {submitted ? (
          <div className="text-center text-green-600">
            <CheckCircle className="w-10 h-10 mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Thank you!</h3>
            <p className="text-gray-600 mt-2">Your feedback has been received.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Section */}
            <div className="text-center">
              <p className="text-lg font-medium text-gray-800 mb-2">Rate our service</p>
              {renderStars()}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-orange-400" />
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="pl-10 placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Comment</label>
              <Textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like? What could be improved?"
                className="placeholder:text-gray-500"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700"
            >
              Submit Feedback
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
