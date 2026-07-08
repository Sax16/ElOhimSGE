**Avatar / AvatarGroup** — student/teacher/user image with initials fallback and presence status.

```jsx
<Avatar name="María Quispe" status="online" />
<Avatar src="/foto.jpg" name="José Ramos" size="lg" />
<AvatarGroup max={3}>{users.map(u=><Avatar name={u.name}/>)}</AvatarGroup>
```

Sizes: xs·sm·md·lg·xl or a number. Status: online·busy·away·offline.
