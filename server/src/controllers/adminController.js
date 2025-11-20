import UserModel from '../models/User.js'

// funzione che permette a un admin di promuovere un utente a operatore
export const promoteUser = async (req, res) => {
    try {
        const id = req.params.id; // utente da promuovere
        const user = await UserModel.findById (id);
        if (!user) {
            return res.json({message: "Utente non trovato"});
        }

        // se l'utente è già un operatore o un admin non lo promuove
        if (user.role === "operator" || user.role === "admin") {
            return res.json({message: "Non è possibile promuovere un operatore o un admin"});
        }

        // altrimenti va tutto bene
        user.role = "operator";
        await user.save();
        return res.json({message: "Utente promosso a operatore"});
    } catch (error) {
        return res.json({message: "Errore del server", error: error.message});
    }
}

// funzione che permette a un admin di togliere il ruolo di operatore
export const demoteUser = async (req, res) => {
    try {
        const id = req.params.id; // prende id utente
        const user = await UserModel.findById(id);
        if (!user) {
            return res.json({message: "Utente non trovato"});
        }
        // caso in cui l'utente ha già il ruolo di user
        if (user.role === "user") {
            return res.json ({message: "Non è possibile togliere il ruolo di operatore da un utente normale"});
        }

        // aggiorna il ruolo dell'utente'
        user.role = "user";
        // salva l'utente aggiornato'
        await user.save();
        // restituisce json di successo
        return res.json({message: "Ruolo di operatore rimosso"});
    } catch (error) {
        return res.json({message: "Errore del server", error: error.message});
    }
}