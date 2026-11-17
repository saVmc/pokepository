import { useState, useEffect } from "react";
import Particles from "./components/reactbits/particles/Particles";
import StrokeText from "./components/reactbits/stroketext/StrokeText";
import IridescentLogo from "./components/reactbits/holologo/IridescentLogo";
import IridescentText from "./components/reactbits/iridescence/IridescentText";
import CircularCarousel from "./components/reactbits/carousel/CircularCarousel";
import SpecularButton from "./components/reactbits/specularbutton/SpecularButton";

const DRAW = 1.4;
const TITLE_FONT_SIZE = 96;
const TITLE_LETTER_SPACING = -2;
const FILL_DELAY = 0.2;
const FILL = Math.max(0.4, DRAW * 0.5);
const TITLE_MS = (DRAW + FILL_DELAY + FILL) * 1000;
const INTRO_MS = 1000;

const CARD_ASPECT = 63 / 88;

const tcgdex = (set, number, lang = "en") =>
  `https://assets.tcgdex.net/${lang}/${set}/${number}/high.png`;

const SHOWCASE_CARDS = [
  {
    src: tcgdex("me/me04", "088"),
    alt: "Froakie",
    title: "Froakie",
    subtitle: "Chaos Rising",
  },
  {
    src: tcgdex("sv/sv03.5", "166"),
    alt: "Bulbasaur",
    title: "Bulbasaur",
    subtitle: "151",
  },
  {
    src: tcgdex("xy/xy12", "100"),
    alt: "M Venusaur EX",
    title: "M Venusaur EX",
    subtitle: "Evolutions",
  },
  {
    src: tcgdex("swsh/swsh7", "215"),
    alt: "Umbreon VMAX",
    title: "Umbreon VMAX",
    subtitle: "Evolving Skies",
  },
  {
    src: tcgdex("sv/sv04.5", "233"),
    alt: "Gardevoir",
    title: "Gardevoir",
    subtitle: "Paldean Fates",
  },
  {
    src: tcgdex("sv/sv03.5", "181"),
    alt: "Dragonair",
    title: "Dragonair",
    subtitle: "151",
  },
  {
    src: tcgdex("ex/ex3", "97"),
    alt: "Rayquaza ex",
    title: "Rayquaza ex",
    subtitle: "Dragon",
  },
  {
    src: tcgdex("sm/sm12", "241"),
    alt: "Pikachu",
    title: "Pikachu",
    subtitle: "Cosmic Eclipse",
  },
];
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
            clickBurst={false}
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
              <p className="hero__line hero__line--c">
                Try it today, no login required.
              </p>
            </div>
            <div className="hero__cta">
              <SpecularButton
                size="lg"
                radius={18}
                tint="#7de7e2"
                tintOpacity={0.06}
                textColor="#f5f5f5"
                lineColor="#c47ddd"
                baseColor="#637383"
                proximity={260}
              >
                Get Started
              </SpecularButton>
            </div>
          </div>
          <div className="hero__card">
            <CircularCarousel
              items={SHOWCASE_CARDS}
              preset="cylinder"
              intro="spin"
              cardWidth={230}
              aspectRatio={CARD_ASPECT}
              curve={0}
              gap={78}
              autoplay="step"
              interval={2.5}
              speed={10}
              tilt={-8}
              perspective={3200}
              momentum={0.42}
              parallax={0.34}
              stretch={0.38}
              frontScale={0.62}
              frontFalloff={40}
              cornerRadius={12}
              fadeColor="#04090f"
              captions
            />
          </div>
        </section>
      </div>
    </>
  );
}

export default App;
