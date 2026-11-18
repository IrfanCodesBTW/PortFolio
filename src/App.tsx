import { useState } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { useAmbientGround } from "@/hooks/useAmbientGround";

import { Grain } from "@/components/layout/Grain";
import { Cursor } from "@/components/layout/Cursor";
import { Nav } from "@/components/layout/Nav";
import { Ticker } from "@/components/layout/Ticker";

import { Preloader } from "@/components/preloader/Preloader";
import { Hero } from "@/components/hero/Hero";
import { Manifest } from "@/components/manifest/Manifest";
import { Work } from "@/components/work/Work";
import { Systems } from "@/components/systems/Systems";
import { Capabilities } from "@/components/capabilities/Capabilities";
import { Process } from "@/components/process/Process";
import { About } from "@/components/about/About";
import { Contact } from "@/components/contact/Contact";
import { Footer } from "@/components/footer/Footer";

export default function App() {
  const [entered, setEntered] = useState(false);
  const reduced = useReducedMotion();

  useSmoothScroll(!reduced);
  useAmbientGround();

  return (
    <>
      <a className="skip-link" href="#work">
        Skip to work
      </a>

      <Grain />
      <Cursor />
      <Nav />

      <main id="main">
        <Hero />
        <Manifest />
        <Work />
        <Ticker />
        <Capabilities />
        <Systems />
        <Process />
        <About />
        <Contact />
      </main>

      <Footer />

      {!entered ? <Preloader onDone={() => setEntered(true)} /> : null}
    </>
  );
}
