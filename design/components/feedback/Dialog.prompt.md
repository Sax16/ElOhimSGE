**Dialog** — modal for confirmations and focused forms (eliminar registro, registrar pago, editar estudiante). Controlled via `open`.

```jsx
<Dialog open={open} onClose={close} title="Eliminar estudiante"
  description="Esta acción no se puede deshacer." icon={<TrashIcon/>} iconTone="danger"
  footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button variant="danger">Eliminar</Button></>}>
  ¿Seguro que deseas eliminar a María Quispe?
</Dialog>
```

Sizes sm·md·lg·xl. Closes on overlay click, Esc, or ✕.
