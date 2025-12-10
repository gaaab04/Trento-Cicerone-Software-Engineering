import UserModel from "../models/User.js";
import user from "../models/User.js";
import bcrypt, {hash} from "bcrypt";
import Message from "../models/Message.js";

// Funzione per recuperare il profilo dell'utente attualmente loggato
export const getMe = async (req, res) => {
    // ottengo l'id dell'utente che fa richiesta di vedere i propri dati dal corpo della richiesta
    const userId = req.userId;

    // se l'ID non è stato trovato nell'oggetto richiesta
    if (!userId) {
        return res.status(401).json({ message: "Non autorizzato: ID utente non trovato nel token." });
    }

    try {
        // cerca l'utente nel database utilizzando l'ID di quell'utente
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Profilo utente non trovato nel database." });
        }

        const profile = {
            _id: user._id,
            email: user.email,
            role: user.role
        };

        // invia i dati del profilo
        return res.status(200).json(profile);

    } catch (error) {
        console.error("Errore nel recupero del profilo:", error);
        return res.status(500).json({ message: "Errore interno del server durante il recupero del profilo." });
    }
};


export const changePassword = async (req, res) => {
    try {
        // prende i dati dalla richiesta
        const {oldPassword, newPassword} = req.body;
        const userId = req.userId;

        // controllo che tutti i campi siano presenti
        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({message: "Tutti i campi sono obbligatori"});
        }
        // cerca l'utente nel database utilizzando l'ID
        const user = await UserModel.findById(userId);
        // controllo che l'utente esista
        if (!user) {
            return res.status(404).json({message: "Utente non trovato"});
        }
        // confronta la password vecchia con quella registrata nel database
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({message: "La password vecchia non coincide con quella registrata. Riprova."})
        }
        // password corretta, quindi cripta la nuova password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // aggiorna la password nel database
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({message: "Password modificata con successo"});
    } catch (error) {
        console.error("Errore durante la modifica della password:", error);
        return res.status(500).json({message: "Errore interno del server durante la modifica della password."});
    }
}

// funzione per bannare un utente tramite id
export const suspendUser = async (req, res) => {
    try {
        // prende userId dai parametri della chiamata
        const { userId } = req.params;

        // trova utente
        const user = await UserModel.findById(userId);

        // gestione del caso in cui l'utente non esiste
        if (!user) {
            return res.status(404).json({message: "Utente non trovato"});
        }

        // per evitare che un operatore sospenda un altro operatore o un admin
        if (user.role === "admin" || user.role === "operator") {
            return res.status(403).json({message:"Non puoi sospendere un admin o un operatore"})
        }

        // setta l'utente a suspendend nel database e ritorna messaggio di successo
        user.suspended = true;
        await user.save();
        return res.status(200).json({message: "Utente sospeso con successo",
        user: {
            _id: user._id,
            email: user.email,
            suspended: user.suspended
        }
        });
    } catch (error) {
        console.error("Errore durante il ban dell'utente:", error);
        return res.status(500).json({message: "Errore del server"})
    }
}

// funzione per bannare un utente tramite mail
export const suspendUserByEmail = async (req, res) => {
    try {
        // prende mail dal body della chiamata
        const { email } = req.body;

        // trova utente
        const user = await UserModel.findOne({email});

        // gestione del caso in cui l'utente non esiste
        if (!user) {
            return res.status(404).json({message: "Utente non trovato"});
        }

        // per evitare che un operatore sospenda un altro operatore o un admin
        if (user.role === "admin" || user.role === "operator") {
            return res.status(403).json({message:"Non puoi sospendere un admin o un operatore"})
        }

        // setta l'utente a suspendend nel database e ritorna messaggio di successo
        user.suspended = true;
        await user.save();
        return res.status(200).json({message: "Utente sospeso con successo",
            user: {
                _id: user._id,
                email: user.email,
                suspended: user.suspended
            }
        });
    } catch (error) {
        console.error("Errore durante il ban dell'utente:", error);
        return res.status(500).json({message: "Errore del server"})
    }
}

// funzione per sbannare un utente tramite id
export const unsuspendUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({message: "Utente non trovato"});
        }
        user.suspended = false;
        await user.save();

        return res.status(200).json({message: "Utente riattivato con successo",
        user: {
            _id: user._id,
            email: user.email,
            suspended: user.suspended
        }})
    } catch (error) {
        console.error("Errore durante il ban dell'utente:", error);
        return res.status(500).json({message: "Errore del server"})
    }
}

export const unsuspendUserByEmail = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await UserModel.findOne({email});

        if (!user) {
            return res.status(404).json({message: "Utente non trovato"});
        }
        user.suspended = false;
        await user.save();

        return res.status(200).json({message: "Utente riattivato con successo",
            user: {
                _id: user._id,
                email: user.email,
                suspended: user.suspended
            }})
    } catch (error) {
        console.error("Errore durante il ban dell'utente:", error);
        return res.status(500).json({message: "Errore del server"})
    }
}

export const getSuspendedUsers = async (req, res) => {
    try {
        const suspendedUsers = await UserModel.find({ suspended: true }).lean();

        return res.status(200).json({
            total: suspendedUsers.length,
            users: suspendedUsers
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Errore durante il recupero degli utenti sospesi", error: error.message});
    }
}

export const getSuspiciousUsers = async (req, res) => {
    try {
        const { maxMessages = 10, hours = 24} = req.query;

        const timeLimit = new Date(Date.now() - hours * 60 * 60 * 1000);

        const messages = await Message.find({
            role: 'user',
            userId: {$exists: true, $ne: null},
            createdAt: {$gte: timeLimit},
        }).lean();

        const userMessageCount = {};

        for (const message of messages) {
            const userId = message.userId.toString();

            if (!userMessageCount[userId]) {
                userMessageCount[userId] = 0;
            }
            userMessageCount[userId]++;
        }

        const suspiciousUserIds = []
        for (const userId in userMessageCount) {
            if (userMessageCount[userId] >= parseInt(maxMessages)) {
                suspiciousUserIds.push(userId);
            }
        }

        if (suspiciousUserIds.length === 0) {
            return res.status(200).json({
                total: 0,
                messages: parseInt(maxMessages),
                timeRange: `${hours} hour`,
                users: []
            })
        }

        const users = await UserModel.find({
            _id: { $in: suspiciousUserIds },
            suspended: false,
            role: 'user'
        }).lean();

        const suspiciousUsers = users.map(user => ({
            userId: user._id,
            email: user.email,
            messageCount: userMessageCount[user._id.toString()],
            suspended: user.suspended
        }));


        suspiciousUsers.sort((a, b) => b.messageCount - a.messageCount);

        return res.status(200).json({
            total: suspiciousUsers.length,
            maxMessages: parseInt(maxMessages),
            timeRange: `${hours} hour`,
            users: suspiciousUsers

        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Errore del server", error: error.message})
    }
}

export const getUserMessages = async (req, res) => {
    try {
        const { userId } = req.params;

        const { hours = 24, limit = 100} = req.query;

        const user = await UserModel.findById (userId);
        if (!user) {
            return res.status(404).json({message: "Utente non trovato"});
        }

        const timeLimit = new Date(Date.now() - hours * 60 * 60 * 1000);

        const messages = await Message.find({
            userId: userId,
            role: 'user',
            createdAt: {$gte: timeLimit},
        }).sort({createdAt: -1}).limit(limit).lean();

        return res.status(200).json({
            userId: user._id,
            email: user.email,
            suspended: user.suspended,
            totalMessages: messages.length,
            timeRange: `${hours} hours`,
            messages: messages,
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Errore del server", error: error.message})
    }
}