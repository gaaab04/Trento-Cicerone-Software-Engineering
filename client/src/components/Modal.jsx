// è un componente che mostra un popup quando viene richiamato
// per farlo ho seguito la guida qui dove è tutto spiegato bene https://medium.com/@tushar_chavan/creating-a-reusable-modal-component-in-react-tips-and-best-practices-249784902689
import React from "react";
import "../styles/Modal.css";

export const Modal = ({ shouldShow, onRequestClose, children }) => {
    return shouldShow ? (
        <div className="modal-overlay" onClick={onRequestClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onRequestClose}>
                    X
                </button>

                {children}
            </div>
        </div>
    ) : null;
};
