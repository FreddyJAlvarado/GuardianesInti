from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Flowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "GDD_Guardianes_del_Inti.pdf"
PAGE_W, PAGE_H = A4

NAVY = colors.HexColor("#071528")
NAVY_2 = colors.HexColor("#102A3D")
INK = colors.HexColor("#132334")
PAPER = colors.HexColor("#F5F0E2")
SUN = colors.HexColor("#FFD23F")
CORAL = colors.HexColor("#F04B67")
AQUA = colors.HexColor("#4ECDC4")
SKY = colors.HexColor("#49CBED")
MUTED = colors.HexColor("#6E8790")
LINE = colors.HexColor("#D7E1DD")
WHITE = colors.white


def register_fonts():
    regular = Path("C:/Windows/Fonts/arial.ttf")
    bold = Path("C:/Windows/Fonts/arialbd.ttf")
    if regular.exists() and bold.exists():
        pdfmetrics.registerFont(TTFont("GDD-Regular", str(regular)))
        pdfmetrics.registerFont(TTFont("GDD-Bold", str(bold)))
        return "GDD-Regular", "GDD-Bold"
    return "Helvetica", "Helvetica-Bold"


FONT, FONT_BOLD = register_fonts()


class ChakanaLogo(Flowable):
    def __init__(self, size=110):
        super().__init__()
        self.width = size
        self.height = size
        self.size = size

    def draw(self):
        c = self.canv
        s = self.size
        c.saveState()
        c.translate(s / 2, s / 2)
        c.setFillColor(NAVY_2)
        c.circle(0, 0, s * 0.47, fill=1, stroke=0)
        c.setStrokeColor(SUN)
        c.setLineWidth(4)
        c.circle(0, 0, s * 0.34, fill=0, stroke=1)
        c.setFillColor(CORAL)
        arm = s * 0.12
        length = s * 0.39
        for angle in (0, 90, 180, 270):
            c.saveState()
            c.rotate(angle)
            c.rect(-arm / 2, s * 0.30, arm, length - s * 0.30, fill=1, stroke=0)
            c.restoreState()
        c.setFillColor(AQUA)
        c.rotate(45)
        c.rect(-s * 0.12, -s * 0.12, s * 0.24, s * 0.24, fill=1, stroke=0)
        c.restoreState()


class ArenaMap(Flowable):
    def __init__(self, width=480, height=280):
        super().__init__()
        self.width = width
        self.height = height

    def draw(self):
        c = self.canv
        w, h = self.width, self.height
        c.saveState()
        c.setFillColor(NAVY)
        c.roundRect(0, 0, w, h, 12, fill=1, stroke=0)
        c.setStrokeColor(AQUA)
        c.setLineWidth(2)
        c.roundRect(10, 10, w - 20, h - 20, 10, fill=0, stroke=1)

        c.setFillColor(SUN)
        c.circle(w / 2, h / 2, 28, fill=0, stroke=0)
        c.setStrokeColor(SUN)
        c.setLineWidth(4)
        c.circle(w / 2, h / 2, 25, fill=0, stroke=1)
        c.setFont(FONT_BOLD, 8)
        c.drawCentredString(w / 2, h / 2 - 4, "INTI")

        c.setFillColor(SUN)
        c.circle(w * 0.34, h * 0.52, 8, fill=1, stroke=0)
        c.setFillColor(SKY)
        c.circle(w * 0.66, h * 0.52, 8, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont(FONT_BOLD, 7)
        c.drawCentredString(w * 0.34, h * 0.52 - 3, "P1")
        c.drawCentredString(w * 0.66, h * 0.52 - 3, "P2")

        spawn_points = [
            (w * 0.18, h * 0.18),
            (w * 0.50, h * 0.15),
            (w * 0.82, h * 0.20),
            (w * 0.86, h * 0.70),
            (w * 0.50, h * 0.84),
            (w * 0.14, h * 0.68),
        ]
        c.setStrokeColor(CORAL)
        c.setFillColor(CORAL)
        for x, y in spawn_points:
            c.circle(x, y, 8, fill=0, stroke=1)
            c.line(x - 5, y, x + 5, y)
            c.line(x, y - 5, x, y + 5)

        c.setFont(FONT, 7)
        c.setFillColor(colors.HexColor("#B8D7DD"))
        c.drawString(20, h - 26, "ZONAS DE APARICIÓN")
        c.drawRightString(w - 20, h - 26, "ARENA ÚNICA - 16:9")

        c.setStrokeColor(colors.HexColor("#35576A"))
        c.setLineWidth(1)
        c.setDash(3, 3)
        c.line(w * 0.34, h * 0.52, w / 2 - 30, h / 2)
        c.line(w * 0.66, h * 0.52, w / 2 + 30, h / 2)
        c.restoreState()


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        "SectionTag",
        fontName=FONT_BOLD,
        fontSize=8,
        leading=10,
        textColor=CORAL,
        spaceAfter=7,
        tracking=2,
    )
)
styles.add(
    ParagraphStyle(
        "PageTitle",
        fontName=FONT_BOLD,
        fontSize=27,
        leading=29,
        textColor=INK,
        spaceAfter=16,
    )
)
styles.add(
    ParagraphStyle(
        "Subhead",
        fontName=FONT_BOLD,
        fontSize=15,
        leading=18,
        textColor=NAVY_2,
        spaceBefore=9,
        spaceAfter=7,
    )
)
styles.add(
    ParagraphStyle(
        "BodyTextGDD",
        fontName=FONT,
        fontSize=9.5,
        leading=14,
        textColor=INK,
        spaceAfter=7,
    )
)
styles.add(
    ParagraphStyle(
        "Small",
        fontName=FONT,
        fontSize=7.5,
        leading=10,
        textColor=MUTED,
    )
)
styles.add(
    ParagraphStyle(
        "SmallBold",
        fontName=FONT_BOLD,
        fontSize=7.5,
        leading=10,
        textColor=INK,
    )
)
styles.add(
    ParagraphStyle(
        "TableHeader",
        fontName=FONT_BOLD,
        fontSize=7.2,
        leading=8.5,
        textColor=WHITE,
    )
)
styles.add(
    ParagraphStyle(
        "Callout",
        fontName=FONT_BOLD,
        fontSize=12,
        leading=17,
        textColor=NAVY_2,
        borderColor=AQUA,
        borderWidth=1,
        borderPadding=11,
        backColor=colors.HexColor("#EAF5F1"),
        spaceBefore=8,
        spaceAfter=12,
    )
)


def P(text, style="BodyTextGDD"):
    return Paragraph(text, styles[style])


def section(tag, title):
    return [
        P(tag.upper(), "SectionTag"),
        P(title, "PageTitle"),
    ]


def bullet(text):
    return Paragraph(
        f"<font color='#F04B67'>●</font> {text}",
        ParagraphStyle(
            "bullet-inline",
            parent=styles["BodyTextGDD"],
            leftIndent=11,
            firstLineIndent=-10,
            spaceAfter=5,
        ),
    )


def info_table(rows, widths, header=True, font_size=8):
    normalized = []
    for row_index, row in enumerate(rows):
        normalized.append(
            [
                cell
                if isinstance(cell, Flowable)
                else P(
                    str(cell),
                    "TableHeader"
                    if row_index == 0 and header
                    else "Small",
                )
                for cell in row
            ]
        )
    table = Table(normalized, colWidths=widths, repeatRows=1 if header else 0)
    commands = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.55, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("FONTNAME", (0, 0), (-1, -1), FONT),
        ("FONTSIZE", (0, 0), (-1, -1), font_size),
    ]
    if header:
        commands.extend(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY_2),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTNAME", (0, 0), (-1, 0), FONT_BOLD),
            ]
        )
    for row_index in range(1 if header else 0, len(rows)):
        if row_index % 2 == 0:
            commands.append(
                ("BACKGROUND", (0, row_index), (-1, row_index), colors.HexColor("#F3F7F5"))
            )
    table.setStyle(TableStyle(commands))
    return table


def draw_cover(c, doc):
    c.saveState()
    if doc.page == 1:
        c.setFillColor(NAVY)
        c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        c.setFillColor(NAVY_2)
        c.circle(PAGE_W * 0.86, PAGE_H * 0.80, 145, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#153D59"))
        c.circle(PAGE_W * 0.86, PAGE_H * 0.80, 102, fill=1, stroke=0)
        c.setStrokeColor(SUN)
        c.setLineWidth(4)
        c.circle(PAGE_W * 0.86, PAGE_H * 0.80, 65, fill=0, stroke=1)
        for angle in range(0, 360, 30):
            c.saveState()
            c.translate(PAGE_W * 0.86, PAGE_H * 0.80)
            c.rotate(angle)
            c.setStrokeColor(CORAL if angle % 60 else AQUA)
            c.line(73, 0, 103, 0)
            c.restoreState()

        c.setFillColor(AQUA)
        c.setFont(FONT_BOLD, 9)
        c.drawString(2.3 * cm, PAGE_H - 2.2 * cm, "GAME DESIGN DOCUMENT  /  VERSIÓN FINAL 1.1")
        c.setFillColor(PAPER)
        c.setFont(FONT_BOLD, 42)
        c.drawString(2.3 * cm, PAGE_H - 8.6 * cm, "GUARDIANES")
        c.drawString(2.3 * cm, PAGE_H - 10.3 * cm, "DEL INTI")
        c.setFillColor(SUN)
        c.rect(2.3 * cm, PAGE_H - 11.15 * cm, 4.7 * cm, 0.12 * cm, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#B8D7DD"))
        c.setFont(FONT, 12)
        c.drawString(2.3 * cm, PAGE_H - 12.3 * cm, "Shooter cooperativo local inspirado en el Ecuador")

        c.setFillColor(WHITE)
        c.setFont(FONT_BOLD, 10)
        c.drawString(2.3 * cm, 5.1 * cm, "INTEGRANTES")
        c.setFont(FONT, 10)
        c.setFillColor(colors.HexColor("#B8D7DD"))
        c.drawString(2.3 * cm, 4.55 * cm, "Freddy Javier Alvarado Cajas")
        c.drawString(2.3 * cm, 4.05 * cm, "Brayan Rodriguez")
        c.setFillColor(MUTED)
        c.setFont(FONT, 8)
        c.drawString(2.3 * cm, 2.2 * cm, "Materia: Juegos Interactivos  |  Motor: Phaser 3  |  2026")
    else:
        c.setFillColor(WHITE)
        c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        c.setFillColor(NAVY)
        c.rect(0, PAGE_H - 1.1 * cm, PAGE_W, 1.1 * cm, fill=1, stroke=0)
        c.setFillColor(SUN)
        c.rect(1.8 * cm, PAGE_H - 1.1 * cm, 2.3 * cm, 0.08 * cm, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont(FONT_BOLD, 7)
        c.drawString(1.8 * cm, PAGE_H - 0.72 * cm, "GUARDIANES DEL INTI")
        c.setFillColor(MUTED)
        c.setFont(FONT, 7)
        c.drawRightString(PAGE_W - 1.8 * cm, 0.75 * cm, f"GDD  |  {doc.page:02d}")
        c.setStrokeColor(LINE)
        c.line(1.8 * cm, 1.05 * cm, PAGE_W - 1.8 * cm, 1.05 * cm)
    c.restoreState()


story = [Spacer(1, 23 * cm), PageBreak()]

story += section("01 / Visión", "Resumen ejecutivo")
story += [
    P(
        "Guardianes del Inti es un shooter de acción cooperativa local para dos "
        "personas. Sisa y Rumi defienden una reserva andina futurista de una "
        "sombra mecánica que intenta apagar el Núcleo del Inti durante un eclipse."
    ),
    P(
        "La experiencia está diseñada para sesiones breves de 6 a 10 minutos, "
        "con controles accesibles, lectura inmediata del peligro y decisiones que "
        "obligan a permanecer cerca del compañero."
    ),
    Spacer(1, 6),
    P("Propuesta de valor", "Subhead"),
    bullet("<b>Cooperación visible:</b> los jugadores comparten el objetivo y pueden reanimarse."),
    bullet("<b>Identidad ecuatoriana:</b> páramo, volcanes, textiles, Inti y materiales como tagua y cacao."),
    bullet("<b>Partidas completas:</b> tres oleadas, escalada de dificultad y jefe final."),
    bullet("<b>Evidencia académica:</b> modo antes y versión final para demostrar nueve mejoras."),
    P(
        "Público objetivo: estudiantes y jugadores casuales desde 10 años que "
        "buscan una experiencia local rápida para compartir teclado o dos mandos.",
        "Callout",
    ),
    P("Pilares de diseño", "Subhead"),
    info_table(
        [
            ["Pilar", "Aplicación"],
            ["Juntos o nunca", "La reanimación y la distribución de amenazas premian la cercanía."],
            ["Peligro justo", "Las apariciones y el pulso del jefe se anticipan visualmente."],
            ["Ecuador futurista", "Los referentes culturales se integran con respeto y sin caricaturización."],
        ],
        [4.1 * cm, 11.5 * cm],
    ),
    PageBreak(),
]

story += section("02 / Narrativa", "Historia y mundo")
story += [
    P(
        "Año 2146. Tras décadas de restauración ecológica, las comunidades de los "
        "Andes alimentan sus ciudades con núcleos solares inspirados en calendarios "
        "ancestrales. El más antiguo, el Núcleo del Inti, protege una reserva de páramo."
    ),
    P(
        "Durante un eclipse aparece la Máquina Supay, un artefacto de extracción "
        "autónoma que convierte la energía del valle en drones de sombra. Si completa "
        "tres ciclos, el núcleo quedará apagado y la reserva perderá su equilibrio."
    ),
    P("Conflicto principal", "Subhead"),
    P(
        "Sisa y Rumi, jóvenes guardianes de comunidades vecinas, deben recuperar "
        "tres sellos de energía y derrotar a Supay. Ninguno puede hacerlo solo: la "
        "máquina separa a sus objetivos y castiga al jugador que abandona a su compañero."
    ),
    P("Estructura dramática", "Subhead"),
    info_table(
        [
            ["Acto", "Momento jugable", "Resultado narrativo"],
            ["I - La sombra", "Oleada 1: drones veloces", "Los guardianes reactivan el primer sello."],
            ["II - La fractura", "Oleada 2: drones y taladros", "Supay revela su presencia bajo el páramo."],
            ["III - El eclipse", "Oleada 3 y jefe final", "La cooperación devuelve la luz al valle."],
        ],
        [3.0 * cm, 6.0 * cm, 6.6 * cm],
    ),
    Spacer(1, 14),
    P(
        "Tono: aventura esperanzadora, tecnología peligrosa pero no demonizada y "
        "una relación de cuidado entre comunidad, paisaje y energía.",
        "Callout",
    ),
    PageBreak(),
]

story += section("03 / Personajes", "Héroes, enemigo y rol")
story += [
    info_table(
        [
            ["Personaje", "Descripción visual", "Función mecánica"],
            [
                "Sisa - P1",
                "Poncho amarillo, acentos coral y silueta circular.",
                "Control con WASD, F y G. Empieza mirando hacia el este.",
            ],
            [
                "Rumi - P2",
                "Poncho celeste, acentos violetas y silueta circular.",
                "Control con flechas, K y L. Empieza mirando hacia el oeste.",
            ],
            [
                "Máquina Supay",
                "Núcleo oscuro con anillos coral y geometría de eclipse.",
                "Jefe: persecución, onda expansiva y convocatoria de refuerzos.",
            ],
        ],
        [3.1 * cm, 6.1 * cm, 6.4 * cm],
    ),
    Spacer(1, 14),
    P("Principios de lectura visual", "Subhead"),
    bullet("El color identifica a cada jugador en su cuerpo, proyectiles y partículas."),
    bullet("Los enemigos usan púrpura, coral y naranja para separarse de los héroes."),
    bullet("La orientación del cuerpo coincide con la dirección del siguiente disparo."),
    bullet("Un jugador caído se inclina, pierde saturación y muestra un anillo de reanimación."),
    P("Relación entre los protagonistas", "Subhead"),
    P(
        "Sisa es impulsiva y explora los bordes de la arena. Rumi analiza el ritmo "
        "de la oleada y protege el centro. El diseño evita ventajas estadísticas: "
        "ambos tienen la misma vida y daño para que la elección sea estética y de controles."
    ),
    P("Enemigos secundarios", "Subhead"),
    info_table(
        [
            ["Tipo", "Vida", "Conducta", "Puntos"],
            ["Drone de sombra", "2", "Rápido; persigue al guardián más cercano.", "120"],
            ["Taladro pesado", "5", "Lento; causa más daño por contacto.", "240"],
        ],
        [4.0 * cm, 2.0 * cm, 7.0 * cm, 2.6 * cm],
    ),
    PageBreak(),
]

story += section("04 / Mecánicas", "Reglas del juego")
story += [
    P("Bucle principal", "Subhead"),
    P(
        "Moverse - anticipar la aparición - disparar - esquivar - recoger recursos - "
        "auxiliar al compañero - limpiar la oleada - recuperar un sello."
    ),
    info_table(
        [
            ["Sistema", "Regla"],
            ["Movimiento", "Velocidad base de 220 px/s dentro de una arena cerrada."],
            ["Disparo", "Proyectil frontal; cadencia normal de 245 ms y rápida de 120 ms."],
            ["Impulso", "170 ms a 510 px/s; enfriamiento de 1,85 s."],
            ["Vida", "100 puntos por guardián; los impactos causan entre 12 y 22."],
            ["Caída", "Cuenta de 9 s. El compañero revive al permanecer cerca 2,1 s."],
            ["Puntaje", "Puntos por enemigo, recogida y combo de equipo."],
            ["Victoria", "Derrotar a la Máquina Supay después de tres oleadas."],
            ["Derrota", "Ambos guardianes caídos o eliminados al mismo tiempo."],
        ],
        [4.0 * cm, 11.6 * cm],
    ),
    P("Comportamiento del apuntado", "Subhead"),
    bullet("Con teclado, la última dirección de movimiento se conserva como dirección de fuego."),
    bullet("Con mando, el stick derecho permite apuntar sin cambiar el movimiento."),
    bullet("Los proyectiles se reciclan al vencer su tiempo o salir de la arena."),
    P("Pausa y reinicio", "Subhead"),
    P(
        "P detiene la física y muestra una capa de pausa. R reinicia únicamente desde "
        "la pantalla final, reduciendo reinicios accidentales."
    ),
    PageBreak(),
]

story += section("05 / Interfaz", "Controles y HUD")
story += [
    info_table(
        [
            ["Jugador", "Movimiento", "Disparo", "Impulso", "Mando"],
            ["P1 - Sisa", "WASD", "F", "G", "Mando 1"],
            ["P2 - Rumi", "Flechas", "K", "L", "Mando 2"],
        ],
        [3.3 * cm, 3.4 * cm, 2.6 * cm, 2.6 * cm, 3.7 * cm],
    ),
    Spacer(1, 13),
    P("Jerarquía del HUD", "Subhead"),
    bullet("Esquina superior izquierda: nombre, puntuación, vida e impulso de Sisa."),
    bullet("Esquina superior derecha: nombre, puntuación, vida e impulso de Rumi."),
    bullet("Centro superior: objetivo actual, amenazas restantes y combo."),
    bullet("Centro inferior: consejos contextuales temporales."),
    bullet("Sobre el personaje: escudo y progreso de reanimación cuando corresponda."),
    P("Criterios UX", "Subhead"),
    info_table(
        [
            ["Criterio", "Solución"],
            ["Lectura en acción", "Texto corto, color redundante y barras persistentes."],
            ["Aprendizaje", "Controles visibles antes de iniciar y repetidos junto al juego."],
            ["Accesibilidad", "Teclado completo, mandos, contraste alto y soporte de movimiento reducido en la web."],
            ["Recuperación", "Pausa reversible y reinicio explícito tras terminar."],
        ],
        [4.1 * cm, 11.5 * cm],
    ),
    P(
        "La interfaz no requiere mouse durante la partida. El botón de inicio y el "
        "reinicio también aceptan puntero para facilitar demostraciones.",
        "Callout",
    ),
    PageBreak(),
]

story += section("06 / Objetos", "Power-ups y amenazas")
story += [
    info_table(
        [
            ["Elemento", "Referencia", "Efecto", "Duración"],
            ["Cacao sanador", "Cultivo emblemático", "Recupera 34 puntos de vida.", "Instantáneo"],
            ["Chuquiragua rápida", "Flor andina", "Reduce la recarga del disparo.", "6,5 s"],
            ["Escudo de tagua", "Material vegetal", "Anula todo daño recibido.", "6 s"],
            ["Sello del Inti", "Símbolo solar", "Marca el avance entre oleadas.", "Permanente"],
        ],
        [3.5 * cm, 3.7 * cm, 5.6 * cm, 2.8 * cm],
    ),
    P("Economía de aparición", "Subhead"),
    P(
        "Cada enemigo secundario tiene 19% de probabilidad de soltar un objeto. "
        "La selección entre los tres tipos es uniforme. Los objetos desaparecen "
        "a los 9 segundos para evitar acumulación y motivar decisiones rápidas."
    ),
    P("Máquina Supay", "Subhead"),
    bullet("34 puntos de vida y velocidad menor que un drone."),
    bullet("Onda expansiva cada 2,1 segundos con anticipación visual."),
    bullet("Dos refuerzos aproximadamente cada 5,2 segundos."),
    bullet("2500 puntos al ser derrotada y secuencia audiovisual de victoria."),
    P("Dirección cultural", "Subhead"),
    P(
        "Los referentes ecuatorianos funcionan como símbolos positivos del mundo y "
        "recursos de juego. Se evita imitar indumentaria ceremonial específica o "
        "presentar una cultura indígena como fantasía genérica."
    ),
    PageBreak(),
]

story += section("07 / Nivel", "Diseño de arena y oleadas")
story += [
    ArenaMap(16.0 * cm, 8.8 * cm),
    Spacer(1, 12),
    P(
        "La arena 16:9 mantiene el Núcleo del Inti al centro. Los seis sectores de "
        "aparición distribuyen la presión alrededor de los jugadores. Las entradas "
        "se adelantan con círculos coral para que el peligro sea justo.",
        "Small",
    ),
    P("Flujo de dificultad", "Subhead"),
    info_table(
        [
            ["Oleada", "Composición", "Aprendizaje"],
            ["1", "8 drones", "Moverse, disparar y leer avisos."],
            ["2", "12 enemigos; aparecen taladros", "Usar impulso, power-ups y espacio."],
            ["3", "15 enemigos + Supay", "Combinar todos los sistemas y reanimar."],
        ],
        [2.4 * cm, 6.2 * cm, 7.0 * cm],
    ),
    PageBreak(),
]

story += section("08 / Arte y audio", "Dirección audiovisual")
story += [
    P("Lenguaje visual", "Subhead"),
    info_table(
        [
            ["Componente", "Decisión"],
            ["Paleta", "Azul noche para el páramo; amarillo solar; coral de peligro; aqua de tecnología aliada."],
            ["Forma", "Círculos para energía y jugadores; puntas y anillos para amenazas."],
            ["Entorno", "Siluetas de volcanes, nieve, cielo nocturno y franja textil geométrica."],
            ["Movimiento", "Escalado elástico al aparecer, pulsos lentos del núcleo y partículas rápidas de impacto."],
        ],
        [4.1 * cm, 11.5 * cm],
    ),
    Spacer(1, 14),
    P("Paleta principal", "Subhead"),
    Table(
        [["NOCHE", "INTI", "PELIGRO", "ENERGÍA", "JUGADOR 2"]],
        colWidths=[3.12 * cm] * 5,
        rowHeights=[1.5 * cm],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, 0), NAVY),
                ("BACKGROUND", (1, 0), (1, 0), SUN),
                ("BACKGROUND", (2, 0), (2, 0), CORAL),
                ("BACKGROUND", (3, 0), (3, 0), AQUA),
                ("BACKGROUND", (4, 0), (4, 0), SKY),
                ("TEXTCOLOR", (0, 0), (0, 0), WHITE),
                ("TEXTCOLOR", (1, 0), (-1, 0), INK),
                ("FONTNAME", (0, 0), (-1, -1), FONT_BOLD),
                ("FONTSIZE", (0, 0), (-1, -1), 7),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        ),
    ),
    Spacer(1, 16),
    P("Audio", "Subhead"),
    P(
        "Los efectos se sintetizan en tiempo real con Web Audio: ondas cuadradas para "
        "disparo, triángulo para daño, seno para recuperación y barrido grave para Supay. "
        "Un patrón ambiental de cuatro notas acompaña la partida sin archivos externos."
    ),
    P(
        "Esta solución elimina problemas de carga, mantiene el proyecto liviano y "
        "permite hacer fade natural mediante envolventes de ganancia.",
        "Callout",
    ),
    PageBreak(),
]

story += section("09 / Técnica", "Arquitectura y despliegue")
story += [
    info_table(
        [
            ["Capa", "Tecnología", "Responsabilidad"],
            ["Juego", "Phaser 3.90", "Física Arcade, input, escenas, grupos, colisiones y tweens."],
            ["Interfaz web", "React + Next.js", "Presentación, instrucciones, matriz y carga del canvas."],
            ["Estilos", "CSS responsivo", "Composición editorial, contraste y adaptación móvil."],
            ["Producción", "Vinext + Cloudflare", "Versión web desplegable y compatible con Sites."],
            ["Entrega", "Next static export", "Carpeta out para GitHub Pages."],
            ["Automatización", "GitHub Actions", "Compilar, empaquetar y publicar al hacer push."],
        ],
        [3.1 * cm, 4.2 * cm, 8.3 * cm],
    ),
    P("Rendimiento y robustez", "Subhead"),
    bullet("Texturas generadas una sola vez con Phaser Graphics."),
    bullet("Proyectiles reciclados dentro de un grupo con máximo de 80."),
    bullet("Escena fija de 1280 x 720 escalada con FIT para conservar proporción."),
    bullet("Importación dinámica de Phaser para evitar ejecución durante render del servidor."),
    bullet("Sin dependencias de imágenes o audio externas durante la partida."),
    P("Compatibilidad objetivo", "Subhead"),
    P(
        "Navegadores modernos de escritorio con WebGL o Canvas, teclado y opcionalmente "
        "Gamepad API. La experiencia está optimizada para resolución 1280 x 720 o superior."
    ),
    P("Publicación", "Subhead"),
    P(
        "El repositorio público se despliega mediante GitHub Actions. La ruta base se calcula "
        "durante la compilación para que los recursos funcionen en el sitio de proyecto. "
        "El juego está disponible en https://freddyjalvarado.github.io/GuardianesInti/."
    ),
    PageBreak(),
]

story += section("10 / Playtesting", "Protocolo y bitácora")
story += [
    P(
        "Cada integrante debe completar tres corridas consecutivas de forma individual. "
        "Las seis corridas se consolidaron después del registro individual. El modo "
        "<b>?legacy=1</b> permitió contrastar los hallazgos con <b>?legacy=0</b>.",
        "Callout",
    ),
    info_table(
        [
            ["Integrante", "Corrida", "Duración", "Progreso", "Hallazgo principal", "Mejora resultante"],
            ["Freddy", "1", "10 min", "Jefe final", "Barra y estados de vida de P2 poco legibles.", "HUD simétrico y estados explícitos."],
            ["Freddy", "2", "9 min", "Oleada 2", "Sin escape rápido; daño poco perceptible.", "Impulso y respuesta al impacto."],
            ["Freddy", "3", "12 min", "Jefe final", "Apariciones injustas y flujo incompleto.", "Avisos, audio y pantallas finales."],
            ["Brayan", "1", "8 min", "Oleada 2", "Caer no generaba cooperación.", "Reanimación por proximidad."],
            ["Brayan", "2", "11 min", "Jefe final", "Poca variedad y solo teclado.", "Power-ups y dos mandos."],
            ["Brayan", "3", "13 min", "Jefe final", "Dificultad plana y sin culminación.", "Tres oleadas y Máquina Supay."],
        ],
        [2.2 * cm, 1.4 * cm, 1.7 * cm, 2.2 * cm, 4.4 * cm, 3.7 * cm],
        font_size=6.7,
    ),
    Spacer(1, 14),
    P("Resultado del consenso", "Subhead"),
    bullet("Corregir primero la lectura de vida de Rumi y comunicar cada estado de salud."),
    bullet("Añadir una salida evasiva y reforzar el impacto audiovisual del daño."),
    bullet("Anticipar apariciones y ataques fuertes para que el daño sea justo."),
    bullet("Convertir la cooperación en una mecánica mediante reanimación y recursos."),
    bullet("Construir una curva de tres oleadas con un jefe final diferenciado."),
    P(
        "Las nueve mejoras de la matriz siguiente responden directamente a estos "
        "hallazgos y se encuentran activas en la versión final.",
        "Callout",
    ),
    PageBreak(),
]

story += section("10.1 / Hallazgo prioritario", "Bitácora 1: estados de vida y salud")
story += [
    info_table(
        [
            ["Campo", "Registro corregido"],
            ["Fecha y duración", "23/07/2026, 14:30 - 10 minutos. Se alcanzó el jefe final."],
            ["Problema de interfaz", "La barra de Rumi (P2) salía de su panel, se reducía en una dirección incoherente y no indicaba el estado del jugador."],
            ["Problema visual", "Al llegar a cero puntos, la barra desaparecía sin mostrar si el jugador estaba caído, fuera de combate o disponible para reanimación."],
            ["Reproducción", "Iniciar la partida, permitir que Rumi reciba daño y observar el HUD superior derecho hasta llegar a cero puntos."],
            ["Prioridad", "Mantener la barra dentro del panel, orientarla desde la derecha y comunicar el estado de salud con texto y color."],
            ["Evidencia técnica", "app/game.ts, método updateHud."],
        ],
        [3.8 * cm, 11.8 * cm],
        font_size=7.3,
    ),
    Spacer(1, 12),
    P("Solución implementada", "Subhead"),
    info_table(
        [
            ["Estado", "Regla visual", "Comunicación"],
            ["Vida", "Verde; más de 55 puntos.", "VIDA + valor actual"],
            ["Herido", "Amarillo; entre 26 y 55 puntos.", "HERIDA + valor actual"],
            ["Crítico", "Rojo; 25 puntos o menos.", "CRÍTICA + valor actual"],
            ["Caído/a", "Amarillo; barra de progreso de reanimación.", "CAÍDO/A + segundos restantes"],
            ["Fuera", "Gris; sin progreso disponible.", "FUERA"],
        ],
        [3.1 * cm, 6.4 * cm, 6.1 * cm],
        font_size=7.2,
    ),
    Spacer(1, 10),
    P(
        "La barra de Sisa crece desde la izquierda y la de Rumi queda anclada al "
        "borde derecho, por lo que ambos HUD son simétricos. El mismo criterio se "
        "aplica a la recarga del impulso. La corrección elimina el desbordamiento "
        "observado en las capturas y hace reconocible el estado sin depender solo del color.",
        "Callout",
    ),
    PageBreak(),
]

matrix_rows = [
    ["#", "Responsable", "Problema base", "Solución implementada", "Evidencia en código/juego"],
    ["1", "Freddy", "Movimiento sin opción de escape.", "Impulso con enfriamiento y estela.", "G o mando B; barra inferior de HUD."],
    ["2", "Freddy", "Vida de P2 y daño poco legibles.", "HUD simétrico, estados, flash, vibración y escudo.", "Barras orientadas y texto de salud."],
    ["3", "Freddy", "Apariciones injustas.", "Telegráficos antes de cada enemigo.", "Círculos coral que se contraen."],
    ["4", "Freddy", "Impactos sin fuerza.", "Partículas, tonos y cámara.", "Disparo, baja, recogida y victoria."],
    ["5", "Freddy", "Flujo incompleto.", "Tutorial, pausa y pantallas finales.", "Menú, tecla P y reinicio R."],
    ["6", "Brayan", "Cooperación superficial.", "Reanimación por proximidad.", "Anillo de progreso durante 2,1 s."],
    ["7", "Brayan", "Poca variedad táctica.", "Tres power-ups temáticos.", "Cacao, chuquiragua y tagua."],
    ["8", "Brayan", "Solo teclado.", "Soporte para dos mandos.", "Sticks, gatillo/A y botón B."],
    ["9", "Brayan", "Dificultad plana.", "Tres oleadas, taladros y jefe.", "Supay usa pulso y refuerzos."],
]
story += section("11 / Mejoras", "Matriz de asignación 5 / 4")
story += [
    P(
        "El reparto solicitado asigna cinco mejoras a Freddy Javier Alvarado Cajas "
        "y cuatro a Brayan Rodriguez. Todas están implementadas en la versión final."
    ),
    info_table(
        matrix_rows,
        [0.65 * cm, 2.2 * cm, 3.6 * cm, 4.9 * cm, 4.3 * cm],
        font_size=6.8,
    ),
    Spacer(1, 11),
    P("Modo de evidencia", "Subhead"),
    P(
        "Abrir <b>?legacy=1</b> desactiva telegráficos, impulso, reanimación, power-ups, "
        "partículas, audio y soporte para mandos. Abrir <b>?legacy=0</b> muestra la "
        "versión final. Este recurso permite grabar un antes y después reproducible."
    ),
    P(
        "La evaluación individual depende de la guía docente. Antes de entregar, "
        "cada integrante debe verificar que sus mejoras asignadas funcionan en una "
        "corrida completa y conservar evidencia en video.",
        "Callout",
    ),
    PageBreak(),
]

story += section("12 / Entrega", "Tráiler y lista de verificación")
story += [
    P("Tráiler de 1 a 2 minutos", "Subhead"),
    info_table(
        [
            ["Tiempo", "Contenido"],
            ["0:00 - 0:12", "Cinemática IA del Cotopaxi y el eclipse mecánico."],
            ["0:12 - 0:22", "Presentación de Sisa, Rumi y el Núcleo del Inti."],
            ["0:22 - 0:47", "Gameplay real y corte antes/después de mejoras."],
            ["0:47 - 0:59", "Reanimación y power-ups."],
            ["0:59 - 1:12", "Máquina Supay y acción final."],
            ["1:12 - 1:25", "Victoria, logotipo y enlace público."],
        ],
        [3.6 * cm, 12.0 * cm],
    ),
    P("Checklist final", "Subhead"),
    bullet("Completadas las tres corridas individuales de Freddy."),
    bullet("Completadas las tres corridas individuales de Brayan."),
    bullet("Bitácora consolidada e integrada en este GDD."),
    bullet("HUD de salud corregido y validado en la compilación final."),
    bullet("Grabar gameplay real de la versión final y del modo legacy."),
    bullet("Generar la cinemática con IA y editar el tráiler."),
    bullet("Subir el video con acceso público."),
    bullet("Repositorio y GitHub Pages publicados mediante Actions."),
    bullet("Enlace público comprobado con respuesta HTTP 200."),
    P("Entregables", "Subhead"),
    info_table(
        [
            ["Componente", "Estado"],
            ["GDD bien maquetado en PDF", "COMPLETADO - incluye bitácoras y matriz 5/4."],
            ["Video introductorio", "Guion preparado; requiere grabación y edición."],
            ["Enlace de GitHub Pages", "PUBLICADO - freddyjalvarado.github.io/GuardianesInti/"],
        ],
        [6.3 * cm, 9.3 * cm],
    ),
]


def build_pdf():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=1.8 * cm,
        rightMargin=1.8 * cm,
        topMargin=1.65 * cm,
        bottomMargin=1.35 * cm,
        title="GDD - Guardianes del Inti",
        author="Freddy Javier Alvarado Cajas y Brayan Rodriguez",
        subject="Proyecto final de Juegos Interactivos",
    )
    doc.build(story, onFirstPage=draw_cover, onLaterPages=draw_cover)
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
