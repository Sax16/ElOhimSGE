**Input** — labeled text field with hint/error states and optional icon, prefix or suffix. Use `prefix="S/."` for money, `suffix` for units.

```jsx
<Input label="Nombre del estudiante" placeholder="Ej. María Quispe" required />
<Input label="Pensión mensual" prefix="S/." inputMode="decimal" />
<Input label="Correo" type="email" error="Correo no válido" />
```

Sizes `sm·md·lg`. Props: `label`, `hint`, `error`, `required`, `iconLeft`, `prefix`, `suffix`, plus native input attrs.
