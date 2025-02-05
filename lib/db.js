import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

let isConnected = false;

export const connectToDatabase = async () => {
    if (isConnected) return;

    try {
        const db = await mongoose.connect(MONGO_URI, {
            connectTimeoutMS: 10000,  
            socketTimeoutMS: 45000,
        });

        isConnected = db.connection.readyState === 1;
        console.log("Connected to MongoDB");

    } catch (error) {
        console.log("MongoDB Connection failed:", error.message);
    }
};
