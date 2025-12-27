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
        // Salva nel database
        const savedFaq = await newFaq.save();
        return res.status(201).json(savedFaq);

    } catch (error) {
        console.error(error);

        // Controlla se l'errore è un errore di validazione di Mongoose
        if (error.name === 'ValidationError') {

            if (newFaq.question.length > 200) {
                return res.status(401).json({
                    message: "Impossibile creare la FAQ. Superato limite 200 caratteri della domanda.",
                    details: error.message
                });
            }

            // Se è un ValidationError, lo stato 400 indica un errore di input del client
            return res.status(400).json({
                message: "Impossibile creare la FAQ. Verifica che il campo category sia valido.",
                details: error.message
            });
        }

        // Gestione degli altri errori
        return res.status(500).json({ message: "Errore interno del server durante la creazione della FAQ." });
    }
};

// Funzione per modificare una FAQ esistente (Update)
export const updateFaq = async (req, res) => {

    // L'ID del documento da modificare è preso dai parametri dell'URL (es. /faqs/123)
    const { id } = req.params;

    // I nuovi dati sono presi dal corpo della richiesta
    const updates = req.body;

    if (updates.question && updates.question.length > 200) {
        return res.status(401).json({ message: "La domanda è troppo lunga. La lunghezza massima consentita è 200 caratteri." });
    }

    try {
        // Trova il documento per ID e lo aggiorna
        const updatedFaq = await FaqModel.findByIdAndUpdate(id, updates, {
            new: true, //serve per restituire il documento modificato e non la versione vecchia
            runValidators: true // Esegue le validazioni (maxlength, enum) anche sull'aggiornamento
        });

        if (!updatedFaq) {
            return res.status(404).json({ message: "FAQ non trovata" });
        }

        //risposta con ritorno della faq
        return res.status(200).json(updatedFaq);

    } catch (error) {
        console.error(error);

        // Controlla se l'errore è un errore di validazione di Mongoose
        if (error.name === 'ValidationError') {
            // Se è un ValidationError (dovuto a enum, required, maxlength)
            return res.status(400).json({
                message: "Dati non validi. Verifica che la categoria sia corretta.",
                details: error.message // Include il messaggio di Mongoose per i dettagli
            });
        }

        // Per tutti gli altri tipi di errore
        return res.status(500).json({
            message: "Errore interno del server durante l'aggiornamento della FAQ."
        });
    }
};

// Funzione per ELIMINARE una FAQ (Delete)
export const deleteFaq = async (req, res) => {
    const { id } = req.params;

    try {
        // Trova il documento per ID e lo elimina
        const deletedFaq = await FaqModel.findByIdAndDelete(id);

        if (!deletedFaq) {
            return res.status(404).json({ message: "FAQ non trovata" });
        }

        // Risposta HTTP 200 OK con messaggio di successo
        return res.status(200).json({ message: "FAQ eliminata con successo", deletedId: id });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Errore durante l'eliminazione della FAQ", error: error.message });
    }
};

// funzione che restituisce tutte le categorie ammesse dal modello faq
export const getCategories = async (req, res) => {
    try {
        const categories = await FaqModel.schema.path("category").enumValues;
        return res.status(200).json(categories);
    } catch (error) {
        return res.status(500).json({ message: "Errore durante il recupero delle categorie." });
    }
}