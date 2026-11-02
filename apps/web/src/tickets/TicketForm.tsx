import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ApiError,
  categoryLabels,
  priorityLabels,
  submitTicket,
  type Ticket,
  type TicketDraft,
} from './api';

const emptyDraft: TicketDraft = {
  title: '',
  description: '',
  category: '',
  priority: 'media',
};

export function TicketForm({
  onCreated,
}: {
  onCreated: (ticket: Ticket) => void;
}) {
  const [draft, setDraft] = useState<TicketDraft>(emptyDraft);
  const [pending, setPending] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const sending = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fieldToFocus = useRef<string | null>(null);

  useEffect(() => {
    // Esperar a que React habilite el fieldset antes de enfocar el error.
    if (!pending && fieldToFocus.current) {
      const control = formRef.current?.elements.namedItem(fieldToFocus.current);
      if (control instanceof HTMLElement) control.focus();
      fieldToFocus.current = null;
    }
  }, [pending]);

  function update(field: keyof TicketDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setFields((current) => ({ ...current, [field]: '' }));
    setMessage('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true;
    setPending(true);
    setFields({});
    setMessage('');
    try {
      const ticket = await submitTicket(draft);
      setDraft(emptyDraft);
      onCreated(ticket);
    } catch (error) {
      if (error instanceof ApiError) {
        setFields(error.fields);
        setMessage(error.fields.form || error.message);
        const firstField = Object.keys(error.fields).find((name) =>
          Object.hasOwn(emptyDraft, name),
        );
        fieldToFocus.current = firstField ?? null;
      } else {
        // Una desconexión puede ocurrir después de guardar: no reenviar automáticamente.
        setMessage(
          'No pudimos confirmar el guardado. Actualiza el listado antes de reenviar; conservamos lo que escribiste.',
        );
      }
    } finally {
      sending.current = false;
      setPending(false);
    }
  }

  return (
    <section className="ticket-form-card" aria-labelledby="new-ticket-title">
      <div className="panel-icon" aria-hidden="true">
        ＋
      </div>
      <h2 id="new-ticket-title">Nueva solicitud</h2>
      <p className="panel-description">
        Cuéntanos qué ocurre. Todos los campos son obligatorios.
      </p>
      <form
        ref={formRef}
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        aria-busy={pending}
      >
        {message && (
          <p className="form-error" role="alert">
            {message}
          </p>
        )}
        <fieldset disabled={pending}>
          <legend className="sr-only">Datos de la solicitud</legend>
          <div className="form-field">
            <label htmlFor="ticket-title">Título</label>
            <input
              id="ticket-title"
              name="title"
              value={draft.title}
              onChange={(event) => update('title', event.target.value)}
              placeholder="Ej.: No puedo conectarme a la red"
              required
              minLength={5}
              maxLength={120}
              aria-invalid={Boolean(fields.title)}
              aria-describedby="title-hint title-error"
            />
            <span className="field-hint" id="title-hint">
              Resume el problema en 5 a 120 caracteres.
            </span>
            <span className="field-error" id="title-error">
              {fields.title}
            </span>
          </div>
          <div className="form-field">
            <label htmlFor="ticket-description">Descripción</label>
            <textarea
              id="ticket-description"
              name="description"
              rows={4}
              value={draft.description}
              onChange={(event) => update('description', event.target.value)}
              required
              minLength={10}
              maxLength={5000}
              placeholder="¿Qué sucedió y desde cuándo? Incluye lo que ya intentaste."
              aria-invalid={Boolean(fields.description)}
              aria-describedby="description-hint description-error"
            />
            <span className="field-hint" id="description-hint">
              Entre 10 y 5.000 caracteres. Usa información ficticia.
            </span>
            <span className="field-error" id="description-error">
              {fields.description}
            </span>
          </div>
          <div className="form-pair">
            <div className="form-field">
              <label htmlFor="ticket-category">Categoría</label>
              <select
                id="ticket-category"
                name="category"
                required
                value={draft.category}
                onChange={(event) => update('category', event.target.value)}
                aria-invalid={Boolean(fields.category)}
                aria-describedby="category-error"
              >
                <option value="" disabled>
                  Seleccionar
                </option>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <span className="field-error" id="category-error">
                {fields.category}
              </span>
            </div>
            <div className="form-field">
              <label htmlFor="ticket-priority">Prioridad</label>
              <select
                id="ticket-priority"
                name="priority"
                value={draft.priority}
                onChange={(event) => update('priority', event.target.value)}
                aria-invalid={Boolean(fields.priority)}
                aria-describedby="priority-error"
              >
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <span className="field-error" id="priority-error">
                {fields.priority}
              </span>
            </div>
          </div>
          <button type="submit">
            {pending ? 'Guardando solicitud…' : 'Crear solicitud'}
            <span aria-hidden="true">↗</span>
          </button>
        </fieldset>
      </form>
      <p className="form-footnote">
        Se registrará a nombre de <strong>Solicitante demo</strong>.
      </p>
    </section>
  );
}
