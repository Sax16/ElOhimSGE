**EmptyState** — friendly placeholder when a list/table/section has no data yet.

```jsx
<EmptyState icon={<InboxIcon/>} title="Sin estudiantes"
  description="Aún no hay estudiantes matriculados en este grado."
  actions={<Button iconLeft={<PlusIcon/>}>Matricular estudiante</Button>} />
```

`size="sm"` for inline/empty-table use.
