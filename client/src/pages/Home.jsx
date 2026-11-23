import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StrokeText from "../components/reactbits/stroketext/StrokeText";
import StrokeLogo from "../components/reactbits/holologo/StrokeLogo";
import IridescentText from "../components/reactbits/iridescence/IridescentText";
import CircularCarousel from "../components/reactbits/carousel/CircularCarousel";
import SpecularButton from "../components/reactbits/specularbutton/SpecularButton";

const DRAW = 1.4;
const TITLE_FONT_SIZE = 96;
const TITLE_LETTER_SPACING = -2;
const FILL_DELAY = 0.2;
const FILL = Math.max(0.4, DRAW * 0.5);
const TITLE_MS = (DRAW + FILL_DELAY + FILL) * 1000;

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

const SCROLL_CUE_MS = 4000;
const SCROLL_EPSILON = 8;

export default function Home({ introSeen = false }) {
  const [titleFilled, setTitleFilled] = useState(false);
  const [showCue, setShowCue] = useState(false);
  const runwayRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!introSeen) return undefined;
    const runway = runwayRef.current;
    if (!runway) return undefined;
    window.scrollTo(0, Math.max(0, runway.offsetHeight - window.innerHeight));
    return undefined;
  }, [introSeen]);

  useEffect(() => {
    if (introSeen) return undefined;
    const timer = setTimeout(() => {
      if (window.scrollY <= SCROLL_EPSILON) setShowCue(true);
    }, SCROLL_CUE_MS);

    const onScroll = () => {
      if (window.scrollY <= SCROLL_EPSILON) return;
      clearTimeout(timer);
      setShowCue(false);
      window.removeEventListener("scroll", onScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [introSeen]);

  useEffect(() => {
    let titleTimer;
    const start = () => {
      titleTimer = setTimeout(() => setTitleFilled(true), TITLE_MS);
    };
    if (document.fonts) document.fonts.ready.then(start);
    else start();
    return () => clearTimeout(titleTimer);
  }, []);

  return (
    <div className="hero-scroll" ref={runwayRef}>
      <div id="hero-nav-cue" className="hero__nav-cue" aria-hidden="true" />
      <section className="hero">
        <div className="hero__text">
          <div className="hero__brand">
            <div className="hero__logo">
              <StrokeLogo
                strokeColor="#a35ecf"
                drawDuration={DRAW}
                fillDelay={FILL_DELAY}
              />
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
                    scale={2}
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
              Try it today, no login required. We won't steal your data, though,
              we promise :)
            </p>
          </div>
          <div className="hero__cta">
            <SpecularButton
              size="lg"
              radius={18}
              tint="#a35ecf"
              tintOpacity={0.06}
              textColor="#f5f5f5"
              lineColor="#c47ddd"
              baseColor="#5b4b6b"
              proximity={260}
              onClick={() => navigate("/browse")}
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
        {showCue && (
          <div className="hero__scroll-cue" aria-hidden="true">
            <span>Scroll</span>
            <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
              />
            </svg>
          </div>
        )}
      </section>
    </div>
  );
}
