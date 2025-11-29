import mongoose from 'mongoose';

// qui si definisce lo schema per i commenti che il modello LLM andrà a leggere

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true // ho messo index per fare ricerche piu veloci
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['storia', 'turismo', 'cultura', 'eventi', 'trasporti', 'generale'],
        default: 'generale'
    },
    embedding: {
        type: [Number],
        required: false
    },
    metadata: {
        source: String,
        lastUpdate: Date
    }
}, { timestamps: true });

// creo indice per le ricerche testuali
documentSchema.index({ title: 'text', content: 'text' });
export default mongoose.model('Document', documentSchema);