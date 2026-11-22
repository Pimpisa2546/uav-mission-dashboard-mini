"use client";
import React, { useEffect, useRef } from "react";

interface ModalProps {
    open: boolean;
    onClose?: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const firstEl = modalRef.current?.querySelector<HTMLElement>(
            "button,input,select,textarea,a[href]"
        );
        firstEl?.focus();

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose?.();
                return;
            }

            if (e.key === "Tab" && modalRef.current) {
                const focusables = modalRef.current.querySelectorAll<HTMLElement>(
                    "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]"
                );
                if (focusables.length === 0) return;

                const first = focusables[0];
                const last = focusables[focusables.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
        window.addEventListener("keydown", handleKey);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener("keydown", handleKey);

        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <>
            <div role="dialog"
                style={{ position: "fixed", inset: "0", display: "flex", zIndex: 10, justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.5)" }}>
                <div style={{ backgroundColor: "#ffffff", width: "fit-content", maxWidth: "95vw", boxSizing: "border-box", height: "70%", overflowY: "auto", borderRadius: "10px" }}
                    onClick={(e) => e.stopPropagation()} ref={modalRef}
                >
                    {children}
                </div>
            </div>
        </>
    );
};
export default Modal;