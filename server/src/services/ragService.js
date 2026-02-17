import Document from "../models/Document.js";
import geminiService from "./geminiService.js";


class RAGService {
    // questa funzione trova i documenti rilevanti per la query
    async retrieveRelevantDocuments(query, limit = 5, category = null) {
        try {
            // creo l'embedding con gemini
            const queryEmbedding = await geminiService.createEmbedding(query, "RETRIEVAL_QUERY");

            // costruzione della ricerca vettoriale
            const vectorStage = {
                $vectorSearch: {
                    index: "vector_index",
                    path: "embedding",
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: limit * 2,
                }
            };

            // se richiesto un filtro per la categoria lo aggiungo
            if (category) {
                vectorStage.$vectorSearch.filter = { category: category };
            }

            // boost per documenti più aggiornati (ultimo anno)
            const recencyStage = {
                $addFields: {
                    vectorScore: { $meta: "vectorSearchScore" },
                    recencyBoost: {
                        $cond: {
                            if: {
                                $gte: [
                                    "$metadata.lastUpdated",
                                    new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
                                ]
                            },
                            then: 1.2,   // documento recente più importante
                            else: 1.0
                        }
                    }
                }
            };

            // calcolo score finale
            const computeScoreStage = {
                $addFields: {
                    score: { $multiply: ["$vectorScore", "$recencyBoost"] }
                }
            };

            // ordino per score e limito a 5
            const sortAndLimitStages = [
                { $sort: { score: -1 } },
                { $limit: limit }
            ];

            // serve a selezionare solo i campi che utili dai documenti ritornati dal db
            const projectionStage = {
                $project: {
                    title: 1,
                    content: 1,
                    category: 1,
                    metadata: 1,
                    score: 1,
                    _id: 1
                }
            };

            // pipeline finale
            const pipeline = [
                vectorStage,
                recencyStage,
                computeScoreStage,
                ...sortAndLimitStages,
                projectionStage
            ];

            // esegue la query su mongodb
            const documents = await Document.aggregate(pipeline);
            return documents;

        } catch (error) {
            console.error("Errore nella ricerca vettoriale:", error);
            console.warn("Eseguo ricerca di fallback...");
            return this.fallbackSearch(query, limit);
        }
    }

    // funzione di ricerca stupida che viene usata se quella sopra fallisce
    async fallbackSearch(query, limit = 5) {
        try {
            const keywords = query.toLowerCase().split(/\s+/);

            const documents = await Document.find({
                $or: [
                    { title: { $regex: keywords.join("|"), $options: "i" } },
                    { content: { $regex: keywords.join("|"), $options: "i" } }
                ]
            })
                .limit(limit)
                .select("title content category metadata");

            // aggiunge score fittizio per continuità
            return documents.map(doc => ({
                ...doc.toObject(),
                score: 0.5
            }));

        } catch (error) {
            console.error("Errore nel fallback:", error);
            return [];
        }
    }

    // funzione principale, recupera i documenti, li passa a gemini e ottiene risposta
    async processQuery(userQuery, chatHistory = []) {
        console.log("Query:", userQuery);

        const relevantDocs = await this.retrieveRelevantDocuments(userQuery, 5);

        if (relevantDocs.length === 0) {
            return {
                response:
                    "Mi dispiace, non ho trovato informazioni su questo argomento. " +
                    "Posso aiutarti con storia, turismo, cultura, eventi e trasporti di Trento.",
                sources: [],
                mainSource: null,
                searchMethod: "hybrid"
            };
        }

        // serve più che altro per gestire se nel frontend restituisce il link oppure no
        const highQualityDocs = relevantDocs.filter(d => d.score >= 0.8);

        // chiede la risposta a gemini
        const aiResponse = await geminiService.generateContextualResponse(
            userQuery,
            relevantDocs,
            chatHistory
        );

        return {
            response: aiResponse,
            sources: relevantDocs.map(doc => ({
                id: doc._id,
                title: doc.title,
                relevance: Number(doc.score.toFixed(4)),
                category: doc.category,
                source: doc.metadata?.source
            })),
            mainSource: highQualityDocs[0]?.metadata?.source || null,
            searchMethod: "hybrid"
        };
    }
}

export default new RAGService();
