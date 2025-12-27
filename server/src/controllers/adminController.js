import UserModel from '../models/User.js'

// funzione che permette a un admin di promuovere un utente a operatore
export const promoteUser = async (req, res) => {
    try {
        const {email} = req.body; // utente da promuovere
        const user = await UserModel.findOne ({email});
        if (!user) {
            return res.status(404).json({message: "Utente non trovato"});
        }

        // se l'utente è già un operatore o un admin non lo promuove
        if (user.role === "operator" || user.role === "admin") {
            return res.status(400).json({message: "Non è possibile promuovere un operatore o un admin"});
        }

        // altrimenti va tutto bene
        user.role = "operator";
        await user.save();
        return res.status(200).json({message: "Utente promosso a operatore"});
    } catch (error) {
        return res.status(500).json({message: "Errore del server", error: error.message});
    }
}

// funzione che permette a un admin di togliere il ruolo di operatore
export const demoteUser = async (req, res) => {
    try {
        const {email} = req.body;  // prende email utente dal body
        const user = await UserModel.findOne({email});
        if (!user) {
            return res.status(404).json({message: "Utente non trovato"});
        }
        // caso in cui l'utente ha già il ruolo di user
        if (user.role === "user") {
            return res.status(401).json({message: "Non è possibile togliere il ruolo di operatore da un utente normale"});
        }

        if (user.role === "admin") {
            return res.status(401).json({message: "Non è possibile togliere il ruolo di operatore ad un admin"});
        }

        // aggiorna il ruolo dell'utente
        user.role = "user";
        // salva l'utente aggiornat
        await user.save();
        // restituisce json di successo
        return res.status(200).json({message: "Ruolo di operatore rimosso"});
    } catch (error) {
        return res.status(500).json({message: "Errore del server", error: error.message});
    }
}

// funzione che restituisce la lista di tutti gli operatori e gli admin che sono attualmente attivi
export const getActiveOperatorsAndAdmins = async (req, res) => {
    try {
        const activeOperators = await UserModel.find({role: {$in: ["operator", "admin"]}}).lean();
        return res.status(200).json({activeOperators});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Errore del server nel recupero degli operatori", error: error.message});
    }
}

