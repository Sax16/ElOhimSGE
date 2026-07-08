**Sidebar** — the SGE's primary navigation rail (dark institutional blue in both themes). Group routes with `section`, mark counts with `badge`, collapse to icons.

```jsx
<Sidebar logoSrc="/assets/elohim-insignia.png" activeId={route} onSelect={setRoute}
  items={[
    {id:"dash", label:"Panel", icon:<HomeIcon/>},
    {id:"est", label:"Estudiantes", icon:<UsersIcon/>, section:"Académico"},
    {id:"notas", label:"Notas", icon:<BookIcon/>},
    {id:"pagos", label:"Pensiones", icon:<CashIcon/>, badge:8, section:"Finanzas"},
  ]} />
```

`collapsed` shrinks to an icon strip. `footer` for a pinned profile/settings block.
