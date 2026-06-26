import mongoose from "mongoose";

export async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not set in environment variables");
    }

    await mongoose.connect(uri);
    console.log(`[db] connected -> ${mongoose.connection.name}`);

    mongoose.connection.on("error", (err) => {
      console.error("[db] connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[db] disconnected");
    });
  } catch (err) {
    console.error("[db] failed to connect:", err.message);
    process.exit(1);
  }
}
