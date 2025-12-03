import ServiceModel from "../models/ServiceStatus.js";

class ServiceStatusManager {
    ragEnabled = true;
    statusId;

    //Questo metodo modifica il valore di ragEnabled in base allo stato salvato nel database
    async initialize() {
        try {
            //cerca il documento di stato del servizio nel database
            const serviceStatus = await ServiceModel.findOne({});

            //Se il documento nel database non esiste allora ne crea uno nuovo
            if (serviceStatus === null) {
                const status = await ServiceModel.create({
                    enabled: true,
                    maintenanceMessage: null//null perché è attivo
                });

                serviceStatus = status;
            }

            //salvo nei parametri della classe lo stato e l'id del docuemnto di stato, in modo da usare sempre quello
            this.ragEnabled = serviceStatus.enabled;
            this.statusId = serviceStatus._id;

        } catch (error) {
            console.error("Errore del server (initialize)", error);
        }
    }

    //Ritorna il valore di ragEnabled
    isRagEnabled() {
        return this.ragEnabled;
    }

    //Imposta il valore di ragEnabled e con lo stesso valore aggiorna il documento nel database
    async setRagStatus(ragStatus) {
        try {

            //aggiorna con null(servizio attivo) o il messaggio(servizio non attivo) 
            const testo = ragStatus ? null : "Servizio attualmente in manutenzione";

            //trova il docuemnto nel database e lo aggiorna
            const serviceOn = await ServiceModel.findByIdAndUpdate(
                this.statusId,
                {
                    enabled: ragStatus,
                    maintenanceMessage: testo
                },
                { new: true }
            );

            //aggiorna il parametro della classe
            this.ragEnabled = ragStatus;

        } catch (error) {
            console.error("Errore del server (setRagStatus)", error);
        }
    }
}

export default new ServiceStatusManager();