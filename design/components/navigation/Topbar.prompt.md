**Topbar** — the app header paired with Sidebar. Holds page title/breadcrumb, global search, action icons and the user block.

```jsx
<Topbar
  lead={<Breadcrumb items={[…]} />}
  title="Estudiantes"
  actions={<><IconButton label="Notificaciones"><BellIcon/></IconButton></>}
  user={{ name:"Dir. Pérez", role:"Administrador", avatar:<Avatar name="Dir Pérez"/> }}
/>
```

`menuButton`/`onMenuClick` toggle the sidebar. `showSearch={false}` to hide search.
