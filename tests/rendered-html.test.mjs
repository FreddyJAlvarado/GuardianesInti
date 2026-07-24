import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renderiza la portada de Guardianes del Inti", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Guardianes del Inti \| Shooter cooperativo<\/title>/i);
  assert.match(html, /Dos guardianes/);
  assert.match(html, /Jueguen juntos/);
  assert.match(html, /Nueve mejoras implementadas/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
});

test("incluye los dos jugadores y el reparto de mejoras", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /SISA/);
  assert.match(html, /RUMI/);
  assert.match(html, /Freddy Javier Alvarado Cajas/);
  assert.match(html, /Brayan Rodriguez/);
  assert.match(html, /Reanimación cooperativa/);
  assert.match(html, /Power-ups ecuatorianos/);
});
