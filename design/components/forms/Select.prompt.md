**Select** — labeled dropdown for fixed choices (grado, sección, nivel, periodo, estado).

```jsx
<Select label="Grado" placeholder="Seleccione" options={["1°","2°","3°"]} />
<Select label="Estado" options={[{value:"act",label:"Activo"},{value:"ret",label:"Retirado"}]} />
```

Accepts `options` (strings or {value,label}) or `<option>` children. Sizes `sm·md·lg`.
