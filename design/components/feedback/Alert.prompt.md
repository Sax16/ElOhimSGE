**Alert** — inline banner for contextual messages (saldo pendiente, registro guardado, errores de validación).

```jsx
<Alert tone="warning" title="Pensión vencida">El estudiante tiene 2 cuotas pendientes.</Alert>
<Alert tone="success" title="Matrícula registrada" onClose={()=>…} />
```

Tones: info·success·warning·danger. `actions` for buttons, `onClose` for dismiss.
