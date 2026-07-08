**Toast / ToastStack** — transient confirmations (pago registrado, nota guardada). Render a `ToastStack` in a corner and map your queue to `Toast`s.

```jsx
<ToastStack position="bottom-right">
  {toasts.map(t => <Toast key={t.id} tone={t.tone} title={t.title} message={t.msg} onClose={()=>dismiss(t.id)} />)}
</ToastStack>
```

Presentational — you own the queue + auto-dismiss timers.
