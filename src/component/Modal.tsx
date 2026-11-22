"use client";
import React, { useEffect } from "react";

interface ModalProps {
    open: boolean;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, children }) => {
    useEffect(() => {
        if (!open) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [open]);
    
    if (!open) return null;

    return (
        <>
            <div style={{ position: "fixed", inset: "0", display: "flex", zIndex: 10, justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.5)" }}>
                <div style={{ backgroundColor: "#ffffff", width: "fit-content", maxWidth: "95vw", boxSizing: "border-box", height: "70%", overflowY: "auto", borderRadius: "10px" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </div>
        </>
    );
};
export default Modal;