import mongoose from 'mongoose';

// qui si definisce lo schema per i commenti che il modello LLM andrà a leggere

const ServiceStatus = new mongoose.Schema({
    enabled: {type: Boolean, required: true},
    maintenanceMessage: {type: String, default: "Servizio attualmente in manutenzione."}
});

// crea il modello, si usa per interagire con il DB
const ServiceModel = mongoose.model("Service", ServiceStatus);
export default ServiceModel;