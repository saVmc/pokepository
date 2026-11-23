import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Particles from "./components/reactbits/particles/Particles";
import SiteNav from "./components/SiteNav";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Card from "./pages/Card";
import Set from "./pages/Set";
import Series from "./pages/Series";
import Pokemon from "./pages/Pokemon";

const DRAW = 1.4;
const FILL_DELAY = 0.2;
const FILL = Math.max(0.4, DRAW * 0.5);
const TITLE_MS = (DRAW + FILL_DELAY + FILL) * 1000;
const INTRO_MS = 1000;
const STARS_MS = Math.max(0, TITLE_MS - INTRO_MS);
const INTRO_KEY = "pokepository:intro-seen";

function App() {
  const [showStars, setShowStars] = useState(false);

  const [introSeen] = useState(() => {
    try {
      return localStorage.getItem(INTRO_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* storage blocked: every visit behaves as the first */
    }
  }, []);

  useEffect(() => {
    let starsTimer;
    const start = () => {
      starsTimer = setTimeout(() => setShowStars(true), STARS_MS);
    };
    if (document.fonts) document.fonts.ready.then(start);
    else start();
    return () => clearTimeout(starsTimer);
  }, []);

  return (
    <BrowserRouter>
      <div className="site-background">
        {showStars && (
          <Particles
            particleColors={["#f8f6a9", "#ffffff", "#ffffff"]}
            particleCount={200}
            particleSpread={10}
            speed={0.02}
            particleBaseSize={100}
            glow={0.5}
            twinkle={1}
            moveParticlesOnHover
            hoverEffect="parallax"
            sizeRandomness={1}
            shape="circle"
            depthOfField={0}
            connections={false}
            connectionDistance={110}
            particleHoverFactor={0.1}
            hoverRadius={140}
            drift="none"
            driftSpeed={1}
            alphaParticles={false}
            disableRotation={false}
            cameraDistance={20}
            variation={0}
            opacity={1}
            clickBurst={false}
            intro
            lightMode={false}
          />
        )}
      </div>

      <SiteNav introSeen={introSeen} />

      <Routes>
        <Route path="/" element={<Home introSeen={introSeen} />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/card/:id" element={<Card />} />
        <Route path="/set/:id" element={<Set />} />
        <Route path="/series/:id" element={<Series />} />
        <Route path="/pokemon/:dexId" element={<Pokemon />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
