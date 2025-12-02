import ServiceModel from "../models/ServiceStatus.js";

class ServiceStatusManager {
    ragEnabled = true;

    //Il costruttore inizializza ragEnabled
    constructor () {
        this.ragEnabled = true;
    }

    //Questo metodo modifica il valore di ragEnabled in base allo stato salvato nel database
    static async initialize () {
        try{
            const serviceExist = await ServiceModel.find ({});

            //Se il documento nel database non esiste allora ne crea uno nuovo
            if(serviceExist.length === 0) {
                const status = await ServiceModel.create({
                    enabled:true
                });
            }

            const serviceOn = await ServiceModel.find ({
                enabled:true
            });
            //Se non trova corrispondenze allora enabled è false
            if (serviceOn.length === 0){
                this.ragEnabled = false;
            }else{
                this.ragEnabled = true;
            }
        } catch (error){
            console.error("Errore del server (initialize)", error);
        }
    } 

    //Ritorna il valore di ragEnabled
    static async isRagEnabled () {
        return this.ragEnabled;
    }

    //Imposta il valore di ragEnabled e con lo stesso valore aggiorna il documento nel database
    static async setRagStatus (ragStatus) {
        try{
            this.ragEnabled = ragStatus;
            const serviceOn = await ServiceModel.findOne ({});
            
            if(serviceOn){
                await ServiceModel.findByIdAndUpdate(serviceOn._id, 
                    {enabled:ragStatus},
                    {new:true}
                );
            }
        }catch (error) {
            console.error("Errore del server (setRagStatus)", error);
        }
    }
}

export default ServiceStatusManager;