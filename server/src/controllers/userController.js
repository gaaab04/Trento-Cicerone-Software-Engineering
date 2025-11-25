import UserModel from "../models/User.js";

// Funzione per recuperare il profilo dell'utente attualmente loggato tramite ID
export const getMe = async (req, res) => {
    // 1. Ottieni l'ID dell'utente che fa richiesta di vedere i propri dati dal corpo della richiesta
    const userId = req.userId;

    // Se l'ID non è stato trovato nell'oggetto richiesta
    if (!userId) {
        return res.status(401).json({ message: "Non autorizzato: ID utente non trovato nel token." });
    }

    try {
        // 2. Cerca l'utente nel database utilizzando l'ID di quell'utente
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Profilo utente non trovato nel database." });
        }

        // 3. Rimozione delle informazioni sensibili prima di inviare la risposta 
        const profile = {
            _id: user._id,
            email: user.email,
            role: user.role
        };

        // 4. Invia la risposta 200 OK con i dati del profilo
        return res.status(200).json(profile);

    } catch (error) {
        console.error("Errore nel recupero del profilo:", error);
        return res.status(500).json({ message: "Errore interno del server durante il recupero del profilo." });
    }
};