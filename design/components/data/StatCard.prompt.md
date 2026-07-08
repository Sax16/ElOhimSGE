**StatCard** — dashboard KPI tile (estudiantes matriculados, pensiones cobradas, asistencia). Figure uses tabular numerals.

```jsx
<StatCard label="Estudiantes" value="482" icon={<UsersIcon/>} delta={4.2} caption="vs. 2025" />
<StatCard label="Pensiones del mes" value="S/ 84,320" iconTone="success" icon={<CashIcon/>} delta={-2.1} />
```

`iconTone`: brand·accent·success·danger. Numeric `delta` auto-picks the arrow color.
