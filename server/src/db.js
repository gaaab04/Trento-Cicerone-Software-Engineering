import mongoose from 'mongoose';
import dotenv from 'dotenv';

// script per la connessione al database


const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri);
        console.log('MongoDB connesso');
    } catch (err) {
        console.error('MongoDB errore nella connessione:', err.message);
        process.exit(1); // termina
    }
};

export default connectDB;
