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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
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

messageSchema.index({userId: 1, createdAt: -1})

export default mongoose.model('Message', messageSchema);