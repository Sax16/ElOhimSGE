import React from "react";

function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

const CSS = `
.esge-radiogroup{ display:flex; flex-direction:column; gap:10px; }
.esge-radiogroup--row{ flex-direction:row; flex-wrap:wrap; gap:16px; }
.esge-radio{ display:inline-flex; align-items:flex-start; gap:10px; cursor:pointer; font:var(--type-body); color:var(--text-body); }
.esge-radio--disabled{ cursor:not-allowed; opacity:.55; }
.esge-radio__dot{
  position:relative; flex-shrink:0; width:18px; height:18px; margin-top:1px;
  border:1.5px solid var(--border-strong); border-radius:var(--radius-full);
  background:var(--surface-card); display:inline-flex; align-items:center; justify-content:center;
  transition:border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard);
}
.esge-radio__native{ position:absolute; opacity:0; width:100%; height:100%; margin:0; cursor:inherit; }
.esge-radio__dot::after{ content:""; width:8px; height:8px; border-radius:var(--radius-full); background:var(--brand); transform:scale(0); transition:transform var(--duration-fast) var(--ease-out); }
.esge-radio__dot:has(.esge-radio__native:checked){ border-color:var(--brand); }
.esge-radio__dot:has(.esge-radio__native:checked)::after{ transform:scale(1); }
.esge-radio__dot:has(.esge-radio__native:focus-visible){ box-shadow:var(--shadow-focus); }
.esge-radio:hover .esge-radio__dot:has(.esge-radio__native:not(:disabled)){ border-color:var(--brand); }
.esge-radio__body{ display:flex; flex-direction:column; gap:2px; }
.esge-radio__desc{ font:var(--type-caption); color:var(--text-muted); }
`;

/** Single radio option. Usually rendered inside <RadioGroup>. */
export function Radio({ label, description, disabled = false, id, className = "", children, ...rest }) {
  useStyleOnce("esge-radio-css", CSS);
  const autoId = React.useId();
  const fieldId = id || autoId;
  return (
    <label className={["esge-radio", disabled ? "esge-radio--disabled" : "", className].filter(Boolean).join(" ")} htmlFor={fieldId}>
      <span className="esge-radio__dot">
        <input id={fieldId} type="radio" className="esge-radio__native" disabled={disabled} {...rest} />
      </span>
      {(label || description || children) && (
        <span className="esge-radio__body">
          {(label || children) && <span>{label || children}</span>}
          {description && <span className="esge-radio__desc">{description}</span>}
        </span>
      )}
    </label>
  );
}

/** Groups Radios, manages name + layout direction. */
export function RadioGroup({ name, value, onChange, row = false, className = "", children }) {
  useStyleOnce("esge-radio-css", CSS);
  return (
    <div role="radiogroup" className={["esge-radiogroup", row ? "esge-radiogroup--row" : "", className].filter(Boolean).join(" ")}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              name,
              checked: value !== undefined ? child.props.value === value : child.props.checked,
              onChange,
            })
          : child
      )}
    </div>
  );
}
