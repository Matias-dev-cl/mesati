CREATE TABLE users (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('solicitante', 'tecnico')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tickets (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 5 AND 120),
  description text NOT NULL CHECK (char_length(btrim(description)) BETWEEN 10 AND 5000),
  category text NOT NULL CHECK (category IN ('hardware', 'software', 'red', 'accesos', 'otro')),
  priority text NOT NULL CHECK (priority IN ('baja', 'media', 'alta')),
  status text NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_curso', 'resuelto')),
  requester_id integer NOT NULL REFERENCES users(id),
  technician_id integer REFERENCES users(id),
  resolution text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  CONSTRAINT tickets_state_consistency CHECK (
    (status = 'pendiente' AND technician_id IS NULL AND resolution IS NULL AND resolved_at IS NULL)
    OR (status = 'en_curso' AND technician_id IS NOT NULL AND resolution IS NULL AND resolved_at IS NULL)
    OR (status = 'resuelto' AND technician_id IS NOT NULL AND resolution IS NOT NULL
      AND char_length(btrim(resolution)) BETWEEN 10 AND 5000 AND resolved_at IS NOT NULL)
  )
);

CREATE TABLE ticket_events (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id integer NOT NULL REFERENCES tickets(id),
  actor_id integer NOT NULL REFERENCES users(id),
  event_type text NOT NULL CHECK (event_type IN ('created', 'status_changed')),
  from_status text CHECK (from_status IN ('pendiente', 'en_curso', 'resuelto')),
  to_status text NOT NULL CHECK (to_status IN ('pendiente', 'en_curso', 'resuelto')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((event_type = 'created' AND from_status IS NULL AND to_status = 'pendiente')
    OR (event_type = 'status_changed' AND from_status IS NOT NULL))
);

-- El listado se limita al solicitante y ordena de forma estable incluso si coinciden fechas.
CREATE INDEX tickets_requester_created_idx ON tickets (requester_id, created_at DESC, id DESC);
CREATE INDEX ticket_events_ticket_idx ON ticket_events (ticket_id, created_at, id);
