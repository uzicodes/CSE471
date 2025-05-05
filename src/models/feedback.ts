import mongoose, { Schema, model, models } from "mongoose";

const FeedbackSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent model overwrite on hot reload
const Feedback = models.Feedback || model("Feedback", FeedbackSchema);
export default Feedback;
