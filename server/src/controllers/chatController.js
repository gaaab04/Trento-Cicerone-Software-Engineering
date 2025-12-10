import Message from '../models/Message.js';
import ragService from '../services/ragService.js';

// funzione per invio messaggio
export async function sendMessage(req, res) {
    try {
        const userId = req.userId;
        const { sessionId, message, useHybrid = false } = req.body;

        if (!sessionId || !message) {
            return res.status(400).json({ error: 'message e sessionId sono obbligatori' });
        }

        // recupera gli ultimi messaggi della chat
        const chatHistory = await Message.find({ sessionId })
            .sort({ createdAt: 1 })
            .limit(50)
            .lean();

        // esegue la pipeline rag
        const result = await ragService.processQuery(message, chatHistory, useHybrid);

        // salva il messaggio dell'utente nel db
        await Message.create({
            sessionId,
            role: 'user',
            userId,
            content: message
        });

        // variabile per salvare i documenti recuperati dal rag
        const retrievedDocs = (result.sources || []).map(s => ({
            documentId: s.id,
            relevanceScore: s.relevance || s.relevanceScore || 0
        }));

        // salva anche il messaggio del bot nel db
        const botMessage = await Message.create({
            sessionId,
            role: 'assistant',
            userId,
            content: result.response,
            mainSource: result.mainSource,
            retrievedDocs
        });

        // restituisce il risultato
        return res.json({
            messageId: botMessage._id,
            response: result.response,
            mainSource: result.mainSource,
            sources: result.sources || [],
            searchMethod: result.searchMethod || 'vector'
        });

    } catch (error) {
        console.error('Errore durante invio messaggio:', error);
        return res.status(500).json({ error: error.message });
    }
}

// funzione per recuperare la cronologia della chat di una sessione
export async function getChatHistory(req, res) {
    try {
        // prima recupera la sessione dai parametri della richiesta
        const { sessionId } = req.params;
        // se non esiste restituisce errore
        if (!sessionId) {
            return res.status(400).json({ error: 'sessioId è obbligatorio' });
        }
        // sennò recupera tutti i messaggi della sessione ordinati per data di creazione
        const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });
        return res.json(messages);

    } catch (error) {
        console.error('errore durante il recupero dello storico chat:', error);
        return res.status(500).json({ error: error.message });
    }
}

// funzione ch aggiunge feedback al messaggio
export async function addFeedback(req, res) {
    try {
        // recupera il messaggio da aggiornare e il tipo di feedback e il commento dai parametri della richiesta
        const { messageId } = req.params;
        const { feedback, comment } = req.body;

        // se non è positive o negative restituisce errore
        if (!['positive', 'negative'].includes(feedback)) {
            return res.status(400).json({ error: 'tipo di feedback non valido. deve essere positive o negative' });
        }

        // aggiorna il messaggio nel db
        const message = await Message.findByIdAndUpdate(
            messageId,
            { feedback, comment },
            { new: true }
        );

        // gestione errore nel caso in cui il messaggio non esista
        if (!message) {
            return res.status(404).json({ error: 'messaggio non trovato ' });
        }

        // restituisce il messaggio
        return res.json(message);

    } catch (error) {
        console.error('errore durante feedback:', error);
        return res.status(500).json({ error: error.message });
    }
}

// funzione per creare un codice sessione
export async function createSession(req, res) {
    try {
        // genera un id unico per la sessione, in questo caso viene usato il timestamp corrente ma se volessimo potremmo usare un id generato dal server, però bisognerebbe creare un altro modello solo per il counter
        const sessionId = `session-${Date.now()}`;
        return res.json({ sessionId });
    } catch (error) {
        console.error('errore durante la creazione della sessione:', error);
        return res.status(500).json({message:"Errore del server",  error: error.message });
    }
}

