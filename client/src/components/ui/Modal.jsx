import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import Card from "./Card";

export default function Modal({ open, onClose, title, children, className = "" }) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] grid place-items-center overflow-y-auto bg-slate-950/65 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <Card
        as="section"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reusable-modal-title"
        className={`relative my-auto w-full max-w-lg p-5 shadow-2xl sm:p-7 ${className}`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="reusable-modal-title" className="text-xl font-black sm:text-2xl">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid size-10 shrink-0 place-items-center rounded-full text-(--color-neutral) transition hover:bg-orange-100 hover:text-orange-700"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
}
