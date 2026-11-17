import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

import IridescentLogo from "./IridescentLogo";
import source from "./pokepository-anim-vector.svg?raw";
import "./StrokeLogo.css";

const VIEW_BOX = /viewBox="([^"]+)"/.exec(source)?.[1] ?? "0 0 1024 1024";
const PATH = / d="([^"]+)"/.exec(source)?.[1] ?? "";

export default function StrokeLogo({
  strokeColor = "#a35ecf",
  strokeWidth = 13,
  fillColor = "#dfdfdf",
  drawDuration = 1.4,
  fillDelay = 0.2,
  swapDuration = 0.4,
  ease = "power2.out",
  className = "",
}) {
  const inkRef = useRef(null);
  const fillRef = useRef(null);
  const solidRef = useRef(null);

  useLayoutEffect(() => {
    const ink = inkRef.current;
    const fill = fillRef.current;
    const solid = solidRef.current;
    if (!ink || !fill || !solid) return undefined;

    const length = ink.getTotalLength();
    const fillDuration = Math.max(0.4, drawDuration * 0.5);
    const swapAt = drawDuration + fillDelay + fillDuration;
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      gsap.set(ink, {
        strokeDasharray: length,
        strokeDashoffset: 0,
        opacity: 0,
      });
      gsap.set(fill, { clipPath: "inset(0 0% 0 0)" });
      gsap.set(solid, { opacity: 0 });
      return undefined;
    }

    gsap.set(ink, {
      strokeDasharray: length,
      strokeDashoffset: length,
      opacity: 1,
    });
    gsap.set(fill, { clipPath: "inset(0 100% 0 0)" });
    gsap.set(solid, { opacity: 1 });

    const timeline = gsap.timeline();
    timeline.to(ink, { strokeDashoffset: 0, duration: drawDuration, ease }, 0);
    timeline.to(
      fill,
      {
        clipPath: "inset(0 0% 0 0)",
        duration: fillDuration,
        ease: "power2.inOut",
      },
      drawDuration + fillDelay,
    );
    timeline.to(
      [solid, ink],
      { opacity: 0, duration: swapDuration, ease: "power1.inOut" },
      swapAt,
    );

    return () => timeline.kill();
  }, [drawDuration, fillDelay, swapDuration, ease]);

  return (
    <span className={`stroke-logo${className ? ` ${className}` : ""}`.trim()}>
      <span ref={fillRef} className="stroke-logo__fill">
        <span className="stroke-logo__iridescent">
          <IridescentLogo />
        </span>
        <svg
          ref={solidRef}
          className="stroke-logo__solid"
          viewBox={VIEW_BOX}
          aria-hidden="true"
          focusable="false"
        >
          <path d={PATH} fill={fillColor} fillRule="evenodd" />
        </svg>
      </span>
      <svg
        className="stroke-logo__ink"
        viewBox={VIEW_BOX}
        aria-hidden="true"
        focusable="false"
      >
        <path
          ref={inkRef}
          d={PATH}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
