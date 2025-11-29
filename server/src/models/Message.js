import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    retrievedDocs: [{
        documentId: mongoose.Schema.Types.ObjectId,
        relevanceScore: Number
    }],
    feedback: {
        type: String,
        enum: ['positive', 'negative', null],
        default: null
    },
    comment: {
        type: String,
        default: ''
    }
}, { timestamps: true});

export default mongoose.model('Message', messageSchema);