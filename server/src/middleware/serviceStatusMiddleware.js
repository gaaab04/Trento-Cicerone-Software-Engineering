import mongoose from "mongoose";
import serviceStatusManager from "../services/serviceStatusManager.js";
import ServiceModel from "../models/ServiceStatus.js";
import message from "../models/Message.js";

//Verifica lo stato del servizio
export const verifyRagStatus = async (req, res, next) => {
    try {

        //controlla lo stato del servizio utilizzando la classe importata
        const isRagEnabled = serviceStatusManager.isRagEnabled();

        const statusRag = await ServiceModel.findOne({});

        // se il servizio non è attivo, salvo il req nel messaggio
        if (isRagEnabled === false) {
            req.isRagDisabled = true;
            req.maintenanceMessage = statusRag.maintenanceMessage;
        }

        next();

    } catch (error) {
        console.error("Errore del server (verifyRagStatus)", error);
    }
}  