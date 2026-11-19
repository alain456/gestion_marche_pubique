import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const ConfirmDialog = ({
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  danger = false,
  children,
  onConfirm,
  onCancel
}) => {
  const cancelButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleId = 'confirm-dialog-title';
  const messageId = 'confirm-dialog-message';

  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = dialogRef.current?.querySelectorAll('button:not(:disabled), textarea:not(:disabled)');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <section
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onKeyDown={handleKeyDown}
        className="flex max-h-[90dvh] w-full max-w-md flex-col rounded-2xl bg-white p-4 shadow-2xl sm:p-6"
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          <h2 id={titleId} className="text-lg font-bold text-slate-900">{title}</h2>
          <p id={messageId} className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
          {children}
        </div>
        <div className="mt-4 flex shrink-0 flex-col-reverse gap-3 sm:mt-6 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="min-h-11 rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className={`min-h-11 rounded-lg px-4 py-2.5 font-semibold text-white ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-blue-800'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
};

ConfirmDialog.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  danger: PropTypes.bool,
  children: PropTypes.node,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default ConfirmDialog;
