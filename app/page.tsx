"use client";

import { useEffect, useRef, useState } from "react";
import type { GuardianesGameHandle } from "./game";

const improvements = [
  {
    owner: "Freddy",
    number: "01",
    title: "Impulso con enfriamiento",
    detail: "Dash breve, estela visual y barra de recarga para un movimiento más preciso.",
  },
  {
    owner: "Freddy",
    number: "02",
    title: "Daño legible",
    detail: "Vida individual, destello rojo, vibración de cámara e invulnerabilidad por escudo.",
  },
  {
    owner: "Freddy",
    number: "03",
    title: "Ataques anticipados",
    detail: "Círculos de aviso antes de cada aparición y onda visible del jefe final.",
  },
  {
    owner: "Freddy",
    number: "04",
    title: "Impacto audiovisual",
    detail: "Partículas, flashes, música generativa y efectos distintos para disparo, daño y victoria.",
  },
  {
    owner: "Freddy",
    number: "05",
    title: "Flujo completo",
    detail: "Tutorial integrado, pausa, objetivo por oleada y pantallas claras de victoria o derrota.",
  },
  {
    owner: "Brayan",
    number: "06",
    title: "Reanimación cooperativa",
    detail: "Un guardián puede recuperar al otro manteniéndose cerca durante dos segundos.",
  },
  {
    owner: "Brayan",
    number: "07",
    title: "Power-ups ecuatorianos",
    detail: "Cacao sanador, chuquiragua rápida y escudo de tagua con efectos temporales.",
  },
  {
    owner: "Brayan",
    number: "08",
    title: "Soporte para mandos",
    detail: "Dos gamepads con sticks, gatillo y dash, además de los controles de teclado.",
  },
  {
    owner: "Brayan",
    number: "09",
    title: "Curva de dificultad",
    detail: "Tres oleadas diferenciadas, enemigos pesados y jefe con pulso y refuerzos.",
  },
];

export default function Home() {
  const gameHost = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!gameHost.current) return;
    let cancelled = false;
    let handle: GuardianesGameHandle | undefined;

    void import("./game").then(async ({ createGuardianesGame }) => {
      if (cancelled || !gameHost.current) return;
      handle = await createGuardianesGame(gameHost.current, () => setReady(true));
    });

    return () => {
      cancelled = true;
      handle?.destroy();
    };
  }, []);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#juego" aria-label="Ir al juego">
          <span className="brand-mark">✦</span>
          <span>GUARDIANES DEL INTI</span>
        </a>
        <div className="topbar-meta">
          <span>SHOOTER CO-OP LOCAL</span>
          <span className="ecuador-pill">HECHO EN ECUADOR</span>
        </div>
      </header>

      <section className="hero" id="juego">
        <div className="hero-copy">
          <p className="eyebrow">LOS ANDES · AÑO 2146</p>
          <h1>Dos guardianes.<br />Un último amanecer.</h1>
          <p className="lede">
            Defiende el Núcleo del Inti de una sombra mecánica en un shooter
            cooperativo inspirado en volcanes, textiles y símbolos del Ecuador.
          </p>
        </div>
        <div className="mission-stamp" aria-label="Misión tres oleadas">
          <span>MISIÓN</span>
          <strong>03</strong>
          <span>OLEADAS</span>
        </div>
      </section>

      <section className="play-layout">
        <div className="game-frame">
          <div className="frame-labels" aria-hidden="true">
            <span>RESERVA ANDINA // SECTOR INTI</span>
            <span>COOPERATIVO 2P</span>
          </div>
          <div
            ref={gameHost}
            className="game-host"
            aria-busy={!ready}
            aria-label="Área del videojuego Guardianes del Inti"
          >
            {!ready && (
              <div className="loader">
                <span className="loader-sun" />
                <p>ENCENDIENDO EL NÚCLEO…</p>
              </div>
            )}
          </div>
        </div>

        <aside className="control-panel">
          <div>
            <p className="panel-kicker">CONTROLES</p>
            <h2>Jueguen juntos</h2>
          </div>
          <article className="player-card p1">
            <div>
              <span className="player-index">P1</span>
              <strong>SISA</strong>
            </div>
            <p><kbd>WASD</kbd> mover · <kbd>F</kbd> disparar · <kbd>G</kbd> impulso</p>
          </article>
          <article className="player-card p2">
            <div>
              <span className="player-index">P2</span>
              <strong>RUMI</strong>
            </div>
            <p><kbd>FLECHAS</kbd> mover · <kbd>K</kbd> disparar · <kbd>L</kbd> impulso</p>
          </article>
          <div className="gamepad-note">
            <span>◉</span>
            <p>También admite dos mandos: stick izquierdo para mover, derecho para apuntar.</p>
          </div>
          <div className="quick-actions">
            <a href="?legacy=1#juego">VER “ANTES”</a>
            <a className="primary-link" href="?legacy=0#juego">JUGAR VERSIÓN FINAL</a>
          </div>
          <p className="pause-note"><kbd>P</kbd> pausa · <kbd>R</kbd> reinicia al terminar</p>
        </aside>
      </section>

      <section className="brief-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">OBJETIVO DE LA MISIÓN</p>
            <h2>Protege la luz. Recupera los tres sellos.</h2>
          </div>
          <p>
            Superen tres oleadas, compartan los power-ups y permanezcan cerca:
            si un guardián cae, el otro puede reanimarlo antes de que termine la cuenta.
          </p>
        </div>
        <div className="feature-strip">
          <div><span>01</span><strong>CACAO</strong><small>recupera vida</small></div>
          <div><span>02</span><strong>CHUQUIRAGUA</strong><small>disparo rápido</small></div>
          <div><span>03</span><strong>TAGUA</strong><small>escudo temporal</small></div>
          <div><span>04</span><strong>SUPAY</strong><small>jefe del eclipse</small></div>
        </div>
      </section>

      <section className="improvements-section" id="mejoras">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MATRIZ DE PLAYTESTING</p>
            <h2>Nueve mejoras implementadas.</h2>
          </div>
          <p>
            Reparto acordado: cinco mejoras para Freddy Javier Alvarado Cajas y
            cuatro para Brayan Rodriguez.
          </p>
        </div>
        <div className="improvement-grid">
          {improvements.map((item) => (
            <article className="improvement-card" key={item.number}>
              <div className="improvement-meta">
                <span>{item.number}</span>
                <span>{item.owner}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <p>GUARDIANES DEL INTI · PROYECTO DE JUEGOS INTERACTIVOS</p>
        <p>Freddy Javier Alvarado Cajas · Brayan Rodriguez</p>
      </footer>
    </main>
  );
}
