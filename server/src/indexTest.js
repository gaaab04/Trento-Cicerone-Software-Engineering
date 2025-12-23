import express from 'express';
import connectDB from './db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from "./routes/adminRoutes.js";
import faqRoutes from './routes/faqRoutes.js';
import chatRoutes from "./routes/chatRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import ragServiceRoutes from './routes/serviceManagementRoutes.js';
import serviceStatusManager from './services/serviceStatusManager.js';


const app = express();

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
app.use('/api/admin', adminRoutes)

//rotte per le faq
app.use('/api/faqs', faqRoutes);

//rotte per dati e azioni sul profilo utente
app.use('/api/users', userRoutes);

//rotte per la chat
app.use('/api/chat', chatRoutes);

//rotte per i documenti
app.use('/api/documents', documentRoutes);

//rotte per la dashboard
app.use('/api/dashboard', dashboardRoutes);

//rotte per lo stato del servizio
app.use('/api/services', ragServiceRoutes);

// rotta base per verificare che tutto funzioni
app.get('/', (req, res) => {
    res.send('API funzionano...');
});

export default app;