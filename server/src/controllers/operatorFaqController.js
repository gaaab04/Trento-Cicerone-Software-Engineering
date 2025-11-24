import FaqModel from '../models/Faq.js';

// Funzione per OTTENERE TUTTE le faq
export const getFaqs = async (req, res) => {
    try {
        //faqs contiene tutti i risultati correlati al modello FaqModel
        const faqs = await FaqModel.find({});

        //messaggio HTTP 200 OK, ritorno del risultato in formato json
        return res.status(200).json(faqs);

    } catch (error) {
        return res.status(500).json({ message: "Errore durante il recupero delle FAQ." });
    }
};

// Funzione per AGGIUNGERE una nuova faq
export const createFaq = async (req, res) => {
    // Il corpo della richiesta (req.body) dovrebbe contenere { question: "...", category: "..." }
    const { question, category } = req.body;

    //creazione e validazione di un nuovo oggetto che segue il modello di FaqModel
    const newFaq = new FaqModel({ question, category });

    try {
        // Salva il nuovo documento nel database
        const savedFaq = await newFaq.save();

        return res.status(201).json(savedFaq);

    } catch (error) {
        return res.status(400).json({ message: "Impossibile creare la FAQ." });
    }
};

// Funzione per MODIFICARE una FAQ esistente (Update)
export const updateFaq = async (req, res) => {

    // L'ID del documento da modificare è preso dai parametri dell'URL (es. /faqs/123)
    const { id } = req.params;

    // I nuovi dati sono presi dal corpo della richiesta
    const updates = req.body;

    try {
        // Trova il documento per ID e lo aggiorna
        const updatedFaq = await FaqModel.findByIdAndUpdate(id, updates, {
            new: true, //serve per restituire il documento modificato e non la versione vecchia
            runValidators: true // Esegue le validazioni (maxlength, enum) anche sull'aggiornamento
        });

        if (!updatedFaq) {
            return res.status(404).json({ message: "FAQ non trovata" });
        }

        //risposta HTTP 200 OK con ritorno della faq in formato json appena aggiornata
        return res.status(200).json(updatedFaq);

    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: "Impossibile aggiornare la FAQ. Controlla i dati", error: error.message });
    }
};

// Funzione per ELIMINARE una FAQ (Delete)
export const deleteFaq = async (req, res) => {
    const { id } = req.params;

    try {
        // Trova il documento per ID e lo elimina
        const deletedFaq = await FaqModel.findByIdAndDelete(id);

        if (!deletedFaq) {
            return res.json({ message: "FAQ non trovata" });
        }

        // Risposta HTTP 200 OK con messaggio di successo
        return res.status(200).json({ message: "FAQ eliminata con successo", deletedId: id });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Errore durante l'eliminazione della FAQ", error: error.message });
    }
};