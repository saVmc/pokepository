import { useState, useEffect } from "react";
import Particles from "./components/reactbits/particles/Particles";
import HoloCard from "./components/reactbits/holocard/HoloCard";
import StrokeText from "./components/reactbits/stroketext/StrokeText";
import IridescentLogo from "./components/reactbits/holologo/IridescentLogo";
import IridescentText from "./components/reactbits/iridescence/IridescentText";

const DRAW = 1.4;
const TITLE_FONT_SIZE = 96;
const TITLE_LETTER_SPACING = -2;
const FILL_DELAY = 0.2;
const FILL = Math.max(0.4, DRAW * 0.5);
const TITLE_MS = (DRAW + FILL_DELAY + FILL) * 1000;
const INTRO_MS = 1000;
const STARS_MS = Math.max(0, TITLE_MS - INTRO_MS);

function App() {
  const [showStars, setShowStars] = useState(false);
  const [titleFilled, setTitleFilled] = useState(false);
  useEffect(() => {
    let starsTimer;
    let titleTimer;
    const start = () => {
      starsTimer = setTimeout(() => setShowStars(true), STARS_MS);
      titleTimer = setTimeout(() => setTitleFilled(true), TITLE_MS);
    };
    if (document.fonts) document.fonts.ready.then(start);
    else start();
    return () => {
      clearTimeout(starsTimer);
      clearTimeout(titleTimer);
    };
  }, []);

  return (
    <>
      <favicon rel="icon" href="/favicon.ico" />
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
            clickBurst={true}
            intro
            lightMode={false}
          />
        )}
      </div>
      <div className="hero-scroll">
        <section className="hero">
          <div className="hero__text">
            <div className="hero__brand">
              <div className="hero__logo">
                <IridescentLogo />
              </div>
              <h1 className="hero__title" aria-label="Poképository">
                <span className="hero__swap">
                  <span
                    className={`hero__swap-layer${titleFilled ? " is-out" : ""}`}
                    aria-hidden="true"
                  >
                    <StrokeText
                      text="Poképository"
                      strokeColor="#a35ecf"
                      fillColor="currentColor"
                      fontSize={TITLE_FONT_SIZE}
                      strokeWidth={1.2}
                      letterSpacing={TITLE_LETTER_SPACING}
                      drawDuration={DRAW}
                      fillDelay={FILL_DELAY}
                      trigger="mount"
                    />
                  </span>
                  <span
                    className={`hero__swap-layer${titleFilled ? "" : " is-out"}`}
                    aria-hidden="true"
                  >
                    <IridescentText
                      text="Poképository"
                      fontSize={TITLE_FONT_SIZE}
                      letterSpacing={TITLE_LETTER_SPACING}
                      color="#8b769f"
                      speed={0.5}
                    />
                  </span>
                </span>
              </h1>
            </div>
            <div className="hero__lines">
              <p className="hero__line hero__line--a">Hi</p>
              <p className="hero__line hero__line--b">
                Every card you own, now in one place :D
              </p>
              <p className="hero__line hero__line--c">Coming soon...</p>
            </div>
          </div>
          <div className="hero__card">
            <HoloCard
              image="https://assets.tcgdex.net/en/me/me05/094/high.png"
              alt="M Venusaur EX"
              preset="rainbow"
              width={320}
            />
          </div>
        </section>
      </div>
    </>
  );
}

export default App;
