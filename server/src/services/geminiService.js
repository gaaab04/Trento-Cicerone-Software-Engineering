import {GoogleGenerativeAI} from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config();

class GeminiService {
    constructor(){
        // prende la chiave dall'env
        this.apiKey = process.env.GEMINI_API_KEY;
        // se manca la chiave, lancia un errore
        if (!this.apiKey) {
            console.error("Manca la chiave API gemini");
            throw new Error("Manca la chiave API gemini");
        }
        // indica che il servizio è pronto
        this.available = true;

        // istanzia il generatore di risposte
        this.genAI = new GoogleGenerativeAI(this.apiKey);

        // modello di generazione della risposta, qui ho messo gemini 2.5 flash lite che è il più economico ma possiamo cambiarlo
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            generationConfig: {
                temperature: 0.6, // quantità di fantasia - precisione, TODO forse andrebbe alzato
                topP: 0.9, // limita la scelta ai token più probabili
                topK: 40, // determina quanti token vengono considerati
                maxOutputTokens: 1024, //lunghezza massima della risposta
            }
        });

        // genera 768 dimensioni, quindi ho settato atlas a numDimensions = 768 perché devono essere uguali
        this.embeddingModel = this.genAI.getGenerativeModel({
            model: 'text-embedding-004'
            //text-embedding-004
            // gemini-embedding-001
        });

        console.log("Gemini è pronto");
    }

    // funzione che genera la risposta al prompt
    async generateResponse(prompt) {
        try {
            const result = await  this.model.generateContent(prompt);
            const text = result.response.text();
            return text;
        } catch (error) {
            console.error("Errore nella generazione della risposta: ", error.message);
            throw new Error (`Errore di gemini: ${error.message}`);
        }
    }

    async createEmbedding(text) {
        try {
            // ci si assicura che il testo sia valido
            if (!text || typeof text !== 'string' || text.trim().length === 0) {
                throw new Error('Testo vuoto o non valido');
            }
            // qui tronco la lunghezza del testo a 10.000 caratteri perché penso sia il limite di gemini
            const trucatedText = text.slice(0, 10000);


            // qui si richiede l'embedding al modello
            const result = await this.embeddingModel.embedContent(trucatedText);
            const embedding = result.embedding.values;
            return embedding;
        } catch (error) {
            console.error("Errore nella creazione dell'embedding: ", error.message);
            throw new Error(`Errore di gemini: ${error.message}`);
        }
    }

    async generateContextualResponse(userQuery, relevantDocs, chatHistory = []) {
        // questa è la parte di costruzione del contesto dei documenti
        const context = relevantDocs
            .map((doc, index) => `
            Documento ${index+1}: ${doc._id}: 
            Titolo: ${doc.title}
            Categoria: ${doc.category}
            Contenuto: ${doc.content}`
            )
            .join("\n\n---\n\n");

        // storico conversazione (prende gli ultimi 5 messaggi
        const historyText = chatHistory.length > 0 ?
            chatHistory
                .slice(-5)
                .map(msg => `${msg.role} ${msg.content}`)
                .join('\n')
            : 'Prima interazione';
        // prompt principale
        const prompt =
            `Sei un assistente virtuale esperto sulla città di Trento, in Italia.
             
            COMPITO:
            1. Rispondi alla domanda dell'utente usando principalmente i documenti forniti.
            2. Se i documenti contengono la risposta esatta usala, oppure usala in parte se pensi sia sufficiente. 
            3. Se i documenti contengono informazioni parziali, combina le informazioni in modo intelligente
            4.  Se menzioni date approssimative (come ad esempio XIII secolo), spiega che è circa quel periodo
            5.  Rispondi in modo naturale, amichevole e informativo
            7. Se conosci la risposta, rispondi in modo chiaro, naturale, amichevole e informativo 
            8. Se non conosci la risposta, rispondi chiaramente che non hai informazioni disponibili su quell'argomento e suggerisci eventuali temi correlati su cui puoi aiutare.
            9. Non menzionare mai di leggere documenti o fonti esterne.
            10. Mantieni la risposta coerente e concisa, evitando di inventare dati.
            
            DOCUMENTI RILEVANTI: 
            ${context}
            
            STORICO CONVERSAZIONE: 
            ${historyText}
            
            DOMANDA ATTUALE: 
            ${userQuery}
            
            RISPOSTA: 
            Rispondi nella stessa lingua in cui l'utente ha scritto la domanda`;

        return await this.generateResponse(prompt);
    }
}

export default new GeminiService();
