// Selector de hijo persistente. Con >1 hijo, chips táctiles con el primer
// nombre; con 1 hijo, su nombre completo como subtítulo. La selección vive en
// el store del portal y se comparte entre las 5 páginas.
import { usePortalStore } from '../../stores/portal.store';
import { firstName } from './bits';
import type { PortalStudent } from './types';

export function ChildSelector({
  students,
  selected,
}: {
  students: PortalStudent[];
  selected: PortalStudent | null;
}) {
  const setSelected = usePortalStore((s) => s.setSelectedEnrollment);

  if (students.length <= 1) {
    if (!selected) return null;
    return (
      <div className="pt-childsingle">
        <b>{selected.fullName}</b> · {selected.sectionLabel} · {selected.levelName}
      </div>
    );
  }

  return (
    <div className="pt-childbar" role="tablist" aria-label="Elige a tu hijo">
      {students.map((st) => {
        const active = st.enrollmentId === selected?.enrollmentId;
        return (
          <button
            key={st.enrollmentId}
            type="button"
            role="tab"
            aria-selected={active}
            className={`pt-chip${active ? ' pt-chip--active' : ''}`}
            onClick={() => setSelected(st.enrollmentId)}
          >
            <span>{firstName(st.fullName)}</span>
            <span className="pt-chip__sub">{st.sectionLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
