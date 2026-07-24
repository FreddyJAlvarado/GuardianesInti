# Guardianes del Inti

Shooter cooperativo local para dos jugadores, desarrollado con Phaser 3 y
ambientado en una reserva andina futurista del Ecuador.

## Integrantes

- Freddy Javier Alvarado Cajas
- Brayan Rodriguez

## Cómo jugar

- P1: WASD para mover, F para disparar y G para impulso.
- P2: flechas para mover, K para disparar y L para impulso.
- Mandos: stick izquierdo para mover, derecho para apuntar, gatillo o A para
  disparar y B para impulso.
- P pausa la partida.
- R reinicia después de victoria o derrota.

El objetivo es superar tres oleadas, reanimar al compañero cuando caiga y
derrotar a la Máquina Supay.

## Desarrollo local

Requiere Node.js 22.13 o superior y pnpm.

```bash
pnpm install
pnpm dev
```

Compilación para producción:

```bash
pnpm build
```

Exportación estática para GitHub Pages:

```bash
pnpm build:github
```

## Evidencia de mejoras

- `?legacy=1`: modo "antes", sin las mejoras de playtesting.
- `?legacy=0`: versión final con las nueve mejoras.

La matriz 5/4, la bitácora, el guion del tráiler y la guía de entrega están en
la carpeta `docs`. El GDD final está en `output/pdf`.

## GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` compila y publica la carpeta
estática automáticamente. Después de subir el proyecto a un repositorio:

1. Abrir Settings > Pages.
2. Elegir GitHub Actions como fuente.
3. Ejecutar el workflow o hacer push a `main` o `master`.
4. Copiar el enlace público generado.
