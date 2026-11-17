import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GooeyNav from "./reactbits/gooeynav/GooeyNav";
import Iridescence from "./reactbits/iridescence/Iridescence";

const ITEMS = [
  { label: "Home", to: "/" },
  { label: "Browse", to: "/browse" },
  { label: "hi", to: "/" },
];

export default function SiteNav({ introSeen = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolledPast, setScrolledPast] = useState(false);

  const active = Math.max(
    0,
    ITEMS.findIndex((item) => item.to === location.pathname),
  );

  const revealed = introSeen || location.pathname !== "/" || scrolledPast;

  useEffect(() => {
    const cue = document.getElementById("hero-nav-cue");
    if (!cue) return undefined;
    const observer = new IntersectionObserver(([entry]) =>
      setScrolledPast(entry.isIntersecting),
    );
    observer.observe(cue);
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <div className={`site-nav${revealed ? " is-revealed" : ""}`}>
      <GooeyNav
        items={ITEMS.map(({ label }) => ({ label }))}
        activeIndex={active}
        onChange={(index) => navigate(ITEMS[index].to)}
        theme="dark"
        size="md"
        frame
        color="#8b769f"
        particleCount={10}
        spread={34}
        animationTime={600}
        timeVariance={100}
        gooeyness={0.6}
        wobble={0.45}
        hoverEffect
        fill={<Iridescence color="#8b769f" speed={0.5} scale={2} />}
      />
    </div>
  );
}
