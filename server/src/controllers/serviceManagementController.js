import ServiceModel from "../models/ServiceStatus.js";
import ServiceStatusManager from "../services/serviceStatusManager.js";


//Ottiene lo stato del servizio
export const getServiceStatus = async (req, res) => {
    //Legge il documento di stato del servizio dal db
    const serviceStatus = await ServiceModel.findOne ({});
    if (serviceStatus) {
        return res.status(200).json({
            enabled:serviceStatus.enabled,
            message:serviceStatus.message
        });
    }
    return res.status(404).json({message:"Stato non trovato"});
}

//Attiva il servizio
export const enableRagService = async (req, res) => {
    try{
        //Imposta lo stato del servizio a true tramite il metodo della classe serviceStatusManager
        ServiceStatusManager.setRagStatus(true);
        return res.status(200).json({
            message:"Servizio abilitato con successo"
        });
    } catch (error) {
        console.error("Errore nell'abilitare il servizio", error);
         return res.status(400).json({
            message:"Impossibile abilitare il servizio"
        });
    }
}

//Disattiva il servizio
export const disableRagService = async (req, res) => {
    try{
        //Imposta lo stato del servizio a false tramite il metodo della classe serviceStatusManager
        ServiceStatusManager.setRagStatus(false);
        return res.status(200).json({
            message:"Servizio disabilitato con successo"
        });
    } catch (error) {
        console.error("Errore nel disabilitare il servizio", error);
         return res.status(400).json({
            message:"Impossibile disabilitare il servizio"
        });
    }
}