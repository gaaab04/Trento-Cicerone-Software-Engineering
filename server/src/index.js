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

app.set('trust proxy', 1);

// connessione a mongodb
connectDB(process.env.MONGO_URI);

// middleware generali
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://trento-cicerone-software-engineerin.vercel.app']
    : ['http://localhost:5173'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

app.options('*', cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));


serviceStatusManager.initialize();

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

// avvio del server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Il server sta andando sulla porta ${PORT}`));