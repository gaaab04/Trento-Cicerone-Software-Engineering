import express from 'express';
import connectDB from './db.js'; // Importing the connectDB function
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from "./routes/adminRoutes.js";
import faqRoutes from './routes/faqRoutes.js';
import chatRoutes from "./routes/chatRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";

const app = express();

// connessione a mongodb
connectDB();

// middleware generali
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));


// rotte auth
app.use('/api', authRoutes)

// rotte per i ruoli
app.use('/api/access', roleRoutes)

//rotte per gli admin
app.use('/api/access/admin', adminRoutes)

//rotte per le faq
app.use('/api/faqs', faqRoutes);

//rotte per dati e azioni sul profilo utente
app.use('/api/users', userRoutes);

//rotte per la chat
app.use('/api/chat', chatRoutes);

//rotte per i documenti
app.use('/api/documents', documentRoutes);

// rotta base per verificare che tutto funzioni
app.get('/', (req, res) => {
    res.send('API funzionano...');
});

// avvio del server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Il server sta andando sulla porta ${PORT}`));