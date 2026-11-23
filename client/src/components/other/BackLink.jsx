import { Link } from "react-router-dom";

import "./other.css";

export default function BackLink({ to, children }) {
  return (
    <Link to={to} className="back-link">
      <svg
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M10.354 1.646a.5.5 0 0 1 0 .708L4.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
      </svg>
      {children}
    </Link>
  );
}
