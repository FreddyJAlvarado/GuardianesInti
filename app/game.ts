type PhaserModule = typeof import("phaser");

export type GuardianesGameHandle = {
  destroy: () => void;
};

type PlayerState = {
  sprite: import("phaser").Physics.Arcade.Sprite;
  name: string;
  color: number;
  hp: number;
  maxHp: number;
  score: number;
  downed: boolean;
  eliminated: boolean;
  downTimer: number;
  reviveProgress: number;
  fireReadyAt: number;
  dashReadyAt: number;
  dashUntil: number;
  rapidUntil: number;
  shieldUntil: number;
  facing: import("phaser").Math.Vector2;
  keys: Record<string, import("phaser").Input.Keyboard.Key>;
  padIndex: number;
  dashWasDown: boolean;
};

const WIDTH = 1280;
const HEIGHT = 720;
const ARENA = { left: 62, right: 1218, top: 112, bottom: 664 };

export async function createGuardianesGame(
  parent: HTMLElement,
  onReady?: () => void,
): Promise<GuardianesGameHandle> {
  const Phaser = (await import("phaser")) as PhaserModule;
  const legacyMode =
    new URLSearchParams(window.location.search).get("legacy") === "1";

  class GuardianesScene extends Phaser.Scene {
    private players: PlayerState[] = [];
    private bullets!: import("phaser").Physics.Arcade.Group;
    private enemies!: import("phaser").Physics.Arcade.Group;
    private pickups!: import("phaser").Physics.Arcade.Group;
    private hud!: import("phaser").GameObjects.Graphics;
    private objectiveText!: import("phaser").GameObjects.Text;
    private playerOneText!: import("phaser").GameObjects.Text;
    private playerTwoText!: import("phaser").GameObjects.Text;
    private statusText!: import("phaser").GameObjects.Text;
    private waveText!: import("phaser").GameObjects.Text;
    private tipText!: import("phaser").GameObjects.Text;
    private overlay!: import("phaser").GameObjects.Rectangle;
    private menu!: import("phaser").GameObjects.Container;
    private endPanel?: import("phaser").GameObjects.Container;
    private coreRings: import("phaser").GameObjects.Arc[] = [];
    private wave = 0;
    private waveQuota = 0;
    private pendingSpawns = 0;
    private nextSpawnAt = 0;
    private bossSpawned = false;
    private started = false;
    private paused = false;
    private finished = false;
    private combo = 0;
    private comboUntil = 0;
    private lastMusicAt = 0;
    private pauseKey!: import("phaser").Input.Keyboard.Key;
    private startKey!: import("phaser").Input.Keyboard.Key;
    private restartKey!: import("phaser").Input.Keyboard.Key;

    constructor() {
      super("guardianes");
    }

    create() {
      this.createTextures();
      this.createAndeanArena();

      this.bullets = this.physics.add.group({ maxSize: 80 });
      this.enemies = this.physics.add.group();
      this.pickups = this.physics.add.group();

      const keyboard = this.input.keyboard!;
      this.pauseKey = keyboard.addKey("P");
      this.startKey = keyboard.addKey("SPACE");
      this.restartKey = keyboard.addKey("R");

      this.players = [
        this.createPlayer({
          x: 420,
          y: 415,
          texture: "sisa",
          name: "SISA",
          color: 0xffd23f,
          padIndex: 0,
          keys: "W,A,S,D,F,G",
        }),
        this.createPlayer({
          x: 860,
          y: 415,
          texture: "rumi",
          name: "RUMI",
          color: 0x46d7ff,
          padIndex: 1,
          keys: "UP,LEFT,DOWN,RIGHT,K,L",
        }),
      ];

      this.physics.add.overlap(
        this.bullets,
        this.enemies,
        this.handleBulletHit,
        undefined,
        this,
      );
      this.players.forEach((player) => {
        this.physics.add.overlap(
          player.sprite,
          this.enemies,
          (_player: unknown, enemy: unknown) =>
            this.handlePlayerHit(player, enemy),
          undefined,
          this,
        );
        this.physics.add.overlap(
          player.sprite,
          this.pickups,
          (_player: unknown, pickup: unknown) =>
            this.collectPickup(player, pickup),
          undefined,
          this,
        );
      });

      this.createHud();
      this.createMenu();
      this.scale.on("resize", () => this.centerCanvas());
      this.centerCanvas();
      onReady?.();
    }

    private createTextures() {
      const g = this.make.graphics({ x: 0, y: 0 });

      const playerTexture = (key: string, poncho: number, accent: number) => {
        g.clear();
        g.fillStyle(0x101c35);
        g.fillCircle(24, 24, 21);
        g.lineStyle(3, accent, 1);
        g.strokeCircle(24, 24, 20);
        g.fillStyle(poncho);
        g.fillTriangle(8, 34, 40, 34, 24, 12);
        g.fillStyle(0xf2b880);
        g.fillCircle(24, 13, 7);
        g.fillStyle(accent);
        g.fillRect(16, 7, 16, 4);
        g.fillStyle(0xffffff);
        g.fillTriangle(38, 20, 48, 24, 38, 28);
        g.generateTexture(key, 50, 50);
      };
      playerTexture("sisa", 0xffd23f, 0xf04464);
      playerTexture("rumi", 0x46d7ff, 0x7f5cff);

      g.clear();
      g.fillStyle(0xfff6bf);
      g.fillCircle(7, 7, 6);
      g.fillStyle(0xffffff);
      g.fillCircle(7, 7, 2);
      g.generateTexture("bullet", 14, 14);

      g.clear();
      g.fillStyle(0x551c48);
      g.fillCircle(23, 23, 20);
      g.lineStyle(3, 0xff4f7d);
      g.strokeCircle(23, 23, 19);
      g.fillStyle(0xff4f7d);
      g.fillTriangle(5, 10, 14, 1, 18, 14);
      g.fillTriangle(41, 10, 32, 1, 28, 14);
      g.fillStyle(0xffe8a3);
      g.fillCircle(16, 22, 3);
      g.fillCircle(30, 22, 3);
      g.generateTexture("drone", 46, 46);

      g.clear();
      g.fillStyle(0x213b42);
      g.fillCircle(27, 27, 24);
      g.lineStyle(4, 0xe67e30);
      g.strokeCircle(27, 27, 22);
      g.fillStyle(0xe67e30);
      g.fillRect(9, 22, 36, 10);
      g.fillStyle(0xffd977);
      g.fillCircle(18, 27, 3);
      g.fillCircle(36, 27, 3);
      g.generateTexture("taladro", 54, 54);

      g.clear();
      g.fillStyle(0x250d34);
      g.fillCircle(48, 48, 44);
      g.lineStyle(6, 0xe23c6d);
      g.strokeCircle(48, 48, 41);
      g.lineStyle(3, 0xffa63d);
      g.strokeCircle(48, 48, 29);
      g.fillStyle(0xffd55a);
      g.fillTriangle(48, 10, 59, 39, 89, 39);
      g.fillTriangle(86, 50, 57, 58, 69, 88);
      g.fillTriangle(40, 88, 38, 58, 8, 69);
      g.fillStyle(0xffffff);
      g.fillCircle(36, 45, 5);
      g.fillCircle(60, 45, 5);
      g.generateTexture("supay", 96, 96);

      const pickup = (key: string, color: number, symbol: "plus" | "star" | "shield") => {
        g.clear();
        g.fillStyle(0x0f1c31);
        g.fillCircle(17, 17, 16);
        g.lineStyle(3, color);
        g.strokeCircle(17, 17, 14);
        g.fillStyle(color);
        if (symbol === "plus") {
          g.fillRect(8, 14, 18, 6);
          g.fillRect(14, 8, 6, 18);
        } else if (symbol === "shield") {
          g.fillTriangle(17, 6, 27, 11, 17, 29);
          g.fillTriangle(17, 6, 7, 11, 17, 29);
        } else {
          g.fillCircle(17, 17, 7);
          g.fillTriangle(17, 4, 21, 14, 31, 14);
        }
        g.generateTexture(key, 34, 34);
      };
      pickup("heal", 0x72ef9c, "plus");
      pickup("rapid", 0xffcf52, "star");
      pickup("shield", 0x52d9ff, "shield");
      g.destroy();
    }

    private createAndeanArena() {
      this.cameras.main.setBackgroundColor("#071528");
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x071528, 0x071528, 0x153d59, 0x153d59, 1);
      bg.fillRect(0, 0, WIDTH, HEIGHT);

      for (let i = 0; i < 38; i += 1) {
        const x = Phaser.Math.Between(20, WIDTH - 20);
        const y = Phaser.Math.Between(118, 610);
        bg.fillStyle(i % 5 === 0 ? 0x6fcce2 : 0xffffff, i % 4 === 0 ? 0.16 : 0.08);
        bg.fillCircle(x, y, i % 6 === 0 ? 2 : 1);
      }

      bg.fillStyle(0x17374c, 0.9);
      bg.fillTriangle(40, 325, 315, 122, 555, 325);
      bg.fillTriangle(360, 325, 675, 70, 965, 325);
      bg.fillTriangle(760, 325, 1030, 155, 1250, 325);
      bg.fillStyle(0xe8f4f0, 0.9);
      bg.fillTriangle(570, 155, 675, 70, 772, 155);
      bg.fillStyle(0xa7d7cf, 0.55);
      bg.fillTriangle(190, 215, 315, 122, 415, 215);

      bg.fillStyle(0x0b2233, 0.92);
      bg.fillRoundedRect(
        ARENA.left,
        ARENA.top,
        ARENA.right - ARENA.left,
        ARENA.bottom - ARENA.top,
        20,
      );
      bg.lineStyle(3, 0x4ecdc4, 0.45);
      bg.strokeRoundedRect(
        ARENA.left,
        ARENA.top,
        ARENA.right - ARENA.left,
        ARENA.bottom - ARENA.top,
        20,
      );

      for (let x = 84; x < 1200; x += 44) {
        const colors = [0xffd23f, 0xf04464, 0x46d7ff, 0x7f5cff];
        bg.fillStyle(colors[(x / 44) % colors.length | 0], 0.58);
        bg.fillTriangle(x, 637, x + 12, 622, x + 24, 637);
        bg.fillTriangle(x + 24, 637, x + 36, 652, x + 48, 637);
      }

      const glow = this.add.circle(WIDTH / 2, 390, 76, 0xffce42, 0.07);
      this.tweens.add({
        targets: glow,
        scale: 1.16,
        alpha: 0.12,
        duration: 1700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
      [58, 42, 27].forEach((radius, index) => {
        const ring = this.add.circle(
          WIDTH / 2,
          390,
          radius,
          0x000000,
          0,
        );
        ring.setStrokeStyle(5, index === 0 ? 0x446477 : 0x324b5a, 0.7);
        this.coreRings.push(ring);
      });
      this.add
        .star(WIDTH / 2, 390, 8, 14, 32, 0xffd23f, 0.95)
        .setAngle(22.5);
      this.add
        .text(WIDTH / 2, 465, "NÚCLEO DEL INTI", {
          fontFamily: "Arial",
          fontSize: "14px",
          fontStyle: "bold",
          color: "#f6df8b",
          letterSpacing: 3,
        })
        .setOrigin(0.5);
    }

    private createPlayer(config: {
      x: number;
      y: number;
      texture: string;
      name: string;
      color: number;
      padIndex: number;
      keys: string;
    }): PlayerState {
      const sprite = this.physics.add.sprite(config.x, config.y, config.texture);
      sprite.setCircle(20, 5, 5);
      sprite.setCollideWorldBounds(true);
      sprite.setDepth(10);
      sprite.body!.setBoundsRectangle(
        new Phaser.Geom.Rectangle(
          ARENA.left,
          ARENA.top,
          ARENA.right - ARENA.left,
          ARENA.bottom - ARENA.top,
        ),
      );
      const keyList = config.keys.split(",");
      const keyObjects = this.input.keyboard!.addKeys(config.keys) as Record<
        string,
        import("phaser").Input.Keyboard.Key
      >;
      const normalized: Record<string, import("phaser").Input.Keyboard.Key> = {};
      keyList.forEach((key) => {
        normalized[key] = keyObjects[key];
      });

      return {
        sprite,
        name: config.name,
        color: config.color,
        hp: 100,
        maxHp: 100,
        score: 0,
        downed: false,
        eliminated: false,
        downTimer: 0,
        reviveProgress: 0,
        fireReadyAt: 0,
        dashReadyAt: 0,
        dashUntil: 0,
        rapidUntil: 0,
        shieldUntil: 0,
        facing: new Phaser.Math.Vector2(config.padIndex === 0 ? 1 : -1, 0),
        keys: normalized,
        padIndex: config.padIndex,
        dashWasDown: false,
      };
    }

    private createHud() {
      this.hud = this.add.graphics().setDepth(50);
      const textStyle = {
        fontFamily: "Arial",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#ffffff",
      };
      this.playerOneText = this.add.text(78, 24, "", textStyle).setDepth(51);
      this.playerTwoText = this.add
        .text(1202, 24, "", textStyle)
        .setOrigin(1, 0)
        .setDepth(51);
      this.objectiveText = this.add
        .text(WIDTH / 2, 22, "PREPARA A LOS GUARDIANES", {
          ...textStyle,
          fontSize: "16px",
          color: "#e9f6f5",
          letterSpacing: 2,
        })
        .setOrigin(0.5, 0)
        .setDepth(51);
      this.statusText = this.add
        .text(WIDTH / 2, 61, "", {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#91b8c5",
        })
        .setOrigin(0.5)
        .setDepth(51);
      this.waveText = this.add
        .text(WIDTH / 2, 190, "", {
          fontFamily: "Arial",
          fontSize: "42px",
          fontStyle: "bold",
          color: "#ffdc66",
          stroke: "#071528",
          strokeThickness: 8,
        })
        .setOrigin(0.5)
        .setDepth(60)
        .setAlpha(0);
      this.tipText = this.add
        .text(WIDTH / 2, 626, "", {
          fontFamily: "Arial",
          fontSize: "14px",
          fontStyle: "bold",
          color: "#d9f5f2",
          backgroundColor: "#081827cc",
          padding: { x: 12, y: 6 },
        })
        .setOrigin(0.5)
        .setDepth(52)
        .setAlpha(0);
      this.overlay = this.add
        .rectangle(0, 0, WIDTH, HEIGHT, 0xff365f, 0)
        .setOrigin(0)
        .setDepth(48);
      this.updateHud(0);
    }

    private createMenu() {
      const shade = this.add
        .rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x04101f, 0.83)
        .setInteractive();
      const panel = this.add
        .rectangle(WIDTH / 2, 370, 700, 440, 0x0c2236, 0.98)
        .setStrokeStyle(2, 0x4ecdc4, 0.65);
      const eyebrow = this.add
        .text(WIDTH / 2, 178, "SHOOTER COOPERATIVO LOCAL", {
          fontFamily: "Arial",
          fontSize: "14px",
          fontStyle: "bold",
          color: "#4ecdc4",
          letterSpacing: 4,
        })
        .setOrigin(0.5);
      const title = this.add
        .text(WIDTH / 2, 225, "GUARDIANES\nDEL INTI", {
          fontFamily: "Arial",
          fontSize: "58px",
          fontStyle: "bold",
          align: "center",
          color: "#fff3c4",
          lineSpacing: -10,
          stroke: "#51213e",
          strokeThickness: 7,
        })
        .setOrigin(0.5, 0);
      const story = this.add
        .text(
          WIDTH / 2,
          370,
          "La sombra mecánica invade los Andes.\nSisa y Rumi deben encender el Núcleo del Inti antes del eclipse.",
          {
            fontFamily: "Arial",
            fontSize: "18px",
            align: "center",
            color: "#b8d7dd",
            lineSpacing: 8,
          },
        )
        .setOrigin(0.5);
      const controls = this.add
        .text(
          WIDTH / 2,
          450,
          "P1  WASD · F dispara · G impulso     |     P2  FLECHAS · K dispara · L impulso",
          {
            fontFamily: "Arial",
            fontSize: "15px",
            fontStyle: "bold",
            color: "#ffffff",
          },
        )
        .setOrigin(0.5);
      const button = this.add
        .rectangle(WIDTH / 2, 530, 320, 58, 0xffd23f, 1)
        .setStrokeStyle(3, 0xfff0aa)
        .setInteractive({ useHandCursor: true });
      const buttonText = this.add
        .text(WIDTH / 2, 530, "COMENZAR MISIÓN  [ESPACIO]", {
          fontFamily: "Arial",
          fontSize: "16px",
          fontStyle: "bold",
          color: "#142033",
        })
        .setOrigin(0.5);
      const mode = this.add
        .text(
          WIDTH / 2,
          583,
          legacyMode
            ? "MODO EVIDENCIA: ANTES · mejoras desactivadas"
            : "3 OLEADAS · POWER-UPS · REANIMACIÓN · JEFE FINAL",
          {
            fontFamily: "Arial",
            fontSize: "13px",
            color: legacyMode ? "#ff7b91" : "#7faab5",
            letterSpacing: 1,
          },
        )
        .setOrigin(0.5);
      button.on("pointerover", () => button.setFillStyle(0xffe479));
      button.on("pointerout", () => button.setFillStyle(0xffd23f));
      button.on("pointerdown", () => this.startMission());
      shade.on("pointerdown", () => undefined);
      this.menu = this.add
        .container(0, 0, [
          shade,
          panel,
          eyebrow,
          title,
          story,
          controls,
          button,
          buttonText,
          mode,
        ])
        .setDepth(100);
    }

    private startMission() {
      if (this.started) return;
      this.started = true;
      this.menu.destroy(true);
      const audio = this.sound as import("phaser").Sound.WebAudioSoundManager;
      if (audio.context?.state === "suspended") void audio.context.resume();
      this.showBanner("MISIÓN INICIADA", "#ffdc66");
      this.showTip(
        legacyMode
          ? "Sobrevive. En este modo faltan las mejoras de playtesting."
          : "Muévanse juntos: acércate a un compañero caído para reanimarlo.",
        5200,
      );
      this.time.delayedCall(1100, () => this.startWave());
    }

    private startWave() {
      this.wave += 1;
      this.waveQuota = [8, 12, 15][this.wave - 1] ?? 0;
      this.pendingSpawns = 0;
      this.nextSpawnAt = this.time.now + 700;
      this.bossSpawned = false;
      this.objectiveText.setText(
        this.wave === 3
          ? "OLEADA FINAL · DETÉN A LA MÁQUINA SUPAY"
          : `OLEADA ${this.wave}/3 · PROTEGE EL NÚCLEO`,
      );
      this.showBanner(
        this.wave === 3 ? "EL ECLIPSE SE ACERCA" : `OLEADA ${this.wave}`,
        this.wave === 3 ? "#ff6b82" : "#ffdc66",
      );
      if (!legacyMode && this.wave === 2) {
        this.showTip(
          "Los taladros resisten más. Usa el impulso para atravesar el peligro.",
          4600,
        );
      }
    }

    update(time: number, delta: number) {
      if (!this.started) {
        if (Phaser.Input.Keyboard.JustDown(this.startKey)) this.startMission();
        return;
      }
      if (this.finished) {
        if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
          this.scene.restart();
        }
        return;
      }
      if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
        this.paused = !this.paused;
        this.physics.world.isPaused = this.paused;
        this.showPause();
      }
      if (this.paused) return;

      this.players.forEach((player) => this.updatePlayer(player, time, delta));
      this.updateRevives(delta);
      this.updateEnemies(time);
      this.updateBullets(time);
      this.updateWaves(time);
      this.updateHud(time);
      this.playAmbientPulse(time);

      if (
        this.players.every((player) => player.downed || player.eliminated) &&
        !this.finished
      ) {
        this.finishMission(false);
      }
    }

    private updatePlayer(player: PlayerState, time: number, delta: number) {
      if (player.eliminated) return;
      if (player.downed) {
        player.downTimer -= delta;
        player.sprite.setVelocity(0);
        player.sprite.setAngle(Math.sin(time / 180) * 4 + 90);
        if (player.downTimer <= 0) {
          player.eliminated = true;
          player.sprite.disableBody(true, true);
          this.showTip(`${player.name} quedó fuera de combate.`, 2400);
        }
        return;
      }

      const keyNames =
        player.padIndex === 0
          ? { up: "W", left: "A", down: "S", right: "D", fire: "F", dash: "G" }
          : {
              up: "UP",
              left: "LEFT",
              down: "DOWN",
              right: "RIGHT",
              fire: "K",
              dash: "L",
            };
      const move = new Phaser.Math.Vector2(
        (player.keys[keyNames.right].isDown ? 1 : 0) -
          (player.keys[keyNames.left].isDown ? 1 : 0),
        (player.keys[keyNames.down].isDown ? 1 : 0) -
          (player.keys[keyNames.up].isDown ? 1 : 0),
      );
      let fireDown = player.keys[keyNames.fire].isDown;
      let dashDown = player.keys[keyNames.dash].isDown;

      if (!legacyMode && this.input.gamepad) {
        const pad = this.input.gamepad.getPad(player.padIndex);
        if (pad?.connected) {
          if (Math.abs(pad.leftStick.x) > 0.16) move.x = pad.leftStick.x;
          if (Math.abs(pad.leftStick.y) > 0.16) move.y = pad.leftStick.y;
          const aim = new Phaser.Math.Vector2(pad.rightStick.x, pad.rightStick.y);
          if (aim.length() > 0.28) player.facing.copy(aim.normalize());
          fireDown = fireDown || Boolean(pad.buttons[7]?.pressed) || pad.A;
          dashDown = dashDown || pad.B;
        }
      }

      if (move.length() > 0.08) {
        move.normalize();
        if (player.facing.length() === 0 || !this.input.gamepad?.getPad(player.padIndex)?.connected) {
          player.facing.copy(move);
        }
      } else {
        move.set(0, 0);
      }

      const justDashed = dashDown && !player.dashWasDown;
      player.dashWasDown = dashDown;
      if (
        !legacyMode &&
        justDashed &&
        time >= player.dashReadyAt &&
        move.length() > 0
      ) {
        player.dashUntil = time + 170;
        player.dashReadyAt = time + 1850;
        player.sprite.setAlpha(0.72);
        this.burst(player.sprite.x, player.sprite.y, player.color, 7);
        this.tone(155, 0.08, "sawtooth", 0.025);
      }

      const speed = time < player.dashUntil ? 510 : 220;
      player.sprite.setVelocity(move.x * speed, move.y * speed);
      player.sprite.setRotation(player.facing.angle());
      if (time >= player.dashUntil) player.sprite.setAlpha(1);

      if (fireDown && time >= player.fireReadyAt) {
        this.fire(player, time);
      }
    }

    private fire(player: PlayerState, time: number) {
      const rapid = !legacyMode && time < player.rapidUntil;
      player.fireReadyAt = time + (rapid ? 120 : 245);
      const bullet = this.bullets.get(
        player.sprite.x + player.facing.x * 30,
        player.sprite.y + player.facing.y * 30,
        "bullet",
      ) as import("phaser").Physics.Arcade.Sprite | null;
      if (!bullet) return;
      bullet.setActive(true).setVisible(true).setDepth(8);
      bullet.setScale(rapid ? 0.8 : 1);
      bullet.setTint(player.color);
      bullet.setData("owner", player.padIndex);
      bullet.setData("expires", time + 950);
      bullet.body!.enable = true;
      bullet.setVelocity(player.facing.x * 720, player.facing.y * 720);
      this.tone(rapid ? 410 : 320, 0.035, "square", 0.012);
    }

    private updateBullets(time: number) {
      this.bullets.getChildren().forEach((child) => {
        const bullet = child as import("phaser").Physics.Arcade.Sprite;
        if (
          bullet.active &&
          (time > Number(bullet.getData("expires")) ||
            bullet.x < ARENA.left ||
            bullet.x > ARENA.right ||
            bullet.y < ARENA.top ||
            bullet.y > ARENA.bottom)
        ) {
          this.recycleBullet(bullet);
        }
      });
    }

    private recycleBullet(bullet: import("phaser").Physics.Arcade.Sprite) {
      bullet.disableBody(true, true);
    }

    private updateWaves(time: number) {
      if (this.waveQuota > 0 && time >= this.nextSpawnAt) {
        this.waveQuota -= 1;
        this.pendingSpawns += 1;
        this.nextSpawnAt = time + Math.max(330, 820 - this.wave * 105);
        this.telegraphEnemy();
      }

      const activeEnemies = this.enemies.countActive(true);
      if (
        this.wave === 3 &&
        this.waveQuota === 0 &&
        this.pendingSpawns === 0 &&
        activeEnemies === 0 &&
        !this.bossSpawned
      ) {
        this.bossSpawned = true;
        this.pendingSpawns += 1;
        this.telegraphEnemy(true);
        return;
      }

      if (
        this.waveQuota === 0 &&
        this.pendingSpawns === 0 &&
        activeEnemies === 0 &&
        (this.wave < 3 || this.bossSpawned)
      ) {
        if (this.wave === 3) {
          this.finishMission(true);
        } else {
          this.coreRings[this.wave - 1]?.setStrokeStyle(5, 0xffd23f, 1);
          this.objectiveText.setText(`SELLO ${this.wave}/3 RECUPERADO`);
          this.showBanner("SELLO RECUPERADO", "#72ef9c");
          this.healBetweenWaves();
          this.time.delayedCall(2600, () => this.startWave());
          this.waveQuota = -1;
        }
      }
    }

    private telegraphEnemy(isBoss = false) {
      const edge = Phaser.Math.Between(0, 3);
      const margin = 92;
      const x =
        edge === 1
          ? ARENA.right - margin
          : edge === 3
            ? ARENA.left + margin
            : Phaser.Math.Between(ARENA.left + 80, ARENA.right - 80);
      const y =
        edge === 0
          ? ARENA.top + margin
          : edge === 2
            ? ARENA.bottom - margin
            : Phaser.Math.Between(ARENA.top + 80, ARENA.bottom - 80);

      if (legacyMode) {
        this.spawnEnemy(x, y, isBoss);
        return;
      }
      const warning = this.add
        .circle(x, y, isBoss ? 62 : 31, 0xff3c69, 0.08)
        .setStrokeStyle(isBoss ? 5 : 3, 0xff557b, 0.95)
        .setDepth(6);
      this.tweens.add({
        targets: warning,
        scale: { from: 1.5, to: 0.4 },
        alpha: { from: 0.15, to: 1 },
        duration: isBoss ? 1050 : 560,
        onComplete: () => {
          warning.destroy();
          this.spawnEnemy(x, y, isBoss);
        },
      });
    }

    private spawnEnemy(x: number, y: number, isBoss: boolean) {
      this.pendingSpawns = Math.max(0, this.pendingSpawns - 1);
      const heavy = !isBoss && this.wave > 1 && Phaser.Math.Between(0, 100) < 34;
      const texture = isBoss ? "supay" : heavy ? "taladro" : "drone";
      const enemy = this.enemies.create(
        x,
        y,
        texture,
      ) as import("phaser").Physics.Arcade.Sprite;
      enemy.setDepth(9);
      enemy.setCircle(isBoss ? 40 : heavy ? 24 : 19);
      enemy.setData("hp", isBoss ? 34 : heavy ? 5 : 2 + Math.floor(this.wave / 3));
      enemy.setData("maxHp", enemy.getData("hp"));
      enemy.setData("speed", isBoss ? 72 : heavy ? 82 : 104 + this.wave * 8);
      enemy.setData("points", isBoss ? 2500 : heavy ? 240 : 120);
      enemy.setData("boss", isBoss);
      enemy.setData("nextHit", 0);
      enemy.setData("nextPulse", this.time.now + 1200);
      enemy.setData("nextSummon", this.time.now + 4300);
      enemy.setScale(0.2);
      this.tweens.add({
        targets: enemy,
        scale: 1,
        duration: 260,
        ease: "Back.out",
      });
      if (isBoss) {
        this.showBanner("MÁQUINA SUPAY", "#ff557b");
        this.cameras.main.shake(550, 0.01);
        this.tone(80, 0.38, "sawtooth", 0.04);
      }
    }

    private updateEnemies(time: number) {
      const targets = this.players.filter(
        (player) => !player.downed && !player.eliminated,
      );
      this.enemies.getChildren().forEach((child) => {
        const enemy = child as import("phaser").Physics.Arcade.Sprite;
        if (!enemy.active || targets.length === 0) return;
        const target = targets.reduce((best, candidate) => {
          const candidateDistance = Phaser.Math.Distance.Between(
            enemy.x,
            enemy.y,
            candidate.sprite.x,
            candidate.sprite.y,
          );
          const bestDistance = Phaser.Math.Distance.Between(
            enemy.x,
            enemy.y,
            best.sprite.x,
            best.sprite.y,
          );
          return candidateDistance < bestDistance ? candidate : best;
        });
        const direction = new Phaser.Math.Vector2(
          target.sprite.x - enemy.x,
          target.sprite.y - enemy.y,
        ).normalize();
        const speed = Number(enemy.getData("speed"));
        enemy.setVelocity(direction.x * speed, direction.y * speed);
        enemy.rotation += enemy.getData("boss") ? 0.008 : 0.025;

        if (
          enemy.getData("boss") &&
          time >= Number(enemy.getData("nextPulse"))
        ) {
          enemy.setData("nextPulse", time + 2100);
          this.bossPulse(enemy);
        }
        if (
          enemy.getData("boss") &&
          time >= Number(enemy.getData("nextSummon"))
        ) {
          enemy.setData("nextSummon", time + 5200);
          for (let i = 0; i < 2; i += 1) {
            this.pendingSpawns += 1;
            this.time.delayedCall(i * 220, () =>
              this.spawnEnemy(
                enemy.x + Phaser.Math.Between(-90, 90),
                enemy.y + Phaser.Math.Between(-90, 90),
                false,
              ),
            );
          }
        }
      });
    }

    private bossPulse(enemy: import("phaser").Physics.Arcade.Sprite) {
      const ring = this.add
        .circle(enemy.x, enemy.y, 42, 0x000000, 0)
        .setStrokeStyle(8, 0xff3c69, 0.85)
        .setDepth(8);
      this.tweens.add({
        targets: ring,
        scale: 4.4,
        alpha: 0,
        duration: 820,
        onUpdate: () => {
          this.players.forEach((player) => {
            if (player.downed || player.eliminated) return;
            const distance = Phaser.Math.Distance.Between(
              ring.x,
              ring.y,
              player.sprite.x,
              player.sprite.y,
            );
            if (
              distance < ring.displayWidth / 2 + 12 &&
              !player.sprite.getData("pulseHit")
            ) {
              player.sprite.setData("pulseHit", true);
              this.damagePlayer(player, 12);
              this.time.delayedCall(900, () =>
                player.sprite.setData("pulseHit", false),
              );
            }
          });
        },
        onComplete: () => ring.destroy(),
      });
      this.tone(95, 0.25, "sawtooth", 0.03);
    }

    private handleBulletHit(
      bulletObject: unknown,
      enemyObject: unknown,
    ) {
      const bullet = bulletObject as import("phaser").Physics.Arcade.Sprite;
      const enemy = enemyObject as import("phaser").Physics.Arcade.Sprite;
      if (!bullet.active || !enemy.active) return;
      const owner = this.players[Number(bullet.getData("owner"))];
      this.recycleBullet(bullet);
      enemy.setData("hp", Number(enemy.getData("hp")) - 1);

      if (!legacyMode) {
        enemy.setTint(0xffffff);
        this.time.delayedCall(55, () => enemy.active && enemy.clearTint());
        this.burst(enemy.x, enemy.y, owner.color, 5);
        this.cameras.main.shake(55, 0.0014);
      }
      this.tone(185, 0.035, "triangle", 0.012);
      if (Number(enemy.getData("hp")) <= 0) {
        const isBoss = Boolean(enemy.getData("boss"));
        const x = enemy.x;
        const y = enemy.y;
        owner.score += Number(enemy.getData("points")) + this.combo * 15;
        this.combo += 1;
        this.comboUntil = this.time.now + 2300;
        this.burst(x, y, isBoss ? 0xff557b : 0xffd23f, isBoss ? 24 : 11);
        enemy.destroy();
        this.tone(isBoss ? 65 : 110, isBoss ? 0.55 : 0.11, "sawtooth", isBoss ? 0.05 : 0.025);
        if (!legacyMode && !isBoss && Phaser.Math.Between(0, 100) < 19) {
          this.spawnPickup(x, y);
        }
      }
    }

    private handlePlayerHit(
      player: PlayerState,
      enemyObject: unknown,
    ) {
      const enemy = enemyObject as import("phaser").Physics.Arcade.Sprite;
      if (
        player.downed ||
        player.eliminated ||
        this.time.now < Number(enemy.getData("nextHit"))
      ) {
        return;
      }
      enemy.setData("nextHit", this.time.now + 780);
      const damage = enemy.getData("boss") ? 22 : enemy.texture.key === "taladro" ? 18 : 12;
      this.damagePlayer(player, damage);
      const push = new Phaser.Math.Vector2(
        enemy.x - player.sprite.x,
        enemy.y - player.sprite.y,
      )
        .normalize()
        .scale(240);
      enemy.setVelocity(push.x, push.y);
    }

    private damagePlayer(player: PlayerState, amount: number) {
      if (this.time.now < player.shieldUntil) {
        this.burst(player.sprite.x, player.sprite.y, 0x52d9ff, 7);
        this.tone(560, 0.07, "sine", 0.018);
        return;
      }
      player.hp = Math.max(0, player.hp - amount);
      if (!legacyMode) {
        this.cameras.main.shake(140, 0.007);
        this.overlay.setAlpha(0.18);
        this.tweens.add({ targets: this.overlay, alpha: 0, duration: 220 });
        player.sprite.setTint(0xff4368);
        this.time.delayedCall(120, () => player.sprite.active && player.sprite.clearTint());
      }
      this.tone(92, 0.13, "square", 0.025);
      if (player.hp <= 0) this.downPlayer(player);
    }

    private downPlayer(player: PlayerState) {
      player.downed = true;
      player.downTimer = 9000;
      player.reviveProgress = 0;
      player.sprite.setTint(0x627384);
      player.sprite.setVelocity(0);
      this.showTip(
        legacyMode
          ? `${player.name} cayó.`
          : `${player.name} cayó · acércate durante 2 segundos para reanimar`,
        4200,
      );
      this.tone(72, 0.4, "triangle", 0.035);
    }

    private updateRevives(delta: number) {
      if (legacyMode) return;
      this.players.forEach((downed) => {
        if (!downed.downed || downed.eliminated) return;
        const helper = this.players.find(
          (candidate) =>
            candidate !== downed &&
            !candidate.downed &&
            !candidate.eliminated &&
            Phaser.Math.Distance.Between(
              candidate.sprite.x,
              candidate.sprite.y,
              downed.sprite.x,
              downed.sprite.y,
            ) < 76,
        );
        downed.reviveProgress = Phaser.Math.Clamp(
          downed.reviveProgress + (helper ? delta / 2100 : -delta / 1700),
          0,
          1,
        );
        if (downed.reviveProgress >= 1) {
          downed.downed = false;
          downed.hp = 48;
          downed.downTimer = 0;
          downed.reviveProgress = 0;
          downed.sprite.clearTint().setAngle(0);
          this.burst(downed.sprite.x, downed.sprite.y, 0x72ef9c, 16);
          this.showTip(`${downed.name} vuelve a la misión`, 2200);
          this.tone(620, 0.18, "sine", 0.035);
        }
      });
    }

    private spawnPickup(x: number, y: number) {
      const roll = Phaser.Math.Between(0, 2);
      const kind = ["heal", "rapid", "shield"][roll];
      const pickup = this.pickups.create(
        x,
        y,
        kind,
      ) as import("phaser").Physics.Arcade.Sprite;
      pickup.setData("kind", kind);
      pickup.setData("expires", this.time.now + 9000);
      pickup.setDepth(8);
      this.tweens.add({
        targets: pickup,
        y: y - 8,
        scale: 1.13,
        duration: 650,
        yoyo: true,
        repeat: -1,
      });
      this.time.delayedCall(9000, () => pickup.active && pickup.destroy());
    }

    private collectPickup(
      player: PlayerState,
      pickupObject: unknown,
    ) {
      const pickup = pickupObject as import("phaser").Physics.Arcade.Sprite;
      if (!pickup.active) return;
      const kind = String(pickup.getData("kind"));
      if (kind === "heal") {
        player.hp = Math.min(player.maxHp, player.hp + 34);
        this.showTip(`${player.name}: cacao sanador +34`, 1800);
      } else if (kind === "rapid") {
        player.rapidUntil = this.time.now + 6500;
        this.showTip(`${player.name}: chuquiragua rápida`, 1800);
      } else {
        player.shieldUntil = this.time.now + 6000;
        this.showTip(`${player.name}: escudo de tagua`, 1800);
      }
      player.score += 75;
      this.burst(pickup.x, pickup.y, player.color, 10);
      pickup.destroy();
      this.tone(720, 0.11, "sine", 0.025);
    }

    private healBetweenWaves() {
      this.players.forEach((player) => {
        if (!player.eliminated) {
          if (player.downed) {
            player.downed = false;
            player.sprite.clearTint().setVisible(true).enableBody(true, player.sprite.x, player.sprite.y, true, true);
          }
          player.hp = Math.min(player.maxHp, player.hp + 28);
        }
      });
    }

    private updateHud(time: number) {
      this.hud.clear();
      this.hud.fillStyle(0x061321, 0.94);
      this.hud.fillRoundedRect(22, 14, 360, 80, 14);
      this.hud.fillRoundedRect(898, 14, 360, 80, 14);
      this.hud.lineStyle(2, 0x345c68, 0.7);
      this.hud.strokeRoundedRect(22, 14, 360, 80, 14);
      this.hud.strokeRoundedRect(898, 14, 360, 80, 14);

      this.players.forEach((player, index) => {
        const x = index === 0 ? 78 : 920;
        const width = 282;
        const hpRatio = Phaser.Math.Clamp(player.hp / player.maxHp, 0, 1);
        const healthRatio = player.downed ? player.reviveProgress : hpRatio;
        const healthWidth = width * healthRatio;
        const healthX = index === 0 ? x : x + width - healthWidth;
        this.hud.fillStyle(0x183442, 1);
        this.hud.fillRoundedRect(x, 56, width, 12, 6);
        this.hud.fillStyle(
          player.eliminated
            ? 0x627384
            : player.downed
              ? 0xffcf52
              : hpRatio > 0.55
                ? 0x72ef9c
                : hpRatio > 0.25
                  ? 0xffc857
                  : 0xff4d6d,
          1,
        );
        if (healthWidth > 0) {
          this.hud.fillRoundedRect(healthX, 56, healthWidth, 12, 6);
        }
        if (!legacyMode) {
          const dashRatio = Phaser.Math.Clamp(
            1 - Math.max(0, player.dashReadyAt - time) / 1850,
            0,
            1,
          );
          const dashWidth = width * dashRatio;
          const dashX = index === 0 ? x : x + width - dashWidth;
          this.hud.fillStyle(0x183442, 1);
          this.hud.fillRoundedRect(x, 75, width, 5, 3);
          this.hud.fillStyle(player.color, 0.9);
          if (dashWidth > 0) {
            this.hud.fillRoundedRect(dashX, 75, dashWidth, 5, 3);
          }
        }
        if (player.downed) {
          this.hud.lineStyle(4, 0xffcf52, 0.9);
          this.hud.strokeCircle(
            player.sprite.x,
            player.sprite.y,
            32 + player.reviveProgress * 7,
          );
        }
        if (time < player.shieldUntil) {
          this.hud.lineStyle(3, 0x52d9ff, 0.75);
          this.hud.strokeCircle(player.sprite.x, player.sprite.y, 31);
        }
      });

      const healthState = (player: PlayerState | undefined) => {
        if (!player) return "VIDA --";
        if (player.eliminated) return "FUERA";
        if (player.downed) {
          const fallen = player.name === "SISA" ? "CAÍDA" : "CAÍDO";
          return `${fallen} ${Math.max(0, Math.ceil(player.downTimer / 1000))}s`;
        }
        const hp = Math.ceil(player.hp);
        if (hp <= player.maxHp * 0.25) return `CRÍTICA ${hp}`;
        if (hp <= player.maxHp * 0.55) return `HERIDA ${hp}`;
        return `VIDA ${hp}`;
      };

      const p1 = this.players[0];
      const p2 = this.players[1];
      this.playerOneText.setText(
        `P1 · ${p1?.name ?? "SISA"}  ${healthState(p1)}  ${
          p1?.score.toString().padStart(5, "0") ?? "00000"
        }`,
      );
      this.playerTwoText.setText(
        `${p2?.score.toString().padStart(5, "0") ?? "00000"}  ${
          healthState(p2)
        }  ${p2?.name ?? "RUMI"} · P2`,
      );
      if (this.combo > 1 && time < this.comboUntil) {
        this.statusText.setText(`COMBO DE EQUIPO ×${this.combo}`);
        this.statusText.setColor("#ffdc66");
      } else {
        if (time >= this.comboUntil) this.combo = 0;
        const active = this.enemies.countActive(true);
        this.statusText.setText(
          this.wave > 0
            ? `Amenazas: ${Math.max(0, active + this.waveQuota + this.pendingSpawns)}`
            : "La reserva andina espera",
        );
        this.statusText.setColor("#91b8c5");
      }
    }

    private showBanner(text: string, color: string) {
      this.waveText.setText(text).setColor(color).setScale(0.84).setAlpha(0);
      this.tweens.add({
        targets: this.waveText,
        alpha: { from: 0, to: 1 },
        scale: 1,
        duration: 380,
        yoyo: true,
        hold: 1100,
        ease: "Sine.inOut",
      });
    }

    private showTip(text: string, duration: number) {
      this.tipText.setText(text).setAlpha(0);
      this.tweens.killTweensOf(this.tipText);
      this.tweens.add({
        targets: this.tipText,
        alpha: 1,
        y: { from: 638, to: 626 },
        duration: 220,
        yoyo: true,
        hold: Math.max(600, duration - 440),
      });
    }

    private showPause() {
      if (this.paused) {
        const shade = this.add
          .rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x030b16, 0.7)
          .setDepth(110)
          .setName("pause-shade");
        const text = this.add
          .text(WIDTH / 2, HEIGHT / 2, "MISIÓN EN PAUSA\n\nPresiona P para continuar", {
            fontFamily: "Arial",
            fontSize: "34px",
            fontStyle: "bold",
            align: "center",
            color: "#fff3c4",
          })
          .setOrigin(0.5)
          .setDepth(111)
          .setName("pause-text");
        shade.setData("text", text);
      } else {
        const shade = this.children.getByName("pause-shade");
        const text = this.children.getByName("pause-text");
        shade?.destroy();
        text?.destroy();
      }
    }

    private finishMission(victory: boolean) {
      if (this.finished) return;
      this.finished = true;
      this.physics.world.isPaused = true;
      const total = this.players.reduce((sum, player) => sum + player.score, 0);
      if (victory) {
        this.coreRings.forEach((ring) => ring.setStrokeStyle(5, 0xffd23f, 1));
        this.burst(WIDTH / 2, 390, 0xffd23f, 34);
        this.tone(520, 0.18, "sine", 0.04);
        this.time.delayedCall(180, () => this.tone(660, 0.18, "sine", 0.04));
        this.time.delayedCall(360, () => this.tone(820, 0.3, "sine", 0.04));
      } else {
        this.tone(72, 0.7, "sawtooth", 0.04);
      }

      const shade = this.add
        .rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x030b16, 0.82)
        .setDepth(120);
      const panel = this.add
        .rectangle(WIDTH / 2, 360, 620, 390, 0x0c2236, 0.98)
        .setStrokeStyle(3, victory ? 0xffd23f : 0xff557b, 0.9);
      const title = this.add
        .text(
          WIDTH / 2,
          220,
          victory ? "EL INTI VUELVE A BRILLAR" : "EL ECLIPSE VENCIÓ",
          {
            fontFamily: "Arial",
            fontSize: "36px",
            fontStyle: "bold",
            color: victory ? "#ffe68a" : "#ff8098",
            align: "center",
          },
        )
        .setOrigin(0.5);
      const subtitle = this.add
        .text(
          WIDTH / 2,
          292,
          victory
            ? "Sisa y Rumi protegieron juntos la reserva andina."
            : "Coordinen sus impulsos y manténganse cerca para reanimarse.",
          {
            fontFamily: "Arial",
            fontSize: "18px",
            color: "#b8d7dd",
            align: "center",
          },
        )
        .setOrigin(0.5);
      const score = this.add
        .text(
          WIDTH / 2,
          360,
          `PUNTAJE DE EQUIPO\n${total.toString().padStart(6, "0")}`,
          {
            fontFamily: "Arial",
            fontSize: "23px",
            fontStyle: "bold",
            color: "#ffffff",
            align: "center",
            lineSpacing: 8,
          },
        )
        .setOrigin(0.5);
      const replay = this.add
        .text(WIDTH / 2, 470, "R · VOLVER A INTENTAR", {
          fontFamily: "Arial",
          fontSize: "17px",
          fontStyle: "bold",
          color: "#122036",
          backgroundColor: "#ffd23f",
          padding: { x: 26, y: 14 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      replay.on("pointerdown", () => this.scene.restart());
      this.endPanel = this.add
        .container(0, 0, [shade, panel, title, subtitle, score, replay])
        .setDepth(120);
    }

    private burst(x: number, y: number, color: number, amount: number) {
      if (legacyMode) return;
      for (let i = 0; i < amount; i += 1) {
        const particle = this.add
          .circle(x, y, Phaser.Math.Between(2, 5), color, 0.9)
          .setDepth(30);
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const distance = Phaser.Math.Between(22, amount > 20 ? 115 : 64);
        this.tweens.add({
          targets: particle,
          x: x + Math.cos(angle) * distance,
          y: y + Math.sin(angle) * distance,
          scale: 0,
          alpha: 0,
          duration: Phaser.Math.Between(280, 620),
          ease: "Cubic.out",
          onComplete: () => particle.destroy(),
        });
      }
    }

    private tone(
      frequency: number,
      duration: number,
      type: OscillatorType,
      volume: number,
    ) {
      if (legacyMode || !this.started) return;
      const manager = this.sound as import("phaser").Sound.WebAudioSoundManager;
      const context = manager.context;
      if (!context || context.state !== "running") return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      gain.gain.setValueAtTime(volume, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + duration,
      );
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration);
    }

    private playAmbientPulse(time: number) {
      if (legacyMode || time < this.lastMusicAt + 900) return;
      this.lastMusicAt = time;
      const notes = [110, 138.59, 164.81, 138.59];
      this.tone(notes[Math.floor(time / 900) % notes.length], 0.26, "sine", 0.008);
    }

    private centerCanvas() {
      const canvas = this.game.canvas;
      canvas.setAttribute(
        "aria-label",
        "Guardianes del Inti, shooter cooperativo local para dos jugadores",
      );
    }
  }

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    parent,
    backgroundColor: "#071528",
    transparent: false,
    antialias: true,
    pixelArt: false,
    input: { gamepad: true },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [GuardianesScene],
  });

  return {
    destroy: () => game.destroy(true),
  };
}
