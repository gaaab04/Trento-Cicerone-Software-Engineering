import mongoose from "mongoose";
import serviceStatusManager from "../services/serviceStatusManager.js";
import ServiceModel from "../models/ServiceStatus.js";

//Verifica lo stato del servizio
export const verifyRagStatus = async (req, res, next) => {
    try {

        //controlla lo stato del servizio utilizzando la classe importata
        const isRagEnabled = serviceStatusManager.isRagEnabled();

        const statusRag = await ServiceModel.findOne({});

        //Se il servizio non è attivo, blocca la richiesta e ritorna un messaggio
        if (isRagEnabled === false) {
            return res.status(503).json({ isRagEnabled: statusRag.enabled, message: statusRag.maintenanceMessage });
        }

        //Se il servizio è attivo
        next();

    } catch (error) {
        console.error("Errore del server (verifyRagStatus)", error);
    }
}  