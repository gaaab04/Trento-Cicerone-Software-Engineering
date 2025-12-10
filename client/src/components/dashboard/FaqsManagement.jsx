import React, { useEffect, useState } from "react";
import "../../styles/dashboard/FaqsManagement.css"
import axios from "axios";
import { API } from "../../api.js";
import Bin from "../../assets/bin.svg"
import EditPencil from "../../assets/edit-pencil.svg"
import { Modal } from "../Modal.jsx"

function FaqsManagement() {
    const [ activeFaqs, setActiveFaqs ] = useState( [] );                                                // lista delle FAQ attive
    const [ showDeleteModal, setShowDeleteModal ] = useState( false );                                // controlla se mostrare o no il modal per la cancellazione
    const [ showEditModal, setShowEditModal ] = useState( false );                                   // controlla se mostrare o no il modal per l'edit
    const [ faqToDelete, setFaqToDelete ] = useState( null );                                                // salva l'id della faq da cancellare
    const [ faqToEdit, setFaqToEdit ] = useState( null );                                                   // salva l'id della faq da editare
    const [ editData, setEditData ] = useState({ question: "", category: "" }); //dati del form di modifica
    const [ categories, setCategories ] = useState( [] );                                           // lista delle categorie presenti nel modello delle faq
    const [ newFaq, setNewFaq ] = useState( { question: "", category: "" } );  // dati della nuova faq da creare

    // funzione che prende tutte le faq presenti al momento
    const fetchFaqs = async () => {
        try {
            const res = await axios.get( `${ API }/api/faqs`, { withCredentials: true } );
            setActiveFaqs( res.data );
        } catch ( error ) {
            console.error( 'Errore durante il recupero delle FAQ:', error );
        }
    }

    // funzione che prende tutte le categorie presenti nell'enum del model faq
    const fetchCategories = async () => {
        try {
            const res = await axios.get( `${ API }/api/faqs/categories`, { withCredentials: true } );
            setCategories( res.data );
        } catch ( error ) {
            console.error( 'Errore durante il recupero delle categorie:', error );
        }
    }

    // carica le faq e le categorie
    useEffect( () => {
        fetchFaqs();
        fetchCategories()
    }, [] )

    // funzione che gestisce l'eliminazione di una faq
    const handleDeleteFaq = async ( faqId ) => {
        try {
            await axios.delete( `${ API }/api/faqs/${ faqId }`, { withCredentials: true } );
            await fetchFaqs();
        } catch ( error ) {
            alert( "Errore durante la cancellazione della FAQ" );
            console.error( 'Errore durante la cancellazione della FAQ:', error );
        }
    }

    // funzione che gestisce la modifica di una faq
    const handleEditFaq = async ( e ) => {
        e.preventDefault();
        try {
            await axios.put( `${ API }/api/faqs/${ faqToEdit }`, editData, { withCredentials: true } );
            await fetchFaqs();
            alert( "FAQ modificata con successo" );
            setShowEditModal( false );
            setFaqToEdit( null );
        } catch ( error ) {
            console.error( 'Errore durante la modifica della FAQ:', error );
            alert( "Errore durante la modifica della FAQ" );
        }
    }

    // funzione che gestisce l'aggiunta di una nuova faq
    const handleNewFaq = async ( e ) => {
        e.preventDefault();
        try {
            await axios.post( `${ API }/api/faqs`, newFaq, { withCredentials: true } );
            await fetchFaqs();
            setNewFaq( { question: "", category: "" } );
            alert( "FAQ aggiunta con successo" );
        } catch ( error ) {
            console.error( 'Errore durante l\'aggiunta della FAQ:', error );
            if ( error.response.status === 400 ) alert( "Categoria non valida." );
            else if ( error.response.status === 401 ) alert( "La domanda supera il limite di 200 caratteri" );
            else alert( "Errore durante l'aggiunta della FAQ" );
        }

    }
    return (
        <div className="faqsManagement">
            <h3>Gestione FAQs</h3>
            <div className="faqsMainwrapper">
                <div className="activeFaqs">
                    <p className="faqsWidgetMainTitle">FAQs attive attualmente</p>
                    { activeFaqs?.length > 0 ? (
                        activeFaqs.map( ( faq ) => (
                            <div key={ faq._id } className="faqsList">
                                <p className="faqsText">{ faq.question }</p>
                                <div className="faqsButtons">
                                    <button className="editFaqButton" onClick={ () => {
                                        setFaqToEdit( faq._id );
                                        setEditData( {
                                            question: faq.question,
                                            category: faq.category,
                                        } );
                                        setShowEditModal( true );
                                    } }><img src={ EditPencil } alt="Edit"/></button>
                                    <button className="deleteFaqButton" onClick={ () => {
                                        setFaqToDelete( faq._id );
                                        setShowDeleteModal( true );
                                    } }><img src={ Bin } alt="Delete"/></button>
                                </div>
                            </div>
                        ) )
                    ) : ( <p>Nessuna FAQ attiva</p> ) }
                </div>

                <div className="addFaqs">
                    <p className="faqsWidgetMainTitle">Aggiungi una nuova FAQ</p>
                    <form onSubmit={ handleNewFaq } className="addFaqForm">
                        <div className="addFaqFormAndCategory">
                            <input
                                type="text"
                                name="question"
                                placeholder="Domanda"
                                value={ newFaq.question }
                                onChange={ ( e ) => setNewFaq( { ...newFaq, question: e.target.value } ) }
                                required
                            />
                            <select
                                className="addFaqFormSelect"
                                name="category"
                                value={ newFaq.category }
                                onChange={ ( e ) => setNewFaq( { ...newFaq, category: e.target.value } ) }
                                required>
                                <option value="" disabled>Categoria</option>
                                { categories.length > 0 ? (
                                    categories.map( ( category ) => (
                                        <option key={ category } value={ category }>{ category }</option>
                                    ) )
                                ) : (
                                    <option value="" disabled>Nessuna categoria disponibile</option>
                                ) }
                            </select>
                        </div>
                        <button type="submit">Aggiungi</button>
                    </form>

                </div>
            </div>

            {/* modal che appare quando si schiaccia sul bottone per eliminare una faq */}
            <Modal shouldShow={ showDeleteModal } onRequestClose={ () => {
                setShowDeleteModal( false );
                setFaqToDelete( null );
            } }>
                <h3>Conferma cancellazione</h3>
                <p>Sei sicuro di voler cancellare la FAQ selezionata?</p>

                <p>{ faqToDelete?.question }</p>

                <div className="modalButtonsContainer"
                     style={ { display: "flex", justifyContent: "center", gap: "0.8rem" } }>
                    <button
                        className="deleteConfirmButton"
                        onClick={ () => {
                            handleDeleteFaq( faqToDelete );
                            setShowDeleteModal( false );
                            setFaqToDelete( null );
                        } }
                        style={ { color: "white", backgroundColor: "#C0392B" } }>
                        Conferma
                    </button>

                    <button
                        className="deleteCancelButton"
                        onClick={ () => {
                            setShowDeleteModal( false );
                            setFaqToDelete( null );
                        } }
                        style={ { color: "white", backgroundColor: "#546371" } }>
                        Annulla
                    </button>
                </div>
            </Modal>

            {/* modal che appare quando si schiaccia sul bottone per editare una faq */}
            <Modal shouldShow={ showEditModal } onRequestClose={ () => {
                setShowEditModal( false );
                setFaqToEdit( null );
            } }>
                <h3>Modifica FAQ</h3>
                <p>Modifica i campi e salva le modifiche</p>
                <form onSubmit={ handleEditFaq } className="editFaqForm"
                      style={ { display: "flex", flexDirection: "column", gap: "1rem" } }>
                    <input type="text"
                           value={ editData.question }
                           onChange={ ( e ) => setEditData( { ...editData, question: e.target.value } ) }
                           required
                    />
                    <select value={ editData.category }
                            onChange={ ( e ) => setEditData( { ...editData, category: e.target.value } ) }
                            style={{ width: "40%", height: "2rem", backgroundColor:"f9f9f9" } }
                            required>
                        <option value="" disabled>Categoria</option>
                        { categories.map( ( category ) => (
                            <option key={ category } value={ category }>{ category }</option>
                        ) ) }
                    </select>
                    <div className="modalButtonsContainer"
                         style={ { display: "flex", justifyContent: "center", gap: "0.8rem" } }>
                        <button type="submit" style={{ color: "white", backgroundColor: "#28a745" }}>Salva</button>
                        <button type="button" style={{ color: "white", backgroundColor: "#546371" }} onClick={()=> {
                            setShowEditModal(false);
                            setFaqToEdit( null );
                        }}>Annulla</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default FaqsManagement;