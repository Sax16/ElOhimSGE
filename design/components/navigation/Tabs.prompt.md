**Tabs** — switch views within a page (Datos · Notas · Asistencia · Pagos). Controlled.

```jsx
<Tabs value={tab} onChange={setTab} items={[
  {id:"datos", label:"Datos"},
  {id:"notas", label:"Notas", count:4},
  {id:"pagos", label:"Pagos"},
]} />
```

`variant`: `line` (underline) or `pill` (segmented). Items support `icon`, `count`, `disabled`.
