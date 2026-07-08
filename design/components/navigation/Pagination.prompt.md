**Pagination** — paging for long tables (estudiantes, pagos). Controlled; pass `total`+`pageSize` for the "Mostrando X–Y de Z" summary.

```jsx
<Pagination page={p} pageCount={24} onPageChange={setP} total={482} pageSize={20} />
```
