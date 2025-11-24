import express from 'express';
import connectDB from './db.js'; // Importing the connectDB function
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import adminRoutes from "./routes/adminRoutes.js";
import faqRoutes from './routes/faqRoutes.js';

const app = express();

// connessione a MongoDB
connectDB();

// Middleware generali
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));


// Rotte auth
app.use('/api', authRoutes)

// Rotte per i ruoli
app.use('/api/access', roleRoutes)

//Rotte per gli admin
app.use('/api/access/admin', adminRoutes)

//rotte per le faq
app.use('/api/faqs', faqRoutes);

// Rotta base per verificare che tutto funzioni
app.get('/', (req, res) => {
    res.send('API funzionano...');
});

// Avvio del server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Il server sta andando sulla porta ${PORT}`));