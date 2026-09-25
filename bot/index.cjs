const bedrock = require("bedrock-protocol");

const host = process.env.MC_HOST || "painplay.aternos.me";
const port = Number(process.env.MC_PORT || 30055);
const username = process.env.MC_USERNAME || "AternosAFKBot";
const authMode = (process.env.MC_AUTH || "offline").toLowerCase();
const intervalMs = Math.max(
  10_000,
  Number(process.env.MC_AFK_INTERVAL_MS || 45_000),
);
const reconnectMs = Math.max(
  5_000,
  Number(process.env.MC_RECONNECT_MS || 10_000),
);

let reconnectTimer;
let shuttingDown = false;

function start() {
  if (shuttingDown) return;

  console.log(`[AFK] Connecting to ${host}:${port} as ${username}...`);

  const options = {
    host,
    port,
    username,
    offline: authMode === "offline",
    raknetBackend: "jsp-raknet",
  };

  if (process.env.MC_VERSION) {
    options.version = process.env.MC_VERSION;
  }

  if (authMode !== "offline") {
    options.profilesFolder = process.env.MC_PROFILES_FOLDER || ".auth";
    options.onMsaCode = (data) => {
      console.log("\nMicrosoft sign-in required:");
      console.log(`  Open: ${data.verification_uri}`);
      console.log(`  Code: ${data.user_code}\n`);
    };
  }

  const client = bedrock.createClient(options);
  let afkTimer;
  let tick = 0;
  let yaw = 0;

  const stopAfk = () => {
    if (afkTimer) {
      clearInterval(afkTimer);
      afkTimer = undefined;
    }
  };

  const sendAfkInput = () => {
    tick += 20;
    yaw = (yaw + 45) % 360;

    try {
      client.queue("player_auth_input", {
        pitch: 0,
        yaw,
        position: { x: 0, y: 0, z: 0 },
        move_vector: { x: 0, y: 0 },
        head_yaw: yaw,
        input_data: 0,
        input_mode: 3,
        play_mode: 0,
        interaction_model: 0,
        client_tick: tick,
        input_tick: tick,
        vehicle_rotation: { x: 0, y: 0 },
      });
    } catch (error) {
      console.error(`[AFK] Input error: ${error.message}`);
    }
  };

  client.on("join", () => {
    console.log("[AFK] Authenticated and joined the server.");
  });

  client.on("spawn", () => {
    console.log(
      `[AFK] Spawned. Sending AFK input every ${intervalMs / 1000}s.`,
    );
    stopAfk();
    sendAfkInput();
    afkTimer = setInterval(sendAfkInput, intervalMs);
  });

  client.on("kick", (packet) => {
    console.error("[AFK] Kicked:", packet);
  });

  client.on("error", (error) => {
    console.error(`[AFK] Connection error: ${error.message}`);
  });

  client.once("close", () => {
    stopAfk();
    if (shuttingDown) return;

    console.log(`[AFK] Disconnected. Retrying in ${reconnectMs / 1000}s...`);
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(start, reconnectMs);
  });
}

function shutdown(signal) {
  shuttingDown = true;
  clearTimeout(reconnectTimer);
  console.log(`\n[AFK] ${signal}. Shutting down.`);
  process.exit(0);
}

process.on("SIGINT", () => shutdown("Interrupted"));
process.on("SIGTERM", () => shutdown("Stopped"));

start();