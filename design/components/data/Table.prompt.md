**Table** — config-driven data grid for the ERP's lists (estudiantes, pagos, notas, asistencia). Define `columns`, pass `data`. Wrap in a `flush` Card.

```jsx
const columns = [
  { key: "codigo", header: "Código", mono: true },
  { key: "nombre", header: "Estudiante" },
  { key: "grado", header: "Grado", align: "center" },
  { key: "estado", header: "Estado", render: v => <Badge tone={v==="Activo"?"success":"neutral"} dot>{v}</Badge> },
  { key: "deuda", header: "Deuda", num: true, mono: true, render: v => `S/ ${v}` },
];
<Table columns={columns} data={rows} hover zebra />
```

Sorting is controlled — pass `sort`/`onSort` and sort `data` yourself. `mono`/`num` for figure columns. `onRowClick`, `selectedKeys`, `compact`, `emptyText`.
