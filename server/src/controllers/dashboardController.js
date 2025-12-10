import Message from "../models/Message.js";

// funzione per ricevere le statistiche del numero di feedback delle ultime 24 ore
export async function getLastFeedbacksNumber (req, res) {
    try {
        //calcolo della data di 24 ore fa
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

        //prende tutti i messaggi con feedback e crea un array
        const messages = await Message.find({
            createdAt: { $gte: since },
            feedback: { $ne: null } // esclude i messaggi senza feedback
        })

        // contatori
        let positive = 0;
        let negative = 0;

        for (const msg of messages) {
            if (msg.feedback === 'positive') positive++;
            else if (msg.feedback === 'negative') negative++;
        }

        const total = positive + negative;

        return res.status(200).json({ positive, negative, total });
    } catch (error) {
        return res.status(500).json({message:"Errore del server",  error: error.message });
    }
}

// funzione per prendere gli ultim "X" messaggi inviati al chatbot
export async function getLastQuestions (req, res) {
    try {
        // prende i primi 4 messaggi di default oppure quelli specificati nei parametri della richiesta
        const limit = parseInt(req.query.limit) || 4; //parseInt perché sennò uno può scrivere anche una stringa

        // prende il numero limite di messaggi con ruolo utente ordinati per data di creazione
        const questions = await Message.find({role: 'user'}).sort({createdAt: -1}).limit(limit);
        return res.status(200).json(questions);
    } catch (error) {
        return res.status(500).json({message:"Errore del server",  error: error.message });
    }
}

// funzione per recuperare tutti i feedback
export async function getFeedbacks (req, res) {
    try {

        //prende tutti i messaggi con feedback e crea un array
        const messages = await Message.find({
            feedback: { $ne: null } // esclude i messaggi senza feedback
        }).sort({createdAt: -1});

        return res.status(200).json(messages);

    } catch (error) {
        return res.status(500).json({message:"Errore del server",  error: error.message });
    }
}