import { BadgeCheck, Check, Circle, CreditCard, FileText, Gavel, PackageCheck, Send, XCircle } from 'lucide-react';
import PropTypes from 'prop-types';

const icons = {
  draft: FileText,
  submitted: Send,
  budget: BadgeCheck,
  market: Gavel,
  reception: PackageCheck,
  payment: CreditCard
};

const formatDate = (date) => {
  if (!date) return null;
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? null
    : parsedDate.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
};

const DemandeTimeline = ({ steps }) => (
  <section aria-label="Suivi du traitement de la demande" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-5">
      <h4 className="text-base font-bold text-slate-900">Suivi du traitement</h4>
      <p className="mt-1 text-sm text-slate-500">Étapes, dates et responsables enregistrés.</p>
    </div>
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const Icon = icons[step.key] || Circle;
        const isCompleted = step.status === 'completed';
        const isRejected = step.status === 'rejected';
        const isSkipped = step.status === 'skipped';
        const date = formatDate(step.date);

        return (
          <li key={step.key} className="relative flex gap-4 pb-5 last:pb-0">
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5 ${
                  isCompleted ? 'bg-emerald-300' : 'bg-slate-200'
                }`}
              />
            )}
            <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              isCompleted ? 'bg-emerald-100 text-emerald-700' :
                isRejected ? 'bg-red-100 text-red-700' :
                  step.current ? 'bg-blue-100 text-primary ring-4 ring-blue-50' :
                    'bg-slate-100 text-slate-400'
            }`}>
              {isCompleted ? <Check className="h-4 w-4" aria-hidden="true" /> :
                isRejected ? <XCircle className="h-4 w-4" aria-hidden="true" /> :
                  <Icon className="h-4 w-4" aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h5 className={`text-sm font-semibold ${
                  step.current ? 'text-primary' : isSkipped ? 'text-slate-400' : 'text-slate-800'
                }`}>
                  {step.label}
                </h5>
                {step.current && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                    Étape actuelle
                  </span>
                )}
                {isRejected && (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">
                    Rejetée
                  </span>
                )}
                {isSkipped && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                    Non applicable
                  </span>
                )}
              </div>
              {date && <time dateTime={step.date} className="mt-1 block text-xs text-slate-500">{date}</time>}
              {step.responsible && (
                <p className="mt-1 text-xs text-slate-600">Responsable : {step.responsible}</p>
              )}
              {!isSkipped && isCompleted && !step.responsible && (
                <p className="mt-1 text-xs text-slate-400">Responsable non enregistré</p>
              )}
              {step.detail && <p className="mt-1 text-xs text-slate-500">{step.detail}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  </section>
);

DemandeTimeline.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    current: PropTypes.bool,
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    responsible: PropTypes.string,
    detail: PropTypes.string
  })).isRequired
};

export default DemandeTimeline;
