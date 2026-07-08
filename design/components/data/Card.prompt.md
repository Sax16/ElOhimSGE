**Card** — the default surface for grouping content: forms, lists, tables, panels. Provide `title`/`subtitle`/`actions` for a header, `footer` for a bar.

```jsx
<Card title="Datos del estudiante" actions={<IconButton label="Editar"><PencilIcon/></IconButton>}>
  …
</Card>
<Card flush title="Pagos"><Table .../></Card>
```

`elevation`: flat·default·raised. `interactive` for clickable cards. `flush` removes body padding.
