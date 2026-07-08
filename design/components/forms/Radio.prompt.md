**Radio / RadioGroup** — mutually exclusive choice. Wrap Radios in a RadioGroup to share `name` and selection.

```jsx
<RadioGroup name="turno" value={turno} onChange={e=>setTurno(e.target.value)} row>
  <Radio value="m" label="Mañana" />
  <Radio value="t" label="Tarde" />
</RadioGroup>
```

`row` lays options horizontally. Radio accepts `label` and `description`.
