import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import "./other.css";

const TAIL = 3;

function CrumbBody({ item }) {
  return (
    <>
      {item.image && (
        <img
          className="crumb__image"
          src={item.image}
          onError={item.onImageError}
          alt=""
          loading="lazy"
          decoding="async"
        />
      )}
      <span className="crumb__label">{item.label}</span>
    </>
  );
}

export default function Breadcrumb({ items }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const trail = (items ?? []).filter(Boolean);
  if (trail.length === 0) return null;

  const parent = trail[trail.length - 2];
  const collapsed = trail.length > TAIL + 1;
  const hidden = collapsed ? trail.slice(1, -TAIL) : [];
  const entries = collapsed
    ? [trail[0], { ellipsis: true }, ...trail.slice(-TAIL)]
    : trail;

  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {parent?.to && (
        <Link
          to={parent.to}
          className="crumbs__back"
          aria-label={`Back to ${parent.label}`}
        >
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10.354 1.646a.5.5 0 0 1 0 .708L4.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
          </svg>
        </Link>
      )}

      <ol className="crumbs__list">
        {entries.map((entry, index) => (
          <li
            key={entry.ellipsis ? "ellipsis" : (entry.to ?? entry.label)}
            className="crumbs__item"
          >
            {index > 0 && (
              <span className="crumbs__sep" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
                  <path
                    d="M6 3.5 10.5 8 6 12.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            )}

            {entry.ellipsis ? (
              <span className="crumbs__menu" ref={menuRef}>
                <button
                  type="button"
                  className="crumbs__ellipsis"
                  aria-expanded={open}
                  aria-label="Show hidden levels"
                  onClick={() => setOpen((was) => !was)}
                >
                  …
                </button>
                {open && (
                  <ul className="crumbs__dropdown">
                    {hidden.map((item) => (
                      <li key={item.to ?? item.label}>
                        <Link
                          to={item.to}
                          className="crumbs__drop-link"
                          onClick={() => setOpen(false)}
                        >
                          <CrumbBody item={item} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </span>
            ) : entry.to ? (
              <Link to={entry.to} className="crumbs__link">
                <CrumbBody item={entry} />
              </Link>
            ) : (
              <span className="crumbs__current" aria-current="page">
                <CrumbBody item={entry} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
