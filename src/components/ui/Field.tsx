import { ReactNode } from 'react';

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'select';
  options?: string[];
  hint?: string;
}

export function Field({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  options = [],
  hint,
}: FieldProps) {
  return (
    <div>
      <label className="label">{label}</label>
      {type === 'textarea' ? (
        <textarea
          className="textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
        />
      ) : type === 'select' ? (
        <select
          className="select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">— Select —</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
      {hint && <p className="text-xs text-ink-400 mt-1">{hint}</p>}
    </div>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
  description?: string;
  defaultOpen?: boolean;
}

export function Section({ title, children, description, defaultOpen = true }: SectionProps) {
  return (
    <details className="card p-5" open={defaultOpen}>
      <summary className="cursor-pointer flex items-center justify-between">
        <div>
          <h3 className="section-title">{title}</h3>
          {description && <p className="text-sm text-ink-400 mt-0.5">{description}</p>}
        </div>
      </summary>
      <div className="mt-4 field-group">{children}</div>
    </details>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="text-lg font-serif font-semibold text-ink-600">{title}</h3>
      <p className="text-sm text-ink-400 mt-1 max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  color?: 'ink' | 'amber' | 'sage' | 'rust' | 'teal' | 'error' | 'warning' | 'success';
}

export function Badge({ children, color = 'ink' }: BadgeProps) {
  const colors: Record<string, string> = {
    ink: 'bg-ink-100 text-ink-600',
    amber: 'bg-amber-100 text-amber-700',
    sage: 'bg-sage-100 text-sage-700',
    rust: 'bg-rust-100 text-rust-700',
    teal: 'bg-teal-100 text-teal-700',
    error: 'bg-error-100 text-error-700',
    warning: 'bg-warning-100 text-warning-600',
    success: 'bg-success-100 text-success-700',
  };
  return <span className={`tag ${colors[color]}`}>{children}</span>;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-thin p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-semibold text-ink-800">{title}</h2>
          <button className="btn-ghost btn !p-1.5" onClick={onClose} aria-label="Close">
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>
        <div className="field-group">{children}</div>
        {footer && <div className="flex justify-end gap-2 mt-6">{footer}</div>}
      </div>
    </div>
  );
}

interface ConfirmDeleteProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

export function ConfirmDelete({ open, onClose, onConfirm, itemName }: ConfirmDeleteProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm deletion"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </button>
        </>
      }
    >
      <p className="text-ink-600">
        Delete <strong>{itemName}</strong>? This cannot be undone.
      </p>
    </Modal>
  );
}
