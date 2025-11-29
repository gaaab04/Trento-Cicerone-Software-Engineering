import mongoose from 'mongoose';

// qui si definisce lo schema per la collezione faq del database
const FaqSchema = new mongoose.Schema({
    question: { type: String, required: true, maxlength: 200 },
    category: {
        type: String,
        enum: ["Trasporti", "Eventi", "Cultura", "Rifiuti", "Anagrafe", "Servizi comunali", "Generale"],
        default: "Generale"
    }
});

// crea il modello, si usa per interagire con il DB
const FaqModel = mongoose.model("Faq", FaqSchema);
export default FaqModel;