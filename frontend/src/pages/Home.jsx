// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import "./Home.css";

// const Home = () => {
//   const navigate = useNavigate();
//   const [selectedFile, setSelectedFile]     = useState(null);
//   const [previewUrl, setPreviewUrl]         = useState(null);
//   const [isAnalyzing, setIsAnalyzing]       = useState(false);
//   const [result, setResult]                 = useState(null);
//   const [activeViewerTab, setActiveViewerTab] = useState("original");

//   const hasTumor = result?.detect_result?.prediction &&
//                    result.detect_result.prediction !== "no_tumor";

//   // ── Image selection ────────────────────────────────────────
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedFile(file);
//       setPreviewUrl(URL.createObjectURL(file));
//       setResult(null);
//       setActiveViewerTab("original");
//     }
//   };

//   // ── Detection ──────────────────────────────────────────────
//   const runAnalysis = async () => {
//     if (!selectedFile) return;
//     setIsAnalyzing(true);
//     // Keep old seg_result so it doesn't disappear
//     setResult(prev => ({ ...prev, detect_result: null }));

//     const formData = new FormData();
//     formData.append("file", selectedFile);

//     try {
//       const response = await fetch("http://localhost:8000/detect", {
//         method: "POST",
//         body: formData,
//       });
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.details || "Detection failed");
//       setResult(prev => ({ ...prev, detect_result: data }));
//       setActiveViewerTab("xai");
//     } catch (error) {
//       console.error("Detection error:", error);
//       alert("AI Detection failed. Check backend!");
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   // ── Segmentation ───────────────────────────────────────────
//   const runSegmentation = async () => {
//     if (!selectedFile || !hasTumor) return;
//     setIsAnalyzing(true);
//     // Keep detect_result so classification doesn't disappear
//     setResult(prev => ({ ...prev, seg_result: null }));

//     const formData = new FormData();
//     formData.append("file", selectedFile);

//     try {
//       const response = await fetch("http://localhost:8000/segment", {
//         method: "POST",
//         body: formData,
//       });
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || "Segmentation failed");
//       setResult(prev => ({ ...prev, seg_result: data }));
//       setActiveViewerTab("segmentation");
//     } catch (error) {
//       console.error("Segmentation error:", error);
//       alert("Segmentation failed. Check backend!");
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   // ── Viewer image source ────────────────────────────────────
//   const getViewerSrc = () => {
//     if (activeViewerTab === "original")     return previewUrl;
//     if (activeViewerTab === "segmentation") return result?.seg_result?.result_url || previewUrl;
//     if (activeViewerTab === "xai") return result?.detect_result?.result_url || previewUrl;
//     return previewUrl;
//   };

//   return (
//     <div className="home-page">
//       <div className="grid-overlay"></div>

//       <nav className="navbar">
//         <div className="nav-logo" onClick={() => navigate("/")}>
//           Neuro<span>Scan</span> AI
//         </div>
//         <button className="back-btn" onClick={() => navigate("/")}>Logout</button>
//       </nav>

//       <main className="workspace-container">

//         {/* ── LEFT: Upload ──────────────────────────────────── */}
//         <motion.div
//           className="upload-section"
//           initial={{ opacity: 0, x: -30 }}
//           animate={{ opacity: 1, x: 0 }}
//         >
//           <div className="section-header">
//             <h2>Patient MRI Upload</h2>
//             <p>Upload a high-resolution scan for AI-powered analysis.</p>
//           </div>

//           <div className={`drop-zone ${previewUrl ? "has-image" : ""}`}>
//             <input
//               type="file"
//               id="mri-upload"
//               accept="image/*"
//               onChange={handleImageChange}
//               hidden
//             />
//             <label htmlFor="mri-upload" className="drop-label">
//               {previewUrl ? (
//                 <img src={previewUrl} alt="MRI Preview" className="mri-preview" />
//               ) : (
//                 <div className="placeholder-content">
//                   <span className="upload-icon">📁</span>
//                   <p>Click to browse or drag & drop MRI</p>
//                 </div>
//               )}
//             </label>
//           </div>

//           {/* Step 1 — Always available */}
//           <button
//             className="analyze-btn"
//             disabled={!selectedFile || isAnalyzing}
//             onClick={runAnalysis}
//           >
//             {isAnalyzing && !result?.detect_result
//               ? "Running Detection..."
//               : "① Run AI Detection"}
//           </button>
// {/* Classification card */}
//           <div className="sidebar-card classification-card">
//             <h3>Classification Results</h3>

//             {result?.detect_result ? (
//               <>
//                 <div className="prediction-header">
//                   <span>Predicted:</span>
//                   <strong className={`pred-label ${result.detect_result.prediction}`}>
//                     {result.detect_result.prediction.replace("_", " ").toUpperCase()}
//                   </strong>
//                 </div>

                
//               </>
//             ) : (
//               <div className="status-indicator">
//                 <span className={`dot ${isAnalyzing ? "active" : ""}`}></span>
//                 {isAnalyzing ? "AI Engine Running..." : "Waiting for input..."}
//               </div>
//             )}
//           </div>
//           {/* Step 2 — Only enabled if tumor found */}
//           <button
//             className={`analyze-btn seg-btn ${!hasTumor ? "disabled-btn" : ""}`}
//             disabled={!hasTumor || isAnalyzing}
//             onClick={runSegmentation}
//             title={!hasTumor ? "Run Detection first. Segmentation only available if tumor is detected." : ""}

//           >

            
//             {isAnalyzing && result?.detect_result
//               ? "Running Segmentation..."
//               : "② Run Tumor Segmentation"}
//           </button>

          

//           {/* Info message when no tumor */}
//           {result?.detect_result && !hasTumor && (
//             <p style={{ color: "#22c55e", fontSize: "12px", marginTop: "8px", textAlign: "center" }}>
//               ✅ No tumor detected — segmentation not required.
//             </p>
//           )}

//           {/* Info message when tumor found but seg not run yet */}
//           {hasTumor && !result?.seg_result && (
//             <p style={{ color: "#facc15", fontSize: "12px", marginTop: "8px", textAlign: "center" }}>
//               ⚠️ Tumor detected — run segmentation to locate it.
//             </p>
//           )}

//         </motion.div>
        

//         {/* ── RIGHT: Results ────────────────────────────────── */}
//         <motion.div
//           className="results-sidebar"
//           initial={{ opacity: 0, x: 30 }}
//           animate={{ opacity: 1, x: 0 }}
//         >
//           {/* Metrics row */}
//           <div className="metrics-grid">
//             <div className="metric-card">
//               <p className="metric-title">Tumor Area</p>
//               <p className="metric-value">
//                 {result?.seg_result?.tumor_area_cm2
//                   ? `${result.seg_result.tumor_area_cm2} cm²`
//                   : "--"}
//               </p>
//               <span className="metric-sub">
//                 {result?.seg_result?.area_percent
//                   ? `${result.seg_result.area_percent}% of scan`
//                   : ""}
//               </span>
//             </div>
//             <div className="metric-card">
//               <p className="metric-title">Max Diameter</p>
//               <p className="metric-value">
//                 {result?.seg_result?.max_diameter_cm
//                   ? `${result.seg_result.max_diameter_cm} cm`
//                   : "--"}
//               </p>
//               <span className="metric-sub">Longest axis measurement</span>
//             </div>
//           </div>

          


          
//           {/* MRI Viewer card */}
//           <div className="sidebar-card mri-viewer-card">
//             <h3>MRI Viewer</h3>
//             <div className="viewer-tabs">
//               {["original", "xai","segmentation"].map(tab => (
//                 <button
//                   key={tab}
//                   className={`viewer-tab ${activeViewerTab === tab ? "active" : ""}`}
//                   onClick={() => setActiveViewerTab(tab)}
//                   type="button"
//                 >
//                   {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                 </button>
//               ))}
//             </div>
//             <div className="viewer-content">
//               {getViewerSrc() ? (
//                 <img
//                   src={getViewerSrc()}
//                   alt="MRI Viewer"
//                   className="viewer-image"
//                   onError={(e) => { e.target.src = previewUrl; }}
//                 />
//               ) : (
//                 <div className="viewer-placeholder">No image available yet</div>
//               )}
//             </div>
//           </div>

          
//         </motion.div>
//       </main>
//     </div>
//   );
// };

// export default Home;





import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile]     = useState(null);
  const [previewUrl, setPreviewUrl]         = useState(null);
  const [isAnalyzing, setIsAnalyzing]       = useState(false);
  const [result, setResult]                 = useState(null);
  const [activeViewerTab, setActiveViewerTab] = useState("original");

  const hasTumor = result?.detect_result?.prediction &&
                   result.detect_result.prediction !== "no_tumor";

  // ── Image selection ────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setActiveViewerTab("original");
    }
  };

  // ── Detection ──────────────────────────────────────────────
  const runAnalysis = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    // Keep old seg_result so it doesn't disappear
    setResult(prev => ({ ...prev, detect_result: null }));

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/detect", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.details || "Detection failed");
      setResult(prev => ({ ...prev, detect_result: data }));
      setActiveViewerTab("xai");
    } catch (error) {
      console.error("Detection error:", error);
      alert("AI Detection failed. Check backend!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Segmentation ───────────────────────────────────────────
  const runSegmentation = async () => {
    if (!selectedFile || !hasTumor) return;
    setIsAnalyzing(true);
    // Keep detect_result so classification doesn't disappear
    setResult(prev => ({ ...prev, seg_result: null }));

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/segment", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Segmentation failed");
      setResult(prev => ({ ...prev, seg_result: data }));
      setActiveViewerTab("segmentation");
    } catch (error) {
      console.error("Segmentation error:", error);
      alert("Segmentation failed. Check backend!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Viewer image source ────────────────────────────────────
  const getViewerSrc = () => {
    if (activeViewerTab === "original")     return previewUrl;
    if (activeViewerTab === "segmentation") return result?.seg_result?.result_url || previewUrl;
    if (activeViewerTab === "xai") return result?.detect_result?.result_url || previewUrl;
    return previewUrl;
  };

  return (
    <div className="home-page">
      <div className="grid-overlay"></div>

      <nav className="navbar">
        <div className="nav-logo" onClick={() => navigate("/")}>
          Neuro<span>Scan</span> AI
        </div>
        <button className="back-btn" onClick={() => navigate("/")}>Logout</button>
      </nav>

      <main className="workspace-container">

        {/* ── LEFT: Upload ──────────────────────────────────── */}
        <motion.div
          className="upload-section"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="section-header">
            <h2>Patient MRI Upload</h2>
            <p>Upload a high-resolution scan for AI-powered analysis.</p>
          </div>

          <div className={`drop-zone ${previewUrl ? "has-image" : ""}`}>
            <input
              type="file"
              id="mri-upload"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
            <label htmlFor="mri-upload" className="drop-label">
              {previewUrl ? (
                <img src={previewUrl} alt="MRI Preview" className="mri-preview" />
              ) : (
                <div className="placeholder-content">
                  <span className="upload-icon">📁</span>
                  <p>Click to browse or drag & drop MRI</p>
                </div>
              )}
            </label>
          </div>

          {/* Step 1 — Always available */}
          <button
            className="analyze-btn"
            disabled={!selectedFile || isAnalyzing}
            onClick={runAnalysis}
          >
            {isAnalyzing && !result?.detect_result
              ? "Running Detection..."
              : "① Run AI Detection"}
          </button>
{/* Classification card */}
          <div className="sidebar-card classification-card">
            <h3>Classification Results</h3>

            {result?.detect_result ? (
              <>
                <div className="prediction-header">
                  <span>Predicted:</span>
                  <strong className={`pred-label ${result.detect_result.prediction}`}>
                    {result.detect_result.prediction.replace("_", " ").toUpperCase()}
                  </strong>
                </div>

                
              </>
            ) : (
              <div className="status-indicator">
                <span className={`dot ${isAnalyzing ? "active" : ""}`}></span>
                {isAnalyzing ? "AI Engine Running..." : "Waiting for input..."}
              </div>
            )}
          </div>
          {/* Step 2 — Only enabled if tumor found */}
          {/* 
          <button
            className={`analyze-btn seg-btn ${!hasTumor ? "disabled-btn" : ""}`}
            disabled={!hasTumor || isAnalyzing}
            onClick={runSegmentation}
            title={!hasTumor ? "Run Detection first. Segmentation only available if tumor is detected." : ""}

          >

            
            {isAnalyzing && result?.detect_result
              ? "Running Segmentation..."
              : "② Run Tumor Segmentation"}
          </button>
             */}
          
  
          {/* Info message when no tumor */}
        
          {/*
{result?.detect_result && !hasTumor && (
  <p style={{ color: "#22c55e", fontSize: "12px", marginTop: "8px", textAlign: "center" }}>
    ✅ No tumor detected — segmentation not required.
  </p>
)}

{hasTumor && !result?.seg_result && (
  <p style={{ color: "#facc15", fontSize: "12px", marginTop: "8px", textAlign: "center" }}>
    ⚠️ Tumor detected — run segmentation to locate it.
  </p>
)}
*/}
          

        </motion.div>
        

        {/* ── RIGHT: Results ────────────────────────────────── */}
        {/*
        <motion.div
          className="results-sidebar"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Metrics row *
          <div className="metrics-grid">
            <div className="metric-card">
              <p className="metric-title">Tumor Area</p>
              <p className="metric-value">
                {result?.seg_result?.tumor_area_cm2
                  ? `${result.seg_result.tumor_area_cm2} cm²`
                  : "--"}
              </p>
              <span className="metric-sub">
                {result?.seg_result?.area_percent
                  ? `${result.seg_result.area_percent}% of scan`
                  : ""}
              </span>
            </div>
            <div className="metric-card">
              <p className="metric-title">Max Diameter</p>
              <p className="metric-value">
                {result?.seg_result?.max_diameter_cm
                  ? `${result.seg_result.max_diameter_cm} cm`
                  : "--"}
              </p>
              <span className="metric-sub">Longest axis measurement</span>
            </div>
          </div>

          {/* MRI Viewer card *
          <div className="sidebar-card mri-viewer-card">
            <h3>MRI Viewer</h3>
            <div className="viewer-tabs">
              {["original", "xai","segmentation"].map(tab => (
                <button
                  key={tab}
                  className={`viewer-tab ${activeViewerTab === tab ? "active" : ""}`}
                  onClick={() => setActiveViewerTab(tab)}
                  type="button"
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="viewer-content">
              {getViewerSrc() ? (
                <img
                  src={getViewerSrc()}
                  alt="MRI Viewer"
                  className="viewer-image"
                  onError={(e) => { e.target.src = previewUrl; }}
                />
              ) : (
                <div className="viewer-placeholder">No image available yet</div>
              )}
            </div>
          </div>
        </motion.div>
        */}

      </main>
    </div>
  );
};

export default Home;