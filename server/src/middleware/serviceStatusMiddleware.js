import ServiceStatusManager from "../services/serviceStatusManager.js";

//Verifica lo stato del servizio
export const verifyRagStatus = (req, res, next) => {
    try{
        //Istanzia la classe ServiceStatusManager e controlla lo stato del servizio
        const serviceStatus = new ServiceStatusManager();
        const isRagEnabled = serviceStatus.isRagEnabled();
        //Se il servizio non è attivo, blocca la richiesta
        if(!isRagEnabled){
            return res.status(503).json({isRagEnabled:false, message:"Il servizio non è attivo"});
        }
        //Se il servizio è attivo
        next();
    } catch (error){
        console.error("Errore del server (verifyRagStatus)", error);
    }
}  