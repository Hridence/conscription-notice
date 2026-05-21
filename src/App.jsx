// ✅ FULL APP.jsx — Steel Conscription Terminal (WORKING BASE VERSION)

import React, { useState, useMemo, useEffect, useRef } from "react";

function generateServiceNumber(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }

  const partA = Math.abs(hash % 9999).toString().padStart(4, "0");
  const partB = Math.abs((hash * 7) % 9999).toString().padStart(4, "0");
  const partC = Math.abs((hash * 13) % 999).toString().padStart(3, "0");

  return `ND-${partA}-${partB}-${partC}`;
}

function generateNodeId(name) {
  return `NODE-${btoa(name).slice(0, 6).toUpperCase()}-${Math.floor(
    Math.random() * 999
  )
    .toString()
    .padStart(3, "0")}`;
}

// 🔊 Glitch sound
function playGlitchSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {}
}

// 🔤 Terminal typing tick (very short blip, low volume)
let __typeAudioCtx;

function getTypeAudioCtx() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  if (!__typeAudioCtx) __typeAudioCtx = new AudioCtx();
  return __typeAudioCtx;
}

function ensureAudioStarted() {
  const ctx = getTypeAudioCtx();
  if (!ctx) return;

  // If the browser suspended audio, resume after a user gesture
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

function playTypeTick() {
  const ctx = getTypeAudioCtx();
  if (!ctx) return;

  // If audio is suspended, we can't play yet (needs user gesture)
  if (ctx.state !== "running") return;

  const t0 = ctx.currentTime;

  // Slightly longer so it’s audible on more devices
  const dur = 0.03; // 30ms

  // Noise buffer
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    const n = (Math.random() * 2 - 1);
    // Taper to keep it clicky
    data[i] = n * (1 - i / data.length);
  }

  const src = ctx.createBufferSource();
  src.buffer = buffer;

  // Less extreme filter so it doesn’t vanish
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1100 + Math.random() * 500, t0);
  filter.Q.setValueAtTime(6, t0);

  // Slightly louder envelope
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.08, t0 + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  src.start(t0);
  src.stop(t0 + dur);
}
function AccessGranted({ serviceNumber, nodeId }) {
  return (
    <div className="overlay">
      <div className="panel">
        <h1 className="glitch">ACCESS GRANTED</h1>

        <div className="info">
          <div>
            <strong>NODE</strong>
            <span>{nodeId}</span>
          </div>
          <div>
            <strong>SERVICE NO.</strong>
            <span>{serviceNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BootScreen({ onDone }) {
  const [buffer, setBuffer] = useState("");
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
const lastTickSoundRef = useRef(0);

  const script = useMemo(() => {
    const t = new Date();
    const stamp = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")} ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}:${String(t.getSeconds()).padStart(2, "0")}`;
    return [
      `// The Steel Legion :: CONSCRIPTION TERMINAL v3.7 (MIL-SPEC)`,
      `// BOOT: ${stamp}`,
      `INIT :: power_rail=OK  coolant=OK  chassis=SEALED`,
      `AUTH :: enclave_key=VALID  cipher=NOCTURNE-256`,
      `LINK :: sat-uplink=LOCKED  relay=ACTIVE  jitter=0.3ms`,
      `SCAN :: threat-matrix=GREEN  dissent-index=RISING`,
      `LOAD :: doctrine_packets=[URBAN, ORBITAL, DUST]`,
      `LOAD :: compliance_clauses=[9.13, 11.02, 17.77]`,
      `MOUNT:: citizen_registry=ONLINE`,
      `MOUNT:: requisition_queue=ONLINE`,
      `READY:: awaiting biometric input…`,
    ];
  }, []);

  useEffect(() => {
    let line = 0;
    let char = 0;
    let alive = true;

    const tick = () => {
      if (!alive) return;

      const current = script[line] ?? "";
      const nextChar = current.slice(0, char + 1);

      const joined = script
        .slice(0, line)
        .join("\n")
        + (line > 0 ? "\n" : "")
        + nextChar
        + "_";

      setBuffer(joined);

// Play a tiny tick occasionally (throttle so it doesn't spam)
const now = performance.now();
if (now - lastTickSoundRef.current > 28) {
  playTypeTick();
  lastTickSoundRef.current = now;
}

      // Progress is just for vibe (not exact)
      const denom = Math.max(1, script.length * 14);
      setProgress(Math.min(100, Math.floor(((line * 14 + char) / denom) * 100)));

      char++;
      if (char >= current.length) {
        line++;
        char = 0;
        if (line >= script.length) {
          setProgress(100);
          setDone(true);
          return;
        }
      }

      requestAnimationFrame(tick);
    };

    const start = setTimeout(() => requestAnimationFrame(tick), 350);

    return () => {
      alive = false;
      clearTimeout(start);
    };
  }, [script]);

  return (
    <div className="boot" onPointerDown={ensureAudioStarted}>
      <div className="scanlines" />
      <div className="bootGlow" />

      <div className="bootWrap">
        <div className="bootTop">
          <div className="bootTitle">BOOT SEQUENCE</div>
          <button className="bootBtn" onClick={onDone}>SKIP</button>
        </div>

        <pre className="bootTerminal">{buffer}</pre>

        <div className="bootFooter">
          <div className="bootProgressRow">
            <span>System Load</span>
            <span className="mono">{progress}%</span>
          </div>
          <div className="bootBar">
            <div className="bootBarFill" style={{ width: `${progress}%` }} />
          </div>

          <div className="bootActionRow">
            <span className="bootStatus">
              Status: <span className={done ? "ok" : "warn"}>{done ? "READY" : "INITIALIZING"}</span>
            </span>

            <button className="bootBtn primary" disabled={!done} onClick={onDone}>
              ENTER TERMINAL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnterGlitchOverlay() {
  return (
    <div className="enterOverlay">
      <div className="enterText" data-text="ENTERING TERMINAL">
        ENTERING TERMINAL
      </div>
    </div>
  );
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const [entering, setEntering] = useState(false);
const [started, setStarted] = useState(false);

  const [name, setName] = useState("");
  const [scanning, setScanning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  const serviceNumber = useMemo(() => generateServiceNumber(name), [name]);
  const nodeId = useMemo(() => generateNodeId(name), [name]);

  function handleEnterTerminal() {
    setEntering(true);
    playGlitchSound(); // ✅ add sound here

    // Force one paint frame so overlay actually renders
    requestAnimationFrame(() => {
      setTimeout(() => {
        setEntering(false);
        setBooted(true);
      }, 1500);
    });
  }

  function startScan() {
    if (!name) return;

    setScanning(true);

    setTimeout(() => {
      setScanning(false);
      setComplete(true);
      setShowNotice(true);


      setShowOverlay(true);
      playGlitchSound();

      setTimeout(() => setShowOverlay(false), 900);
    }, 1800);
  }

  // ✅ IMPORTANT: Always render styles, regardless of booted state
  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: monospace;
          background: black;
        }

        .app {
          color: #9fffd4;
          padding: 40px;
          text-align: center;
        }

        .app input {
          padding: 10px;
          margin-top: 20px;
          width: 250px;
}

        .app button {
          display: block;
          margin: 20px auto;
          padding: 10px 20px;
          cursor: pointer;
}

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .panel {
          border: 1px solid #00ffcc;
          padding: 30px;
          text-align: center;
        }

        .glitch {
          font-size: 28px;
          color: #00ffcc;
        }

        .info {
          margin-top: 20px;
        }

        .info div {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }

        .shake {
          animation: shake 0.3s;
        }

        @keyframes shake {
          0% { transform: translate(0); }
          25% { transform: translate(-2px, 2px); }
          50% { transform: translate(2px, -2px); }
          75% { transform: translate(-2px, -2px); }
          100% { transform: translate(0); }
        }

        /* --- Boot Screen --- */
        .boot {
          position: fixed;
          inset: 0;
          background: #000;
          color: #9fffd4;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
        }

        .bootWrap {
  width: min(900px, 92vw);
  height: min(620px, 85vh);
  border: 1px solid rgba(0, 255, 204, 0.25);
  background: rgba(0,0,0,0.65);
  box-shadow: 0 30px 100px rgba(0,0,0,0.75);
  padding: 18px;
  position: relative;
  overflow: hidden;

  /* ✅ NEW: force proper vertical layout */
  display: flex;
  flex-direction: column;
}

.bootTerminal {
  /* ✅ NEW: let it grow/shrink correctly */
  flex: 1;
  min-height: 0;

  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(0,0,0,0.55);
  padding: 14px;
  overflow: auto;
  white-space: pre-wrap;
  line-height: 1.35;
}

        .bootFooter {
          margin-top: 10px;
        }

        .bootProgressRow {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          opacity: 0.85;
        }

        .bootBar {
          margin-top: 8px;
          height: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.55);
          overflow: hidden;
        }

        .bootBarFill {
          height: 100%;
          background: linear-gradient(90deg, rgba(236,72,153,0.85), rgba(59,130,246,0.85));
        }

        .bootActionRow {
          margin-top: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .mono { font-family: monospace; }
        .ok { color: #71ffbf; }
        .warn { color: #ffd36b; }

        .scanlines::before {
          content: "";
          position: fixed;
          inset: 0;
          background: repeating-linear-gradient(
            to bottom,
            rgba(255,255,255,0.05),
            rgba(255,255,255,0.05) 1px,
            rgba(0,0,0,0) 3px,
            rgba(0,0,0,0) 6px
          );
          opacity: 0.18;
          pointer-events: none;
        }

        .bootGlow {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(circle at top, rgba(236,72,153,0.18), transparent 55%),
            radial-gradient(circle at bottom, rgba(59,130,246,0.14), transparent 55%);
          pointer-events: none;
        }

        /* --- Enter Terminal Glitch Overlay --- */
        .enterOverlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          background: rgba(0,0,0,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .enterText {
          position: relative;
          font-family: monospace;
          font-weight: 800;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(167, 243, 208, 0.95);
          text-shadow: 0 0 12px rgba(16,185,129,0.35), 0 0 25px rgba(236,72,153,0.18);
          padding: 18px 22px;
          border: 1px solid rgba(16,185,129,0.35);
          border-radius: 14px;
          background: rgba(0,0,0,0.55);
          overflow: hidden;
          animation: enterPop 120ms ease-out 1;
        }

        .enterText::before,
        .enterText::after {
          content: attr(data-text);
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 18px 22px;
          mix-blend-mode: screen;
          opacity: 0.75;
          pointer-events: none;
        }

        .enterText::before {
          color: rgba(59,130,246,0.9);
          transform: translate(2px, -1px);
          clip-path: inset(10% 0 65% 0);
          animation: enterGlitch 380ms steps(2,end) 2;
        }

        .enterText::after {
          color: rgba(236,72,153,0.9);
          transform: translate(-2px, 1px);
          clip-path: inset(55% 0 10% 0);
          animation: enterGlitch 420ms steps(2,end) 2;
        }

        @keyframes enterPop {
          from { transform: scale(0.98); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes enterGlitch {
          0% { clip-path: inset(10% 0 70% 0); transform: translate(2px,-1px); }
          20% { clip-path: inset(40% 0 35% 0); transform: translate(-3px,1px); }
          40% { clip-path: inset(65% 0 15% 0); transform: translate(3px,0px); }
          60% { clip-path: inset(25% 0 55% 0); transform: translate(-2px,-1px); }
          80% { clip-path: inset(55% 0 20% 0); transform: translate(2px,2px); }
          100% { clip-path: inset(10% 0 70% 0); transform: translate(0px,0px); }
        }
/* --- Legion Seal (Watermark + Stamp) --- */
.notice {
  position: relative; /* required for watermark/stamp positioning */
  overflow: hidden;
}

.sealWatermark {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
  opacity: 0.50;               /* watermark strength */
  filter: saturate(1.2);
  transform: rotate(-10deg);
}

.sealRing {
  width: 420px;
  height: 420px;
  border-radius: 50%;
  border: 2px solid rgba(0, 255, 204, 0.45);
  box-shadow: 0 0 60px rgba(0, 255, 204, 0.12);
  display: grid;
  place-items: center;
  position: relative;
}

.sealRing::before {
  content: "";
  position: absolute;
  inset: 18px;
  border-radius: 50%;
  border: 1px dashed rgba(0, 255, 204, 0.35);
}

.sealInner {
  width: 320px;
  height: 320px;
  border-radius: 50%;
  border: 1px solid rgba(0, 255, 204, 0.35);
  display: grid;
  place-items: center;
  position: relative;
}

.sealLogo {
  font-size: 88px;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: rgba(0, 255, 204, 0.55);
  text-shadow: 0 0 22px rgba(0, 255, 204, 0.2);
}

.sealTextTop,
.sealTextBottom {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  letter-spacing: 0.35em;
  font-weight: 800;
  color: rgba(0, 255, 204, 0.45);
  text-transform: uppercase;
  white-space: nowrap;
}

.sealTextTop { top: 26px; }
.sealTextBottom { bottom: 26px; }

/* --- Bottom centered stamp --- */
.sealStamp {
  border: 2px solid rgba(236, 72, 153, 0.55);
  background: rgba(236, 72, 153, 0.08);
  padding: 10px 14px;
  border-radius: 12px;
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.45);
  pointer-events: none;
  display: inline-block;
}

/* Put it at the bottom center of the NOTICE */
.sealStampBottom {
  position: absolute;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%) rotate(-2deg);
  z-index: 2;
}

/* Keep text styling */
.sealStampTitle {
  font-weight: 900;
  letter-spacing: 0.24em;
  color: rgba(255, 200, 235, 0.95);
  font-size: 14px;
  text-align: center;
}

.sealStampSub {
  margin-top: 4px;
  font-size: 10px;
  letter-spacing: 0.22em;
  opacity: 0.9;
  color: rgba(255, 200, 235, 0.85);
  text-align: center;
}

.sealStampId {
  margin-top: 8px;
  font-size: 10px;
  letter-spacing: 0.12em;
  opacity: 0.85;
  color: rgba(255, 200, 235, 0.8);
  text-align: center;
}

      `}</style>
{!started ? (
        <div className="boot" style={{ textAlign: "center" }}>
          <div className="bootWrap" style={{ maxWidth: 500 }}>
            <h2 style={{ marginBottom: 20 }}>The Steel Legion</h2>

            <button
              className="bootBtn primary"
              onClick={() => {
                ensureAudioStarted(); // unlock audio
                playTypeTick();       // tiny confirmation tick
                setStarted(true);     // proceed to boot sequence
              }}
            >
              ENLISTMENT TERMINAL // ACTIVATE
            </button>
          </div>
        </div>
      ) : !booted ? (
        <>
          {entering && <EnterGlitchOverlay />}
          <BootScreen onDone={handleEnterTerminal} />
        </>
      ) : (
        <div className={`app ${showOverlay ? "shake" : ""}`}>
          {showOverlay && (
            <AccessGranted serviceNumber={serviceNumber} nodeId={nodeId} />
          )}

          <h1>Steel Conscription Terminal</h1>

          <input
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button onClick={startScan} disabled={!name || scanning}>
            {scanning ? "Scanning..." : "Submit Biometric Scan"}
          </button>

          <div style={{ marginTop: 20 }}>
            <strong>Service Number:</strong>{" "}
            {complete ? serviceNumber : "ND-████-████-███"}
          </div>
{showNotice && (
  <div className="notice">

<div className="sealWatermark" aria-hidden="true">
  <div className="sealRing">
    <div className="sealInner">
      <div className="sealLogo">SL</div>
      <div className="sealTextTop">The Steel Legion</div>
      <div className="sealTextBottom">UNITY THROUGH STEEL</div>
    </div>
  </div>
</div>

    <div className="noticeHeader">
      MANDATORY ENLISTMENT ORDER
      <div className="noticeMotto">UNITY THROUGH STEEL</div>
    </div>

    <div className="noticeMeta">

      <div><span>RECIPIENT:</span> {name}</div>
      <div><span>SERVICE NO:</span> {serviceNumber}</div>
      <div><span>NODE:</span> {nodeId}</div>
      <div><span>STATUS:</span> SELECTED — HONOURS LIST</div>
    </div>

    <div className="noticeBody">
      <p><strong>Citizen {name}, rejoice.</strong></p>

      <p>
        The Steel Legion has reviewed the living ledger and placed its mark upon you.
        Among countless lives, yours has been measured and found <strong>worthy of service</strong>.
        This distinction is beyond wealth, beyond family, beyond name.
      </p>

      <p>
        You have been chosen to advance the <strong>Greater Glory of the Legion</strong>.
        You will stand where others falter. You will hold where others break.
        You will become a shining instrument of Directorate purpose—proof that order can be forged from chaos.
      </p>

      <p className="noticeOath">
        “<strong>Unity Through Steel</strong>.”<br />
        “Steel in the hand. Steel in the spine. Steel in the will.”
      </p>

      <div className="noticeCallout">
        <div><span>REPORT WINDOW:</span> <strong>WITHIN 72 HOURS</strong></div>
        <div><span>REPORT TO:</span> <strong>INTAKE LOCUS // SECTOR 7‑GLASS // BAY 13</strong></div>
        <div><span>BRING:</span> <strong>THIS NOTICE</strong> (DIGITAL OR PRINTED) + <strong>BIOMETRIC CONFIRMATION</strong></div>
        <div><span>DIRECTIVE:</span> <strong>COMPLIANCE IS CELEBRATED</strong></div>
      </div>

      <p className="noticeFine">
        Failure to report constitutes breach of Mobilization Statute 9.13 and authorizes corrective retrieval.
        Your compliance will be celebrated. Your absence will be corrected.
      </p>
    </div>

    <div className="noticeActions">
      <button onClick={() => window.print()}>Print / Save PDF</button>
      <button className="secondary" onClick={() => setShowNotice(false)}>Hide Notice</button>
    </div>
<div className="sealStamp" aria-hidden="true">
  <div className="sealStampTitle">VERIFIED</div>
  <div className="sealStampSub">LEGION SEAL</div>
  <div className="sealStampId">NODE: {nodeId}</div>
</div>

  </div>
)}

        </div>


      )}
</>
);
}
