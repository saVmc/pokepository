"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import Iridescence from "./Iridescence";
import "./IridescentText.css";

const PAD_RATIO = 0.1;

export default function IridescentText({
  text = "",
  fontSize = 96,
  fontWeight = 800,
  fontFamily = "inherit",
  letterSpacing = -2,
  className = "",
  style,
  ...iridescence
}) {
  const measureRef = useRef(null);
  const [box, setBox] = useState(null);

  const maskId = `iridescent-text-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const characters = useMemo(() => Array.from(String(text ?? "")), [text]);

  const fontStyle = {
    fontFamily,
    fontSize: `${fontSize}px`,
    fontWeight,
    letterSpacing: `${letterSpacing}px`,
  };

  useLayoutEffect(() => {
    let cancelled = false;

    const measure = () => {
      if (cancelled || !measureRef.current) return;
      let bbox;
      try {
        bbox = measureRef.current.getBBox();
      } catch {
        return;
      }
      if (!bbox || !bbox.width) return;

      const pad = fontSize * PAD_RATIO;
      const next = {
        x: bbox.x - pad,
        y: bbox.y - pad,
        width: bbox.width + pad * 2,
        height: bbox.height + pad * 2,
      };

      setBox((prev) =>
        prev &&
        Math.abs(prev.x - next.x) < 0.5 &&
        Math.abs(prev.y - next.y) < 0.5 &&
        Math.abs(prev.width - next.width) < 0.5 &&
        Math.abs(prev.height - next.height) < 0.5
          ? prev
          : next,
      );
    };

    measure();
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [text, fontFamily, fontSize, fontWeight, letterSpacing]);

  const viewBox = box
    ? `${box.x} ${box.y} ${box.width} ${box.height}`
    : `0 ${-fontSize} 600 ${fontSize * 1.3}`;

  return (
    <span
      className={`iridescent-text${className ? ` ${className}` : ""}`.trim()}
      style={{ ...style, "--it-w": `${box ? box.width : 600}px` }}
      role="img"
      aria-label={text}
    >
      <svg className="iridescent-text__measure" aria-hidden="true">
        <text ref={measureRef} x="0" y="0" style={fontStyle}>
          {characters.map((char, index) => (
            <tspan key={`m-${index}`}>{char}</tspan>
          ))}
        </text>
      </svg>

      <svg
        className="iridescent-text__svg"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        style={box ? undefined : { visibility: "hidden" }}
      >
        <defs>
          <mask id={maskId}>
            <text x="0" y="0" fill="#fff" style={fontStyle}>
              {characters.map((char, index) => (
                <tspan key={`f-${index}`}>{char}</tspan>
              ))}
            </text>
          </mask>
        </defs>

        {box ? (
          <g mask={`url(#${maskId})`}>
            <foreignObject
              x={box.x}
              y={box.y}
              width={box.width}
              height={box.height}
            >
              <div className="iridescent-text__fill">
                <Iridescence {...iridescence} />
              </div>
            </foreignObject>
          </g>
        ) : null}
      </svg>
    </span>
  );
}
