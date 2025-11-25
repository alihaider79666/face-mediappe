// import { FaceMesh } from "@mediapipe/face_mesh";
// import React, { useRef, useEffect, useState } from "react";
// import * as Facemesh from "@mediapipe/face_mesh";
// import * as cam from "@mediapipe/camera_utils";
// import Webcam from "react-webcam";

// function App() {
//   const webcamRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [expression, setExpression] = useState("Smile for Magic!");
//   const [particles, setParticles] = useState([]);
//   const [fps, setFps] = useState(0);

//   let frameCount = 0;
//   let lastTime = performance.now();

//   const connect = window.drawConnectors;

//   // Detect smile / surprise
//   const detectEmotion = (landmarks) => {
//     const left = landmarks[61];
//     const right = landmarks[291];
//     const top = landmarks[13];
//     const bottom = landmarks[14];

//     const mouthWidth = Math.hypot(right.x - left.x, right.y - left.y);
//     const mouthHeight = Math.abs(bottom.y - top.y);
//     const ratio = mouthHeight / mouthWidth;

//     if (ratio > 0.5) {
//       setExpression("WOW! Surprised");
//       spawnHearts(landmarks[1]); // nose tip
//     } else if (ratio > 0.25) {
//       setExpression("So Happy!");
//       spawnHearts(landmarks[1]);
//     } else {
//       setExpression("Keep Smiling");
//     }
//   };

//   // Spawn flying hearts
//   const spawnHearts = (nose) => {
//     const newHearts = [];
//     for (let i = 0; i < 20; i++) {
//       newHearts.push({
//         x: nose.x * 640,
//         y: nose.y * 480 - 40,
//         vx: (Math.random() - 0.5) * 10,
//         vy: Math.random() * -12 - 6,
//         life: 70,
//         size: 20 + Math.random() * 30,
//         rotation: 0,
//         spin: (Math.random() - 0.5) * 0.3,
//       });
//     }
//     setParticles(prev => [...prev, ...newHearts].slice(-100));
//   };

//   const onResults = (results) => {
//     if (!canvasRef.current || !webcamRef.current?.video) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     const w = webcamRef.current.video.videoWidth;
//     const h = webcamRef.current.video.videoHeight;

//     canvas.width = w;
//     canvas.height = h;

//     ctx.save();
//     ctx.clearRect(0, 0, w, h);

//     // Animated cosmic background
//     const time = Date.now() * 0.001;
//     const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w);
//     grad.addColorStop(0, `hsl(${(time * 60) % 360}, 100%, 60%)`);
//     grad.addColorStop(1, "#0a001f");
//     ctx.fillStyle = grad;
//     ctx.fillRect(0, 0, w, h);

//     if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
//       const landmarks = results.multiFaceLandmarks[0];

//       detectEmotion(landmarks);

//       // Neon face outline
//       ctx.shadowBlur = 40;
//       ctx.shadowColor = "#ff00ff";
//       connect(ctx, landmarks, Facemesh.FACEMESH_FACE_OVAL, { color: "#ff00ff", lineWidth: 8 });
//       ctx.shadowBlur = 20;
//       ctx.shadowColor = "#00ffff";
//       connect(ctx, landmarks, Facemesh.FACEMESH_FACE_OVAL, { color: "#00ffff", lineWidth: 4 });

//       // Neon eyes
//       connect(ctx, landmarks, Facemesh.FACEMESH_LEFT_EYE, { color: "#00ffea", lineWidth: 6 });
//       connect(ctx, landmarks, Facemesh.FACEMESH_RIGHT_EYE, { color: "#ff3399", lineWidth: 6 });

//       // All 468 glowing rainbow landmarks
//       landmarks.forEach((p, i) => {
//         const x = p.x * w;
//         const y = p.y * h;
//         ctx.fillStyle = `hsl(${(i * 360) / 468}, 100%, 70%)`;
//         ctx.beginPath();
//         ctx.arc(x, y, 2.5, 0, Math.PI * 2);
//         ctx.fill();
//         ctx.shadowBlur = 12;
//         ctx.shadowColor = ctx.fillStyle;
//         ctx.fill();
//         ctx.shadowBlur = 0;
//       });

//       // Golden Human
//       const headTop = landmarks[10];
//       ctx.font = "bold 100px Arial";
//       ctx.fillStyle = "#FFD700";
//       ctx.strokeStyle = "#B8860B";
//       ctx.lineWidth = 12;
//       ctx.textAlign = "center";
//       ctx.strokeText("Human", headTop.x * w, headTop.y * h - 100);
//       ctx.fillText("Human", headTop.x * w, headTop.y * h - 100);

//       // Update particles
//       setParticles(prev =>
//         prev
//           .map(p => ({
//             ...p,
//             x: p.x + p.vx,
//             y: p.y + p.vy,
//             vy: p.vy + 0.3,
//             life: p.life - 1,
//             rotation: p.rotation + p.spin,
//           }))
//           .filter(p => p.life > 0)
//       );

//       // Draw hearts
//       particles.forEach(p => {
//         ctx.save();
//         ctx.globalAlpha = p.life / 70;
//         ctx.translate(p.x, p.y);
//         ctx.rotate(p.rotation);
//         ctx.font = `${p.size}px Arial`;
//         ctx.fillStyle = "#ff3366";
//         ctx.fillText("Heart", 0, 0);
//         ctx.restore();
//       });
//       ctx.globalAlpha = 1;
//     }

//     // Dim webcam feed
//     ctx.globalAlpha = 0.3;
//     ctx.drawImage(results.image, 0, 0, w, h);
//     ctx.globalAlpha = 1;

//     // FPS counter
//     frameCount++;
//     const now = performance.now();
//     if (now - lastTime >= 1000) {
//       setFps(frameCount);
//       frameCount = 0;
//       lastTime = now;
//     }

//     ctx.restore();
//   };

//   useEffect(() => {
//     const faceMesh = new FaceMesh({
//       locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
//     });

//     faceMesh.setOptions({
//       maxNumFaces: 1,
//       refineLandmarks: true,
//       minDetectionConfidence: 0.5,
//       minTrackingConfidence: 0.5,
//     });

//     faceMesh.onResults(onResults);

//     if (webcamRef.current && webcamRef.current.video) {
//       const camera = new cam.Camera(webcamRef.current.video, {
//         onFrame: async () => {
//           if (webcamRef.current?.video) {
//             await faceMesh.send({ image: webcamRef.current.video });
//           }
//         },
//         width: 640,
//         height: 480,
//       });
//       camera.start();
//     }
//   }, []);

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "linear-gradient(135deg, #667eea, #764ba2)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         fontFamily: "sans-serif",
//       }}
//     >
//       <div
//         style={{
//           position: "relative",
//           borderRadius: "40px",
//           overflow: "hidden",
//           boxShadow: "0 0 120px rgba(255,0,255,0.9)",
//           border: "8px solid #ff00ff",
//           background: "rgba(0,0,0,0.4)",
//           backdropFilter: "blur(15px)",
//         }}
//       >
//         {/* LIVE Badge */}
//         <div
//           style={{
//             position: "absolute",
//             top: 20,
//             left: 20,
//             background: "rgba(255,0,0,0.8)",
//             color: "white",
//             padding: "12px 24px",
//             borderRadius: "30px",
//             fontWeight: "bold",
//             fontSize: "18px",
//             zIndex: 10,
//             animation: "pulse 2s infinite",
//           }}
//         >
//           LIVE • {fps} FPS
//         </div>

//         <Webcam ref={webcamRef} style={{ display: "none" }} />
//         <canvas ref={canvasRef} style={{ borderRadius: "32px", display: "block" }} />

//         {/* Floating Expression */}
//         <div
//           style={{
//             position: "absolute",
//             bottom: 40,
//             left: "50%",
//             transform: "translateX(-50%)",
//             background: "linear-gradient(90deg, #ff00ff, #00ffff)",
//             WebkitBackgroundClip: "text",
//             color: "transparent",
//             fontSize: "42px",
//             fontWeight: "bold",
//             textShadow: "0 0 40px rgba(255,0,255,0.8)",
//             animation: "glow 3s infinite",
//           }}
//         >
//           {expression}
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes pulse {
//           0%, 100% { transform: scale(1); }
//           50% { transform: scale(1.1); }
//         }
//         @keyframes glow {
//           0%, 100% { text-shadow: 0 0 30px #ff00ff; }
//           50% { text-shadow: 0 0 70px #00ffff; }
//         }
//       `}</style>
//     </div>
//   );
// }

// export default App;



import { FaceMesh } from "@mediapipe/face_mesh";
import React, { useRef, useEffect, useState } from "react";
import * as Facemesh from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";

export default function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [emotion, setEmotion] = useState("Neutral");
  const [confidence, setConfidence] = useState(0);
  const [status, setStatus] = useState("Initializing AI Engine...");

  const connect = window.drawConnectors;

  const detectEmotion = (landmarks) => {
    const left = landmarks[61];
    const right = landmarks[291];
    const top = landmarks[13];
    const bottom = landmarks[14];

    const mouthWidth = Math.hypot(right.x - left.x, right.y - left.y);
    const mouthHeight = Math.abs(bottom.y - top.y);
    const ratio = mouthHeight / mouthWidth;

    let detected = "Neutral";
    let score = 88;

    if (ratio > 0.55) {
      detected = "Surprised";
      score = Math.min(99, 75 + (ratio - 0.55) * 600);
    } else if (ratio > 0.30) {
      detected = "Happy";
      score = Math.min(99, 80 + (ratio - 0.30) * 500);
    } else if (ratio < 0.12) {
      detected = "Serious";
      score = Math.min(99, 85 + (0.12 - ratio) * 900);
    }

    setEmotion(detected);
    setConfidence(Math.round(score));
    setStatus("Face Detected • Real-time Analysis");
  };

  const onResults = (results) => {
    if (!canvasRef.current || !webcamRef.current?.video) return;

    const canvas = canvasRef.current;
    const video = webcamRef.current.video;
    const ctx = canvas.getContext("2d");

    const container = canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight || width * 0.75;

    canvas.width = width;
    canvas.height = height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
    gradient.addColorStop(0, "#1e0038");
    gradient.addColorStop(0.5, "#0f001a");
    gradient.addColorStop(1, "#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    if (results.multiFaceLandmarks?.[0]) {
      const landmarks = results.multiFaceLandmarks[0];
      detectEmotion(landmarks);

      ctx.lineWidth = 1.4 + width / 1000;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#c084fc";

      connect(ctx, landmarks, Facemesh.FACEMESH_FACE_OVAL, { color: "#a78bfa77" });
      connect(ctx, landmarks, Facemesh.FACEMESH_LEFT_EYE, { color: "#c084fc" });
      connect(ctx, landmarks, Facemesh.FACEMESH_RIGHT_EYE, { color: "#c084fc" });
      connect(ctx, landmarks, Facemesh.FACEMESH_LIPS, { color: "#f472b6" });

      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 0.18;
    ctx.drawImage(video, 0, 0, width, height);
    ctx.globalAlpha = 1;
    ctx.restore();
  };

  useEffect(() => {
    setStatus("Loading AI Model...");

    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.75,
      minTrackingConfidence: 0.75,
    });

    faceMesh.onResults(onResults);

    const camera = new cam.Camera(webcamRef.current.video, {
      onFrame: async () => {
        await faceMesh.send({ image: webcamRef.current.video });
      },
      width: 1280,
      height: 720,
    });

    camera.start().then(() => {
      setStatus("AI Ready • Waiting for face");
    });

    const handleResize = () => {
      if (canvasRef.current && webcamRef.current?.video) {
        onResults({ image: webcamRef.current.video });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="emotion-app">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        <div className="container">
          <header className="header">
            <h1 className="title">Emotion AI</h1>
            <p className="subtitle">Real-time Facial Emotion Recognition</p>
          </header>

          <div className="card-wrapper">
            <div className="card-glow"></div>
            <div className="card">
              <div className="video-container">
                <Webcam
                  ref={webcamRef}
                  style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
                  videoConstraints={{ facingMode: "user" }}
                />
                <canvas ref={canvasRef} className="video-canvas" />
                <div className="status-bar">
                  <div className="status-indicator">
                    <span className="dot"></span>
                    <span className="status-text">{status}</span>
                  </div>
                  <span className="tech-info">468 Landmarks • MediaPipe</span>
                </div>
              </div>

              <div className="results">
                <div className="result-item emotion-section">
                  <p className="label">Detected Emotion</p>
                  <h2 className="emotion-text">{emotion}</h2>
                </div>

                <div className="result-item confidence-section">
                  <p className="label">Confidence Level</p>
                  <div className="confidence-container">
                    <div
                      className="confidence-bar"
                      style={{ width: `${confidence}%` }}
                    ></div>
                    <span className="confidence-value">
                      {confidence}<span className="percent">%</span>
                    </span>
                  </div>
                </div>
              </div>

              <footer className="footer">
                <div className="tech-stack">
                  <span>MediaPipe Face Mesh</span>
                  <span>TensorFlow.js</span>
                  <span>React 18</span>
                </div>
                <p className="author">
                  Built by <span className="author-name">Ali Haider</span>
                </p>
              </footer>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html,
        body {
          font-family: 'Inter', 'Segoe UI', sans-serif;
          background: #000;
          overflow-x: hidden;
        }

        .emotion-app {
          min-height: 100dvh;
          background: linear-gradient(135deg, #0f001a 0%, #1a0033 50%, #000 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 1.5rem 1rem;
          padding-bottom: env(safe-area-inset-bottom, 3rem);
          position: relative;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.35;
          pointer-events: none;
          animation: float 25s infinite ease-in-out;
          z-index: 1;
        }
        .orb-1 {
          width: 600px;
          height: 600px;
          background: #9333ea;
          top: -15%;
          left: -15%;
        }
        .orb-2 {
          width: 700px;
          height: 700px;
          background: #ec4899;
          bottom: -20%;
          right: -20%;
          animation-delay: 8s;
        }
        .orb-3 {
          width: 500px;
          height: 500px;
          background: #06b6d4;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 16s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(80px, -80px) rotate(5deg);
          }
        }

        .container {
          width: 100%;
          max-width: 1400px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
          width: 100%;
        }
        .title {
          font-size: clamp(2.8rem, 9vw, 6.5rem);
          font-weight: 900;
          background: linear-gradient(90deg, #a78bfa, #f472b6, #67e8f9);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: -2px;
          line-height: 1;
        }
        .subtitle {
          font-size: clamp(1rem, 3vw, 1.5rem);
          color: #c084fc;
          font-weight: 300;
          letter-spacing: 3px;
          margin-top: 0.5rem;
        }

        .card-wrapper {
          position: relative;
          width: 100%;
          max-width: 900px;
          border-radius: 2.5rem;
          overflow: hidden;
        }

        .card-glow {
          position: absolute;
          inset: -10px;
          background: linear-gradient(45deg, #9333ea, #ec4899, #06b6d4);
          border-radius: inherit;
          filter: blur(40px);
          opacity: 0.7;
          z-index: -1;
        }

        .card {
          background: rgba(15, 0, 26, 0.88);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.9);
        }

        .video-container {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #000;
        }

        .video-canvas {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .status-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: clamp(1rem, 3vw, 2rem);
          background: linear-gradient(to bottom, rgba(0,0,0,0.9), transparent);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          pointer-events: none;
          z-index: 10;
        }
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .dot {
          width: 14px;
          height: 14px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 30px #10b981;
          animation: pulse 2s infinite;
        }
        .status-text {
          color: white;
          font-weight: 600;
          font-size: clamp(0.9rem, 2.5vw, 1.2rem);
        }
        .tech-info {
          color: rgba(255,255,255,0.7);
          font-size: clamp(0.75rem, 2vw, 1rem);
          font-family: 'Courier New', monospace;
        }

        .results {
          padding: clamp(2.5rem, 6vw, 4rem) clamp(2rem, 5vw, 4rem);
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
        }
        @media (min-width: 768px) {
          .results {
            grid-template-columns: 1fr 1fr;
          }
        }

        .label {
          color: #c084fc;
          font-size: clamp(1rem, 3vw, 1.4rem);
          font-weight: 600;
          margin-bottom: 1rem;
          letter-spacing: 2px;
        }
        .emotion-text {
          font-size: clamp(3.2rem, 11vw, 7rem);
          font-weight: 900;
          color: white;
          text-shadow: 0 0 40px rgba(199, 146, 255, 0.6);
          line-height: 1;
        }

        .confidence-container {
          position: relative;
          height: clamp(110px, 32vw, 190px);
          background: rgba(255,255,255,0.06);
          border-radius: 2rem;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .confidence-bar {
          height: 100%;
          width: 0%;
          background: linear-gradient(to right, #9333ea, #ec4899, #06b6d4);
          transition: width 1.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .confidence-value {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(2.8rem, 9vw, 5.5rem);
          font-weight: 900;
          color: white;
          text-shadow: 0 0 50px rgba(0,0,0,0.8);
        }
        .percent {
          font-size: 50%;
          opacity: 0.8;
          margin-left: 4px;
        }

        .footer {
          padding: clamp(2rem, 5vw, 3.5rem) 2rem;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.12);
        }
        .tech-stack {
          display: flex;
          justify-content: center;
          gap: clamp(1.2rem, 4vw, 3rem);
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .tech-stack span {
          color: rgba(255,255,255,0.65);
          font-size: clamp(0.95rem, 2.5vw, 1.1rem);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tech-stack span::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
        }
        .author {
          font-size: clamp(1.2rem, 3.5vw, 1.8rem);
          color: white;
        }
        .author-name {
          background: linear-gradient(90deg, #a78bfa, #f472b6);
          -webkit-background-clip: text;
          color: transparent;
          font-weight: 700;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }

        /* Mobile Optimizations */
        @media (max-width: 640px) {
          .emotion-app {
            padding: 1rem 0.5rem;
          }
          .video-container {
            aspect-ratio: 1 / 1;
            border-radius: 2rem;
          }
          .card-wrapper {
            border-radius: 2rem;
          }
          .status-bar {
            flex-direction: column;
            text-align: center;
            padding: 1rem;
          }
          .results {
            gap: 2.5rem;
            padding: 2.5rem 1.5rem;
          }
        }

        /* Custom Scrollbar */
        .emotion-app::-webkit-scrollbar {
          width: 8px;
        }
        .emotion-app::-webkit-scrollbar-track {
          background: transparent;
        }
        .emotion-app::-webkit-scrollbar-thumb {
          background: rgba(167, 139, 250, 0.3);
          border-radius: 10px;
        }
        .emotion-app::-webkit-scrollbar-thumb:hover {
          background: rgba(167, 139, 250, 0.6);
        }
      `}</style>
    </>
  );
}