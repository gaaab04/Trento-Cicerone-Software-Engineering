import UserModel from "../models/User.js";
import user from "../models/User.js";
import bcrypt, {hash} from "bcrypt";

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