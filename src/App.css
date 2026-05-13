// ✅ FULL APP.jsx — Neon Conscription Terminal (WORKING BASE VERSION)

import React, { useState, useMemo } from "react";

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

export default function App() {
  const [name, setName] = useState("");
  const [scanning, setScanning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const serviceNumber = useMemo(() => generateServiceNumber(name), [name]);
  const nodeId = useMemo(() => generateNodeId(name), [name]);

  function startScan() {
    if (!name) return;

    setScanning(true);

    setTimeout(() => {
      setScanning(false);
      setComplete(true);

      setShowOverlay(true);
      playGlitchSound();

      setTimeout(() => setShowOverlay(false), 900);
    }, 1800);
  }

  return (
    <div className={`app ${showOverlay ? "shake" : ""}`}>
      {showOverlay && (
        <AccessGranted
          serviceNumber={serviceNumber}
          nodeId={nodeId}
        />
      )}

      <h1>Neon Conscription Terminal</h1>

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

        input {
          padding: 10px;
          margin-top: 20px;
          width: 250px;
        }

        button {
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
      `}</style>
    </div>
  );
}