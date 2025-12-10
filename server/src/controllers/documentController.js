import geminiService from "../services/geminiService.js";
import Document from "../models/Document.js";

// funzione per aggiungere un documento json
export async function addDocument(req, res) {
    try {
        const  {title, content, category, source} = req.body;
        // se titolo o cotenuto non sono presenti nella richiesta, restituisco un errore
        if (!title) {
            return res.status(400).json({message: "Titolo del documento obbligatorio"});
        }

        if (!content) {
            return res.status(400).json({message: "Contenuto del documento obbligatorio"});
        }
        // faccio l'embedding del documento
        const fullText = `${title}\n\n${content}`;
        const embedding = await geminiService.createEmbedding(fullText);

        // l'embedding deve avere 768 dimensioni per essere valido su mongo
        if (!embedding || embedding.length !== 768) {
            return res.status(400).json({message: "Embedding non valido. Le dimensioni sono errate"});
        }

        const savedDoc = await Document.create ({
            title,
            content,
            category,
            source: source || "N/A",
            embedding,
            metadata: {
                source,
                lastUpdated: new Date(),
                wordCount: content.split(' ').length,
                embeddingModel: "text-embedding-004"
            }
        });

        return res.status(201).json(savedDoc);

    } catch (error) {
        return res.status(500).json({message: "Errore nel server", error: error.message});
    }
}

// funzione per aggiornare un documento json
export async function updateDocument (req, res) {
    try {
        const id = req.params.id;
        const {title, content, category, source} = req.body;

        // trova il documento da aggiornare
        const document = await Document.findById(id);
        if (!document) {
            return res.status(404).json({message: "Documento non trovato"});
        }

        // se titolo o contenuto sono presenti nella richiesta, verifico se sono stati modificati, se si poi riaggiorno l'embedding
        const titleChanged = title && title !== document.title;
        const contentChanged = content && content !== document.content;

        // aggiorno i campi se sono presenti nella richiesta
        if (title) document.title = title;
        if (content) document.content = content;
        if (category) document.category = category;
        if (source) document.source = source;

        // se cambia il titolo o il contenuto, aggiorno l'embedding. altrimenti se cambiano solo la categoria o la fonte non serve
        let toEmbed = false;
        if (titleChanged || contentChanged) {
            toEmbed = true;
        }

        // rifa l'embedding
        if (toEmbed === true) {
            const fullText = `${document.title}\n\n${document.content}`;
            const embedding = await geminiService.createEmbedding(fullText);

            if (!embedding || embedding.length !== 768) {
            return res.status(400).json({message: "Embedding non valido. Le dimensioni sono errate"});
          }

            document.embedding = embedding;

            document.metadata = {
                ...document.metadata,
                lastUpdated: new Date(),
                wordCount: content.split(' ').length,
            }
        }

        // salva e restituisce il documento aggiornato
        const updatedDoc = await document.save();
        return res.status(200).json(updatedDoc);
    } catch (error) {
        return res.status(500).json({message: "Errore nel server", error: error.message});
    }
}

// funzione per eliminare un documento json
export async function deleteDocument(req, res) {
    try {
        const documentId = req.params.id;
        if (!documentId) {
            return res.status(400).json({message: "ID del documento obbligatorio"});
        }
        const deletedDoc = await Document.findByIdAndDelete(documentId);
        if (!deletedDoc) {
            return res.status(404).json({message: "Documento non trovato"});
        }

        return res.status(200).json({message:"documento eliminato con successo", deletedDoc});
    } catch (error) {
        return res.status(500).json({message: "Errore nel server", error: error.message});
    }
}

// funzione per recuperare tutti i documenti json presenti nel db
export async function getDocuments (req, res) {
    try {
        const documents = await Document.find({}, {embedding: 0}).sort({updatedAt: -1});
        return res.status(200).json(documents);
    }   catch (error) {
        return res.status(500).json({message: "Errore nel server", error: error.message});
    }


}

// funzione che restituisce tutte le categorie
export const getCategories = async (req, res) => {
    try {
        const categories = await Document.schema.path("category").enumValues;
        return res.status(200).json(categories);
    } catch (error) {
        return res.status(500).json({ message: "Errore durante il recupero delle categorie." });
    }
}