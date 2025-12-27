import mongoose from 'mongoose';

// qui si definisce lo schema per la collezione faq del database
const FaqSchema = new mongoose.Schema({
    question: { type: String, required: true, maxlength: 200 },
    category: {
        type: String,
        enum: ["Trasporti", "Eventi", "Cultura", "Rifiuti", "Anagrafe", "Servizi comunali", "Storia", "Generale"],
        default: "Generale"
    }
});

// crea il modello, si usa per interagire con il DB
const FaqModel = mongoose.models.Faq || mongoose.model("Faq", FaqSchema);
export default FaqModel;


// crea il modello, si usa per interagire con il DB