import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Import Framer Motion
import "./Landing.css"; 

const Landing = () => {
  const navigate = useNavigate();

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 } // Elements pop in one by one
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <motion.div 
      className="landing-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="overlay"></div>
      
      <motion.div className="hero-content">
        <motion.h1 className="main-title" variants={itemVariants}>
          Neuro<span>Scan</span> AI
        </motion.h1>
        
        <motion.p className="subtitle" variants={itemVariants}>
          Advanced Deep Learning Pipeline for Brain Tumor Detection, 
          Explainable AI (XAI), and Semantic Segmentation.
        </motion.p>

        <motion.div className="feature-grid" variants={itemVariants}>
          {[
            { icon: "� MRI", title: "MRI Classification", desc: "Identify Glioma, Meningioma, Pituitary tumors with high accuracy." },
            { icon: "📦", title: "Segmentation Masks", desc: "Visualize precise tumor boundaries overlaid on your scan." },
            { icon: "⚡", title: "Instant Results", desc: "Get classification scores and confidence levels in seconds." }
            
          ].map((feature, index) => (
            <motion.div 
              key={index} 
              className="feature-card"
              whileHover={{ scale: 1.05, borderColor: "#58a6ff" }} // Hover animation
              whileTap={{ scale: 0.95 }}
            >
              <div className="icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.button 
          className="start-btn" 
          onClick={() => navigate("/home")}
          variants={itemVariants}
          whileHover={{ boxShadow: "0px 0px 20px rgb(0, 224, 184)" }}
          whileTap={{ scale: 0.9 }}
        >
          Launch Workspace
        </motion.button>

        

        
      </motion.div>

      <motion.footer className="landing-footer" variants={itemVariants}>
        Computer Engineering Specialization Project © 2026
      </motion.footer>
    </motion.div>
  );
};

export default Landing;