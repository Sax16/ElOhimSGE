**Button** — the primary action control; use blue `primary` for the single main action, gold `accent` for a standout positive action (e.g. "Matricular"), `secondary`/`ghost` for the rest.

```jsx
<Button variant="primary" iconLeft={<PlusIcon/>}>Nuevo estudiante</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="danger" size="sm">Eliminar</Button>
```

Variants: `primary` · `accent` · `secondary` · `ghost` · `danger` · `link`. Sizes: `sm` (32px) · `md` (38px) · `lg` (46px). Props: `block`, `iconLeft`, `iconRight`, `disabled`, plus native button attrs.
