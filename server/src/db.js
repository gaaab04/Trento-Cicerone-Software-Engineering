import mongoose from 'mongoose';
import dotenv from 'dotenv';

// script per la connessione al database

dotenv.config(); // carica le variabili  dal file .env

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connesso');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // termina
    }
};

export default connectDB;
