# Bitácora de playtesting - Guardianes del Inti

## Metodología

Cada integrante realizó tres corridas consecutivas de forma individual y sin
recibir indicaciones del compañero. Los hallazgos se consolidaron después de
terminar las seis corridas. Para comparar el estado inicial con el resultado se
utilizó `?legacy=1` como versión anterior y `?legacy=0` como versión final.

## Freddy Javier Alvarado Cajas

### Corrida 1 - Estados de vida y salud

- Fecha y hora: 23/07/2026, 14:30
- Duración: 10 minutos
- ¿Llegó al jefe final?: Sí
- Problemas de movimiento o disparo: Ninguno.
- Problemas de interfaz: El HUD de Rumi (P2) dibujaba la barra de vida fuera de
  su panel y la reducía en una dirección incoherente con su ubicación a la
  derecha. Tampoco se distinguían claramente los estados normal, herido,
  crítico, caído y fuera de combate.
- Problemas visuales o de audio: Al llegar a cero puntos, la barra desaparecía
  sin comunicar con texto cuánto tiempo quedaba para reanimar al jugador.
- Bug reproducible y pasos: Iniciar la partida, permitir que Rumi reciba daño y
  observar su HUD superior derecho. La barra sobrepasaba el borde del panel y,
  al caer, no mostraba el estado ni la cuenta regresiva.
- Mejora prioritaria: Corregir la orientación de la barra de P2, mantenerla
  dentro del panel y añadir estados textuales de salud con progreso de
  reanimación.
- Solución aplicada: La barra de Rumi quedó anclada al borde derecho y se reduce
  de derecha a izquierda. Ambos HUD muestran `VIDA`, `HERIDA`, `CRÍTICA`,
  `CAÍDO/A` con segundos restantes y `FUERA`. Cuando un jugador está caído, la
  barra amarilla representa el progreso de reanimación.
- Evidencia técnica: `app/game.ts`, método `updateHud`.

### Corrida 2 - Movimiento y lectura del daño

- Fecha y hora: 23/07/2026, 15:00
- Duración: 9 minutos
- ¿Llegó al jefe final?: No; la corrida terminó en la segunda oleada.
- Problemas de movimiento o disparo: No existía una maniobra rápida para salir
  de grupos de enemigos.
- Problemas de interfaz: La recarga de una acción evasiva no era visible.
- Problemas visuales o de audio: Recibir daño tenía poco impacto y podía pasar
  inadvertido durante la acción.
- Bug reproducible y pasos: Rodear a un guardián durante la segunda oleada; sin
  una salida rápida, varios impactos consecutivos reducían la vida sin suficiente
  retroalimentación.
- Mejora prioritaria: Añadir impulso con enfriamiento y reforzar la lectura del
  daño.
- Solución aplicada: Impulso breve con estela, barra de recarga, destello rojo,
  vibración de cámara y color de vida según el nivel de riesgo.
- Evidencia técnica: Teclas `G` y `L`; barra inferior de cada HUD.

### Corrida 3 - Anticipación y cierre de partida

- Fecha y hora: 23/07/2026, 15:25
- Duración: 12 minutos
- ¿Llegó al jefe final?: Sí
- Problemas de movimiento o disparo: Las apariciones enemigas sorprendían al
  jugador sin tiempo suficiente para reaccionar.
- Problemas de interfaz: Faltaban mensajes claros para pausa, victoria, derrota
  y reinicio.
- Problemas visuales o de audio: Los disparos, bajas y cambios de oleada se
  sentían planos.
- Bug reproducible y pasos: Permanecer cerca de un punto de aparición; un
  enemigo podía entrar directamente en contacto sin aviso previo.
- Mejora prioritaria: Anticipar ataques y completar el flujo audiovisual.
- Solución aplicada: Círculos de advertencia, onda visible del jefe, partículas,
  efectos sintetizados, tutorial, pausa y pantallas finales con reinicio.
- Evidencia técnica: Avisos coral, tecla `P` y tecla `R`.

## Brayan Rodriguez

### Corrida 1 - Cooperación y reanimación

- Fecha y hora: 24/07/2026, 10:00
- Duración: 8 minutos
- ¿Llegó al jefe final?: No; la corrida terminó en la segunda oleada.
- Problemas de cooperación: Cuando un jugador perdía toda la vida, el compañero
  no tenía una acción cooperativa para recuperarlo.
- Problemas de dificultad: La caída de un jugador convertía rápidamente la
  partida en derrota.
- Problemas con teclado o mando: Ninguno durante esta corrida.
- Bug reproducible y pasos: Dejar caer a Sisa y acercar a Rumi; no aparecía una
  interacción cooperativa.
- Mejora prioritaria: Implementar reanimación por proximidad.
- Solución aplicada: El compañero puede permanecer cerca durante 2,1 segundos
  para reanimar. Se añadió anillo de progreso, cuenta de 9 segundos y retorno con
  48 puntos de vida.
- Evidencia técnica: Sistema `updateRevives` y estado `downed`.

### Corrida 2 - Variedad táctica y controles

- Fecha y hora: 24/07/2026, 10:25
- Duración: 11 minutos
- ¿Llegó al jefe final?: Sí
- Problemas de cooperación: Ambos jugadores repetían la misma estrategia y no
  podían repartir recursos.
- Problemas de dificultad: Recuperarse después de varios impactos era difícil.
- Problemas con teclado o mando: La versión inicial dependía solamente del
  teclado.
- Bug reproducible y pasos: Conectar dos mandos; no existía una asignación
  completa para movimiento, apuntado, disparo e impulso.
- Mejora prioritaria: Añadir recursos tácticos y soporte para dos mandos.
- Solución aplicada: Cacao para recuperar vida, chuquiragua para disparo rápido,
  tagua como escudo temporal y controles independientes mediante Gamepad API.
- Evidencia técnica: Objetos `heal`, `rapid`, `shield` y mandos 1/2.

### Corrida 3 - Curva de dificultad y jefe final

- Fecha y hora: 24/07/2026, 10:50
- Duración: 13 minutos
- ¿Llegó al jefe final?: Sí
- Problemas de cooperación: La versión inicial no exigía suficiente coordinación
  al final de la partida.
- Problemas de dificultad: Las oleadas se sentían similares y no había una
  culminación diferenciada.
- Problemas con teclado o mando: Ninguno.
- Bug reproducible y pasos: Completar varias oleadas; la presión y los patrones
  enemigos cambiaban muy poco.
- Mejora prioritaria: Construir una curva progresiva y un jefe reconocible.
- Solución aplicada: Tres oleadas con mayor cantidad de amenazas, enemigos
  pesados y la Máquina Supay con onda expansiva y refuerzos.
- Evidencia técnica: Sistema de oleadas, taladros y jefe `boss`.

## Consenso del equipo

Los hallazgos repetidos y priorizados fueron:

1. La vida de P2 y los estados de salud necesitaban una lectura simétrica,
   explícita y contenida dentro del panel.
2. El movimiento requería una opción evasiva y los impactos mayor respuesta
   audiovisual.
3. Las apariciones y ataques fuertes debían anticiparse para evitar daño injusto.
4. La cooperación necesitaba reanimación, recursos compartibles y controles para
   dos mandos.
5. La dificultad debía crecer por oleadas y culminar con un jefe final claro.

## Matriz de mejoras implementadas

| # | Responsable | Hallazgo | Mejora implementada | Comprobación |
|---|-------------|----------|----------------------|--------------|
| 1 | Freddy | Escape limitado | Impulso con enfriamiento | Teclas G/L y barra inferior |
| 2 | Freddy | Salud y daño poco legibles | HUD simétrico, estados y respuesta al impacto | Barras, texto, flash y vibración |
| 3 | Freddy | Apariciones injustas | Avisos de aparición y ataques anticipados | Círculos coral y onda del jefe |
| 4 | Freddy | Poco impacto audiovisual | Partículas y sonidos diferenciados | Disparo, daño, baja y victoria |
| 5 | Freddy | Flujo incompleto | Tutorial, pausa, victoria y derrota | Menú, P y R |
| 6 | Brayan | Cooperación superficial | Reanimación por proximidad | Anillo durante 2,1 segundos |
| 7 | Brayan | Poca variedad táctica | Power-ups ecuatorianos | Cacao, chuquiragua y tagua |
| 8 | Brayan | Solo teclado | Compatibilidad con dos mandos | Sticks, gatillo/A y botón B |
| 9 | Brayan | Dificultad plana | Tres oleadas y jefe final | Taladros, Supay, pulso y refuerzos |

## Resultado final

Las nueve mejoras están implementadas en la versión final. La corrección del HUD
de salud se verificó junto con la compilación estática, TypeScript y las pruebas
automatizadas. El juego está publicado en:

<https://freddyjalvarado.github.io/GuardianesInti/>
