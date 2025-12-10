import mongoose from 'mongoose';

// Definizione dello schema per il documento che serve a gestire lo stato di attività del servizio

const ServiceStatus = new mongoose.Schema({
    enabled: { type: Boolean, required: true },
    maintenanceMessage: { type: String }// se il servizio è attivo è null, altrimenti contiene un messaggio informativo
});

// crea il modello, si usa per interagire con il DB
const ServiceModel = mongoose.model("Service", ServiceStatus);
export default ServiceModel;