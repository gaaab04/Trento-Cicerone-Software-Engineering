import "../../styles/dashboard/DocumentManagement.css"
import React, {useEffect, useState} from "react";
import {API} from "../../api.js";
import axios from "axios";
import Bin from "../../assets/bin.svg";
import EditPencil from "../../assets/edit-pencil.svg";
import {Modal} from "../Modal.jsx";

function DocumentManagement() {
    const [categories, setCategories] = useState([]);                                                   // categorie disponibili
    const [newDocument, setNewDocument] = useState({title: "", content:"", category:"", source:""});     // stato del nuovo documento da creare
    const [activeDocuments, setActiveDocuments] = useState([]);                                        // tutti i documenti attivi al momento
    const [documentToDelete, setDocumentToDelete] = useState(null);                                           // stato per il documento da eliminare
    const [showDeleteModal, setShowDeleteModal] = useState(false);                                   // per gestire l'apparizione del modal di cancellazione
    const [documentToEdit, setDocumentToEdit] = useState(null);                                               // stato per il documento da modificare
    const [showEditModal, setShowEditModal] = useState(false);                                       // per gestire l'apparizione del modal di modifica
    const [editData, setEditData] = useState({title: "", content:"", category:"", source:""});          // dati durante la modifica
    const [currentPage, setCurrentPage] = useState(1);                                               // gestione della paginazione
    const [filterText, setFilterText] = useState("");                                                 // testo usato per filtrare titolo e contenuto

    // filtra i documenti in base al testo nell'input
    const filteredDocuments = activeDocuments.filter (doc =>
        doc.title.toLowerCase().includes(filterText.toLowerCase()) ||
        doc.content.toLowerCase().includes(filterText.toLowerCase())
    );

    // impostazioni della paginazione
    const documentsPerPage = 3;
    const indexOfLastDocument = currentPage * documentsPerPage;
    const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
    // documenti visualizzati nella pagina attuale
    const currentDocuments = filteredDocuments.slice(indexOfFirstDocument, indexOfLastDocument);

    // recupera le categorie
    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API}/api/documents/categories`, {withCredentials: true});
            setCategories(res.data);
        } catch (error) {
            console.error("Errore durante il recupero delle categorie nei documenti:", error);
        }
    }

    // recupera i documenti attivi
    const fetchDocuments = async () => {
        try {
            const res = await axios.get(`${API}/api/documents`, {withCredentials: true});
            setActiveDocuments(res.data);
        } catch (error) {
            console.error("Errore durante il recupero dei documenti:", error);
        }
    }

    // funzioni chiamate al caricamento della pagina
    useEffect(() => {
        fetchCategories();
        fetchDocuments();
    }, [])

    // funzione per l'invio di una nuova informazione
    const handleNewDocument = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/api/documents/`, newDocument, {withCredentials: true});
            await fetchDocuments();
            setNewDocument({title: "", content:"", category:"", source:""});
            alert("Informazioni aggiornate con successo");
        } catch (error) {
            console.error ("Errore durante l'invio della nuova informazione", error);
            alert("Non è stato possibile inviare la nuova informazione. Riprova più tardi");
        }
    }

    // funzione per la rimozione di un'informazione
    const handleDeleteDocument = async (documentId) => {
        try {
            await axios.delete(`${API}/api/documents/${documentId}`, {withCredentials: true});
            await fetchDocuments();
        } catch (error) {
            alert("Errore durante la cancellazione del documento");
            console.error("Errore durante la cancellazione del documento", error);
        }
    }

    // funzione per la modifica di un documento
    const handleEditDocument = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`${ API }/api/documents/${ documentToEdit }`, editData, {withCredentials: true});
            await fetchDocuments();
            alert("Informazioni aggiornate con successo");
            setShowEditModal(false);
            setDocumentToEdit(null);
        } catch (error) {
            console.error("Errore durante la cancellazione del documento", error);
            alert("Non è stato possibile modificare il documento. Riprova più tardi");
        }

    }

    return (
        <div className="documentManagement">
            <h3>Gestione documenti</h3>
            <div className="documentsMainWrapper">


                <div className="addDocumentWidget">
                    <p className={"widgetTitle"}>Aggiungi delle informazioni</p>

                    <form onSubmit={handleNewDocument}>
                    <div className={"addTitleAndCategory"}>
                     <input
                         type={"text"}
                         placeholder={"Titolo dell'informazione"}
                         value={newDocument.title}
                         onChange={(e) => setNewDocument({...newDocument, title:e.target.value})}
                         required
                     />
                     <select name={"category"} value={newDocument.category} onChange={(e) => setNewDocument({...newDocument, category: e.target.value})} >
                         <option value="" disabled>Categoria</option>
                         {categories.length > 0 ? (
                             categories.map((category) => (
                                 <option key={category} value={category}>{category}</option>
                             ))
                         ): (<option value="" disabled>Nessuna categoria disponibile</option> )}
                     </select>
                    </div>
                    <textarea
                        className="addContent"
                        placeholder="Inserisci il contenuto"
                        value={newDocument.content}
                        onChange={(e) => setNewDocument({...newDocument, content: e.target.value})}
                        required
                    ></textarea>
                    <div className="addSourceAndButton">
                        <input
                            type="text"
                            placeholder={"Fonte dell'informazione"}
                            value={newDocument.source}
                            onChange={(e) => setNewDocument({...newDocument, source: e.target.value})}
                        />
                        <button type="submit" className={"addDocumentButton"}>Aggiungi</button>
                    </div>
                    </form>
                </div>

                <div className="actualDocumentsWidget">
                    <p className={"widgetTitle"}>Informazioni presenti attualmente</p>
                    <div className="filtersSection">
                        <input
                            type="text"
                            placeholder="Filtra per contenuto"
                            value={filterText}
                            onChange={(e) => {
                                setFilterText(e.target.value);
                                setCurrentPage(1);
                        }}
                        /> {/* TODO aggiungere icona lente*/}
                    </div>
                    {currentDocuments.length > 0 ? (
                        currentDocuments.map((document) => (
                            <div key = {document._id} className="documentEntity">
                                <div className="documentInfo">
                                    <p className="documentTitle">{document.title}</p>
                                    <p className="documentContent">{document.content}</p>
                                    <div className="documentMetadata">
                                        <p className="documentSource">{document.metadata.source}</p>
                                        <p className="documentDate">Ultimo aggiornamento: {document.updatedAt.split("T")[0]}</p>
                                    </div>
                                </div>
                                <div className="editDocumentButtons">
                                    <button
                                        onClick={()=> {
                                            setDocumentToEdit(document._id);
                                            setEditData ({
                                                title: document.title,
                                                content: document.content,
                                                source: document.metadata.source,
                                                category: document.category,
                                            })
                                            setShowEditModal(true);
                                        }}


                                    ><img src={ EditPencil } alt="Edit"/></button>
                                    <button onClick={()=> {
                                        setDocumentToDelete(document._id);
                                        setShowDeleteModal(true);
                                    }}><img src={ Bin } alt="Delete"/></button>
                                </div>
                            </div>
                        ))
                    ): (<p>Nessun documento trovato</p>)}
                    <div className="changeView">
                        <button
                        onClick={() => setCurrentPage(prev => Math.max(prev-1, 1))}
                        disabled={currentPage === 1}>
                            Indietro
                        </button>
                        <button
                        onClick={() => setCurrentPage (prev => Math.min(prev+1, Math.ceil(filteredDocuments.length / documentsPerPage)))}
                        disabled={currentPage === Math.ceil(filteredDocuments.length / documentsPerPage)}>
                            Avanti
                        </button>
                    </div>
                </div>
            </div>
            <Modal shouldShow={ showDeleteModal } onRequestClose={ () => {
                setShowDeleteModal( false );
                setDocumentToDelete( null );
            } }>
                <h3>Conferma cancellazione</h3>
                <p>Sei sicuro di voler cancellare il documento selezionato?</p>



                <div className="modalButtonsContainer"
                     style={ { display: "flex", justifyContent: "center", gap: "0.8rem" } }>
                    <button
                        className="deleteConfirmButton"
                        onClick={ () => {
                            handleDeleteDocument( documentToDelete );
                            setShowDeleteModal( false );
                            setDocumentToDelete( null );
                        } }
                        style={ { color: "white", backgroundColor: "#C0392B" } }>
                        Conferma
                    </button>

                    <button
                        className="deleteCancelButton"
                        onClick={ () => {
                            setShowDeleteModal( false );
                            setDocumentToDelete( null );
                        } }
                        style={ { color: "white", backgroundColor: "#546371" } }>
                        Annulla
                    </button>
                </div>
            </Modal>

            <Modal shouldShow={ showEditModal } onRequestClose={ () => {
                setShowEditModal( false );
                setDocumentToEdit( null );
            } }>
                <h3>Modifica FAQ</h3>
                <p>Modifica i campi e salva le modifiche</p>
                <form onSubmit={ handleEditDocument } className="editFaqForm"
                      style={ { display: "flex", flexDirection: "column", gap: "1rem" } }>
                    <input type="text"
                           value={ editData.title }
                           onChange={ ( e ) => setEditData( { ...editData, title: e.target.value } ) }
                           required
                    />
                    <select value={ editData.category }
                            onChange={ ( e ) => setEditData( { ...editData, category: e.target.value } ) }
                            style={{ width: "100%", height: "2rem", backgroundColor:"f9f9f9" } }
                            required>
                        <option value="" disabled>Categoria</option>
                        { categories.map( ( category ) => (
                            <option key={ category } value={ category }>{ category }</option>
                        ) ) }
                    </select>
                    <textarea value={ editData.content }
                              onChange={ ( e ) => setEditData( { ...editData, content: e.target.value } ) }
                              style={{width: "100%", height: "10rem", backgroundColor:"f9f9f9", resize: "vertical" }}
                              required>
                    </textarea>
                    <input type="text"
                           value={ editData.source }
                           onChange={ ( e ) => setEditData( { ...editData, source: e.target.value } ) }
                           required
                    />
                    <div className="modalButtonsContainer"
                         style={ { display: "flex", justifyContent: "center", gap: "0.8rem" } }>
                        <button type="submit" style={{ color: "white", backgroundColor: "#28a745" }}>Salva</button>
                        <button type="button" style={{ color: "white", backgroundColor: "#546371" }} onClick={()=> {
                            setShowEditModal(false);
                            setDocumentToEdit( null );
                        }}>Annulla</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default DocumentManagement;