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


// import { FaceMesh } from "@mediapipe/face_mesh";
// import React, { useRef, useEffect, useState, useCallback } from "react";
// import * as Facemesh from "@mediapipe/face_mesh";
// import * as cam from "@mediapipe/camera_utils";
// import Webcam from "react-webcam";
// import Chart from "react-apexcharts";

// export default function EmotionAnalyticsDashboard() {
//   const webcamRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [emotion, setEmotion] = useState("Neutral");
//   const [confidence, setConfidence] = useState(0);
//   const [status, setStatus] = useState("Initializing...");

//   const [stats, setStats] = useState({
//     total: 0,
//     avgConfidence: 0,
//     emotions: { Happy: 0, Surprised: 0, Serious: 0, Neutral: 0 }
//   });

//   const [history, setHistory] = useState([]);

//   const detectEmotion = useCallback((landmarks) => {
//     const left = landmarks[61];
//     const right = landmarks[291];
//     const top = landmarks[13];
//     const bottom = landmarks[14];

//     const mouthWidth = Math.hypot(right.x - left.x, right.y - left.y);
//     const mouthHeight = Math.abs(bottom.y - top.y);
//     const ratio = mouthHeight / mouthWidth || 0.2;

//     let detected = "Neutral";
//     let score = 88;

//     if (ratio > 0.55) { detected = "Surprised"; score = Math.min(99, 75 + (ratio - 0.55) * 600); }
//     else if (ratio > 0.30) { detected = "Happy"; score = Math.min(99, 80 + (ratio - 0.30) * 500); }
//     else if (ratio < 0.12) { detected = "Serious"; score = Math.min(99, 85 + (0.12 - ratio) * 900); }

//     setEmotion(detected);
//     setConfidence(Math.round(score));

//     setStats(prev => {
//       const total = prev.total + 1;
//       const avg = Math.round(((prev.avgConfidence * prev.total) + score) / total);
//       return {
//         total,
//         avgConfidence: avg,
//         emotions: { ...prev.emotions, [detected]: prev.emotions[detected] + 1 }
//       };
//     });

//     setHistory(prev => [...prev.slice(-40), { emotion: detected, confidence: score }]);
//   }, []);

//   const onResults = useCallback((results) => {
//     if (!canvasRef.current || !webcamRef.current?.video) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     const width = canvas.width;
//     const height = canvas.height;

//     // Clear & background
//     ctx.clearRect(0, 0, width, height);
//     ctx.fillStyle = "#f8fafc";
//     ctx.fillRect(0, 0, width, height);

//     if (results.multiFaceLandmarks?.[0]) {
//       const landmarks = results.multiFaceLandmarks[0];
//       detectEmotion(landmarks);

//       const connect = window.drawConnectors;
//       const drawPoint = (x, y, color = "#6366f1") => {
//         ctx.beginPath();
//         ctx.arc(x, y, 3, 0, Math.PI * 2);
//         ctx.fillStyle = color;
//         ctx.fill();
//       };

//       // Draw face oval
//       connect(ctx, landmarks, Facemesh.FACEMESH_FACE_OVAL, { color: "#6366f1", lineWidth: 2.5 });

//       // Eyes + eyebrows
//       connect(ctx, landmarks, Facemesh.FACEMESH_LEFT_EYE, { color: "#8b5cf6", lineWidth: 2 });
//       connect(ctx, landmarks, Facemesh.FACEMESH_RIGHT_EYE, { color: "#8b5cf6", lineWidth: 2 });
//       connect(ctx, landmarks, Facemesh.FACEMESH_LEFT_EYEBROW, { color: "#a78bfa", lineWidth: 1.8 });
//       connect(ctx, landmarks, Facemesh.FACEMESH_RIGHT_EYEBROW, { color: "#a78bfa", lineWidth: 1.8 });

//       // Lips
//       connect(ctx, landmarks, Facemesh.FACEMESH_LIPS, { color: "#ec4899", lineWidth: 3 });

//       // Key points highlight
//       [0, 10, 152, 234, 454].forEach(i => {
//         const p = landmarks[i];
//         drawPoint(p.x * width, p.y * height, "#6366f1");
//       });
//     }

//     // Draw webcam feed behind landmarks with low opacity
//     ctx.globalAlpha = 0.35;
//     ctx.drawImage(webcamRef.current.video, 0, 0, width, height);
//     ctx.globalAlpha = 1;
//   }, [detectEmotion]);

//   useEffect(() => {
//     setStatus("Loading AI Model...");
//     const faceMesh = new FaceMesh({
//       locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
//     });

//     faceMesh.setOptions({
//       maxNumFaces: 1,
//       refineLandmarks: true,
//       minDetectionConfidence: 0.8,
//       minTrackingConfidence: 0.8,
//     });

//     faceMesh.onResults(onResults);

//     const camera = new cam.Camera(webcamRef.current.video, {
//       onFrame: async () => {
//         await faceMesh.send({ image: webcamRef.current.video });
//       },
//       width: 1280,
//       height: 720,
//     });

//     camera.start().then(() => setStatus("Live • Face Detected"));
//   }, [onResults]);

//   // Charts remain same
//   const pieSeries = Object.values(stats.emotions);
//   const pieOptions = { chart: { type: 'donut' }, labels: ['Happy', 'Surprised', 'Serious', 'Neutral'], colors: ['#10b981', '#f59e0b', '#ef4444', '#94a3b8'], legend: { position: 'bottom' }, plotOptions: { pie: { donut: { size: '70%' } } } };

//   const lineSeries = [{ name: 'Confidence', data: history.map(h => h.confidence) }];
//   const lineOptions = { chart: { toolbar: { show: false }, sparkline: { enabled: true } }, stroke: { curve: 'smooth', width: 3 }, colors: ['#6366f1'], fill: { opacity: 0.5 } };

//   const radialOptions = {
//     chart: { type: 'radialBar' },
//     plotOptions: { radialBar: { hollow: { size: '68%' }, track: { background: '#e2e8f0' }, dataLabels: { value: { fontSize: '2.5rem', fontWeight: 800, color: '#1e293b' } } } },
//     colors: ['#6366f1'],
//   };

//   return (
//     <>
//       <div className="dashboard">
//         <header className="header">
//           <div>
//             <h1>Emotion Analytics Dashboard</h1>
//             <p>Real-time Facial Recognition with Clear Landmarks</p>
//           </div>
//           <div className="status"><span className="dot"></span> {status}</div>
//         </header>

//         <div className="grid">
//           {/* FACE + LANDMARKS CARD (Perfect Fit) */}
//           <div className="card face-card">
//             <h3>Live Face Detection</h3>
//             <div className="face-container">
//               <Webcam ref={webcamRef} style={{ display: "none" }} videoConstraints={{ facingMode: "user" }} />
//               <canvas ref={canvasRef} className="face-canvas" />
//               <div className="face-overlay">
//                 <div className="current-emotion">{emotion}</div>
//                 <div className="current-conf">{confidence}%</div>
//               </div>
//             </div>
//           </div>

//           <div className="card emotion-card">
//             <h3>Current Emotion</h3>
//             <Chart options={radialOptions} series={[confidence]} type="radialBar" height={280} />
//             <div className="emotion-big">{emotion}</div>
//           </div>

//           <div className="card stats-card">
//             <h3>Session Stats</h3>
//             <div className="stat">Detections <strong>{stats.total}</strong></div>
//             <div className="stat">Avg Confidence <strong>{stats.avgConfidence}%</strong></div>
//             <div className="stat">Dominant <strong>{Object.keys(stats.emotions).reduce((a,b) => stats.emotions[a] > stats.emotions[b] ? a : b, "Neutral")}</strong></div>
//           </div>

//           <div className="card pie-card">
//             <h3>Emotion Distribution</h3>
//             <Chart options={pieOptions} series={pieSeries} type="donut" height={260} />
//           </div>

//           <div className="card trend-card">
//             <h3>Confidence Trend</h3>
//             <Chart options={lineOptions} series={lineSeries} type="area" height={180} />
//           </div>
//         </div>

//         <footer>Built by <strong>Ali Haider</strong></footer>
//       </div>

//       <style jsx>{`
//         :global(body){margin:0;background:#f1f5f9;font-family:'Inter',sans-serif;color:#1e293b;}
//         .dashboard{padding:1.5rem;max-width:1600px;margin:0 auto;}
//         .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;flex-wrap:wrap;gap:1rem;}
//         .header h1{font-size:2.3rem;font-weight:900;margin:0;color:#1e293b;}
//         .status{background:#ecfdf5;color:#065f46;padding:0.6rem 1.4rem;border-radius:2rem;font-weight:600;display:flex;align-items:center;gap:10px;}
//         .dot{width:10px;height:10px;background:#10b981;border-radius:50%;animation:pulse 2s infinite;}

//         .grid{display:grid;gap:1.5rem;grid-template-columns:1fr;}
//         @media(min-width:640px){.grid{grid-template-columns:repeat(2,1fr);}}
//         @media(min-width:1024px){.grid{grid-template-columns:repeat(12,1fr);gap:2rem;}}
//         @media(min-width:1024px){
//           .face-card{grid-column:span 8;grid-row:span 2;}
//           .emotion-card{grid-column:span 4;grid-row:span 2;}
//           .stats-card,.pie-card,.trend-card{grid-column:span 4;}
//         }

//         .card{background:white;border-radius:1.5rem;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);transition:0.3s;}
//         .card:hover{transform:translateY(-8px);box-shadow:0 20px 40px rgba(0,0,0,0.14);}
//         .card h3{margin:0;padding:1.5rem 1.5rem 0;font-size:1.35rem;font-weight:700;color:#1e293b;}

//         /* FACE CARD - Perfect Face + Landmarks */
//         .face-container{
//           position:relative;
//           width:100%;
//           height:420px;
//           background:#f8fafc;
//           border-radius:0 0 1.5rem 1.5rem;
//           overflow:hidden;
//           display:flex;
//           justify-content:center;
//           align-items:center;
//         }
//         .face-canvas{
//           max-width:100%;
//           max-height:100%;
//           width:auto !important;
//           height:auto !important;
//           object-fit:contain;
//         }
//         .face-overlay{
//           position:absolute;bottom:1.5rem;left:1.5rem;
//           background:rgba(255,255,255,0.96);padding:1.2rem 1.8rem;
//           border-radius:1.5rem;box-shadow:0 10px 30px rgba(0,0,0,0.15);
//         }
//         .current-emotion{font-size:2.2rem;font-weight:900;color:#6366f1;margin-bottom:4px;}
//         .current-conf{font-size:1.6rem;font-weight:700;color:#10b981;}

//         .emotion-big{font-size:2.8rem;font-weight:900;text-align:center;margin-top:1rem;color:#1e293b;}

//         .stat{display:flex;justify-content:space-between;padding:1rem 1.5rem;border-bottom:1px solid #e2e8f0;font-size:1.1rem;}
//         .stat:last-child{border:none;}
//         .stat strong{color:#6366f1;font-weight:800;}

//         footer{text-align:center;margin-top:4rem;padding:2rem;color:#64748b;font-size:1rem;}

//         @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
//         @media(max-width:640px){
//           .face-container{height:340px;}
//           .face-card,.emotion-card{grid-column:span 1 !important;}
//         }
//       `}</style>
//     </>
//   );
// }


import { FaceMesh } from "@mediapipe/face_mesh";
import React, { useRef, useEffect, useState, useCallback } from "react";
import * as Facemesh from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import Chart from "react-apexcharts";
import html2canvas from "html2canvas";

export default function EmotionAIDashboard() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const dashboardRef = useRef(null);

  const [emotion, setEmotion] = useState("Neutral");
  const [confidence, setConfidence] = useState(0);
  const [status, setStatus] = useState("Initializing AI Engine...");

  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    happy: 0,
    surprised: 0,
    serious: 0,
    neutral: 0,
    avgConfidence: 0,
  });

  const detectEmotion = useCallback((landmarks) => {
    const ratio =
      Math.abs(landmarks[14].y - landmarks[13].y) /
      Math.hypot(
        landmarks[291].x - landmarks[61].x,
        landmarks[291].y - landmarks[61].y
      );

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
    setStatus("Live • Face Detected");

    const newEntry = { emotion: detected, confidence: Math.round(score), time: Date.now() };
    setHistory((prev) => [...prev.slice(-100), newEntry]);

    setStats((prev) => {
      const total = prev.total + 1;
      const newAvg = Math.round((prev.avgConfidence * prev.total + score) / total);
      return {
        total,
        happy: detected === "Happy" ? prev.happy + 1 : prev.happy,
        surprised: detected === "Surprised" ? prev.surprised + 1 : prev.surprised,
        serious: detected === "Serious" ? prev.serious + 1 : prev.serious,
        neutral: detected === "Neutral" ? prev.neutral + 1 : prev.neutral,
        avgConfidence: newAvg,
      };
    });
  }, []);

  const onResults = useCallback(
    (results) => {
      if (!canvasRef.current || !webcamRef.current?.video) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (results.multiFaceLandmarks?.[0]) {
        const landmarks = results.multiFaceLandmarks[0];
        detectEmotion(landmarks);

        const connect = window.drawConnectors;
        ctx.lineWidth = 2.5;

        connect(ctx, landmarks, Facemesh.FACEMESH_FACE_OVAL, { color: "#6366f1" });
        connect(ctx, landmarks, Facemesh.FACEMESH_LIPS, { color: "#ec4899" });
        connect(ctx, landmarks, Facemesh.FACEMESH_LEFT_EYE, { color: "#8b5cf6" });
        connect(ctx, landmarks, Facemesh.FACEMESH_RIGHT_EYE, { color: "#8b5cf6" });
      }

      ctx.globalAlpha = 0.35;
      ctx.drawImage(webcamRef.current.video, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    },
    [detectEmotion]
  );

  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.8,
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
      setStatus("AI Engine Active • Ready");
    });
  }, [onResults]);

  // Export Function Fixed
  const exportDashboard = async () => {
    if (!dashboardRef.current) return;
    try {
      const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
      const link = document.createElement("a");
      link.download = `EmotionAI_Report_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      alert("Export failed. Try again!");
    }
  };

  // Charts Data
  const pieSeries = [stats.happy, stats.surprised, stats.serious, stats.neutral];
  const lineSeries = [{ name: "Confidence", data: history.map((h) => h.confidence) }];
  const barSeries = [{ name: "Count", data: [stats.happy, stats.surprised, stats.serious, stats.neutral] }];

  return (
    <div className="dashboard" ref={dashboardRef}>
      {/* Header */}
      <div className="header">
        <div className="title">
          <h1>Emotion AI Dashboard</h1>
          <p>Real-time Facial Emotion Recognition • MediaPipe + React</p>
        </div>
        <button onClick={exportDashboard} className="export-btn">
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="value">{stats.total}</div>
          <div className="label">Total Detections</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.avgConfidence}%</div>
          <div className="label">Avg Confidence</div>
        </div>
        <div className="stat-card">
          <div className="value">{emotion}</div>
          <div className="label">Current Emotion</div>
        </div>
        <div className="stat-card">
          <div className="value">{confidence}%</div>
          <div className="label">Live Confidence</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="main-grid">
        {/* Live Face */}
        <div className="card face-card">
          <h3>Live Face Detection</h3>
          <div className="face-container">
            <Webcam ref={webcamRef} style={{ display: "none" }} videoConstraints={{ facingMode: "user" }} />
            <canvas ref={canvasRef} className="face-canvas" />
            <div className="live-indicator">LIVE</div>
          </div>
          <div className="status-text">{status}</div>
        </div>

        {/* Radial Confidence */}
        <div className="card">
          <h3>Confidence Meter</h3>
          <Chart
            options={{
              plotOptions: { radialBar: { hollow: { size: "70%" }, track: { background: "#e5e7eb" } } },
              colors: ["#6366f1"],
              labels: ["Confidence"]
            }}
            series={[confidence]}
            type="radialBar"
            height={300}
          />
        </div>

        {/* Emotion Distribution */}
        <div className="card">
          <h3>Emotion Distribution</h3>
          <Chart
            options={{
              labels: ["Happy", "Surprised", "Serious", "Neutral"],
              colors: ["#10b981", "#f59e0b", "#ef4444", "#94a3b8"],
              legend: { position: "bottom" }
            }}
            series={pieSeries}
            type="donut"
            height={300}
          />
        </div>

        {/* Confidence Trend */}
        <div className="card">
          <h3>Confidence Trend</h3>
          <Chart
            options={{
              chart: { sparkline: { enabled: true } },
              stroke: { width: 4 },
              colors: ["#6366f1"]
            }}
            series={lineSeries}
            type="area"
            height={220}
          />
        </div>

        {/* Emotion Frequency Bar */}
        <div className="card">
          <h3>Emotion Frequency</h3>
          <Chart
            options={{
              xaxis: { categories: ["Happy", "Surprised", "Serious", "Neutral"] },
              colors: ["#6366f1"]
            }}
            series={barSeries}
            type="bar"
            height={280}
          />
        </div>

        {/* Recent Activity Log */}
        <div className="card log-card">
          <h3>Recent Activity</h3>
          <div className="log">
            {history.slice(-10).reverse().map((h, i) => (
              <div key={i} className="log-item">
                <span className="emo">{h.emotion}</span>
                <span className="conf">{h.confidence}%</span>
                <span className="time">{new Date(h.time).toLocaleTimeString()}</span>
              </div>
            ))}
            {history.length === 0 && <div className="empty">No data yet...</div>}
          </div>
        </div>
      </div>

      <footer>© 2025 Emotion AI • Built by Ali Haider</footer>

      <style jsx>{`
        :global(body) { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; color: #1e293b; }
        .dashboard { padding: 2rem; min-height: 100vh; background: #f8fafc; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .title h1 { font-size: 2.8rem; font-weight: 900; margin: 0; background: linear-gradient(90deg, #6366f1, #8b5cf6); -webkit-background-clip: text; color: transparent; }
        .title p { margin: 0.5rem 0 0; color: #64748b; }
        .export-btn { background: #6366f1; color: white; padding: 1rem 2rem; border: none; border-radius: 1.5rem; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .export-btn:hover { background: #4f46e5; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .stat-card { background: white; padding: 1.8rem; border-radius: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.08); text-align: center; }
        .value { font-size: 3.2rem; font-weight: 900; color: #6366f1; margin: 0; }
        .label { font-size: 1rem; color: #64748b; margin-top: 0.5rem; }

        .main-grid { display: grid; gap: 2rem; grid-template-columns: 1fr; }
        @media (min-width: 768px) { .main-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1200px) { .main-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1600px) { .main-grid { grid-template-columns: repeat(4, 1fr); } }

        .card { background: white; border-radius: 1.8rem; box-shadow: 0 15px 35px rgba(0,0,0,0.1); padding: 1.8rem; overflow: hidden; }
        .card h3 { margin: 0 0 1.5rem; font-size: 1.4rem; font-weight: 700; color: #1e293b; }

        .face-container { position: relative; height: 420px; background: #f1f5f9; border-radius: 1.5rem; overflow: hidden; display: flex; justify-content: center; align-items: center; }
        .face-canvas { max-width: 100%; max-height: 100%; object-fit: contain; }
        .live-indicator { position: absolute; top: 16px; right: 16px; background: #ef4444; color: white; padding: 0.5rem 1rem; border-radius: 2rem; font-weight: 700; font-size: 0.9rem; }
        .status-text { text-align: center; margin-top: 1rem; font-weight: 600; color: #10b981; }

        .log { max-height: 300px; overflow-y: auto; }
        .log-item { display: flex; justify-content: space-between; padding: 0.8rem 0; border-bottom: 1px solid #e2e8f0; font-size: 0.95rem; }
        .emo { font-weight: 700; color: #6366f1; }
        .conf { color: #10b981; font-weight: 600; }
        .empty { color: #94a3b8; text-align: center; padding: 2rem; }

        footer { text-align: center; margin-top: 4rem; padding: 2rem; color: #94a3b8; font-size: 0.95rem; }
      `}</style>
    </div>
  );
}