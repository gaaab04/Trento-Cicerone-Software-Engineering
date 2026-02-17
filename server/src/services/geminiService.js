import {GoogleGenAI} from "@google/genai";
import dotenv from 'dotenv'
import {franc} from "franc";

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

        // istanzia il client per le api di google
        this.genAI = new GoogleGenAI({apiKey: this.apiKey});

        // modelli per generazione testo e embedding
        this.generativeModelName = "gemini-2.5-flash-lite";
        this.embeddingModelName = "gemini-embedding-001";

        console.log("Gemini è pronto");
    }

    // funzione che genera la risposta al prompt
    async generateResponse(prompt) {
        try {
            const response = await this.genAI.models.generateContent({
                model: this.generativeModelName,
                contents: prompt,
                config: {
                    temperature: 0.6,       // quantità di fantasia - precisione, TODO forse andrebbe alzato
                    topP: 0.9,              // limita la scelta ai token più probabili
                    topK: 40,               // determina quanti token vengono considerati
                    maxOutputTokens: 1024   //lunghezza massima della risposta
                }
            })
            return response.text;
        } catch (error) {
            console.error("Errore nella generazione della risposta: ", error.message);
            throw new Error (`Errore di gemini: ${error.message}`);
        }
    }

    // si occupa di creare embedding. RETRIEVAL_QUERY per le domande (l'ho messo di default) e RETRIEVAL_DOCUMENT per i documenti
    async createEmbedding(text, taskType = "RETRIEVAL_QUERY") {
        try {
            // ci si assicura che il testo sia valido
            if (!text || typeof text !== 'string' || text.trim().length === 0) {
                throw new Error('Testo vuoto o non valido');
            }
            // qui tronco la lunghezza del testo a 10.000 caratteri perché penso sia il limite di gemini
            const trucatedText = text.slice(0, 10000);

            // qui si richiede l'embedding al modello
            const response = await this.genAI.models.embedContent({
                model: this.embeddingModelName,
                contents: trucatedText,
                config: {
                    outputDimensionality: 768,    // dimensione vettore (ho messo 768 perché deve essere uguale al valore messo su mongo)
                    taskType: taskType
                }
            });

            const embedding = response.embeddings[0].values;
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

        // rileva la lingua dalla query dell'utente
        let language = franc(userQuery);
        switch (language) {
            case 'ita': language = "italian"; break;
            case 'eng': language = "english"; break;
            case 'und': language = "italian"; break;
            default: language = "italian";
        }
        console.log("lingua rilevata:", language);

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
            11. Rispondi in questa lingua: ${language}
            
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