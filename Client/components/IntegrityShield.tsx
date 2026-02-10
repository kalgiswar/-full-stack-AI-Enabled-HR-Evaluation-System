"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Monitor, ShieldCheck, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

export const IntegrityShield = ({ onViolation, isActive = true }: { onViolation: (type: string) => void; isActive?: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenRef = useRef<MediaStream | null>(null);
  
  const [isProctoring, setIsProctoring] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);

  // Load COCO-SSD Model on Mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        setIsModelLoading(false);
        console.log("AI Proctor Model Loaded");
      } catch (err) {
        console.error("Failed to load AI model:", err);
        toast.error("AI Model failed to load. Please refresh.");
        setIsModelLoading(false);
      }
    };
    loadModel();
  }, []);

  // Force stop if isActive becomes false
  useEffect(() => {
    if (!isActive) {
      setIsProctoring(false);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (screenRef.current) screenRef.current.getTracks().forEach(t => t.stop());
    }
  }, [isActive]);

  // Object Detection Loop
  useEffect(() => {
    let animationFrameId: number;

    const detectFrame = async () => {
      if (!isProctoring || !model || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (video.readyState === 4) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Detect Objects
        const predictions = await model.detect(video);
        
        // Clear previous drawings
        ctx?.clearRect(0, 0, canvas.width, canvas.height);

        // Analyze Predictions
        let personCount = 0;
        let phoneDetected = false;

        predictions.forEach((prediction) => {
          if (!ctx) return;

          // Draw Bounding Box
          const [x, y, width, height] = prediction.bbox;
          
          ctx.strokeStyle = "#00FFFF";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);

          // Draw Label background
          ctx.fillStyle = "#00FFFF";
          ctx.fillRect(x, y, width, 20); // Top bar for label

          // Draw Text
          ctx.fillStyle = "#000000";
          ctx.font = "12px Arial";
          ctx.fillText(
            `${prediction.class} (${Math.round(prediction.score * 100)}%)`, 
            x + 5, 
            y + 14
          );

          // Proctoring Logic
          if (prediction.class === "person") {
            personCount++;
          }
          if (prediction.class === "cell phone") {
            phoneDetected = true;
          }
        });

        // Trigger Violations (Debounced slightly ideally, but direct for now)
        if (personCount > 1) {
             // Only toast occasionally to avoid spam, or handle in parent
             // For now, we rely on visual feedback and occasional toast
             if (Math.random() < 0.05) { // 5% chance per frame to toast (approx once per sec)
                toast.warning("Multiple people detected!");
                onViolation("multiple-people");
                setWarnings(prev => prev + 1);
             }
        } else if (personCount === 0) {
             if (Math.random() < 0.02) {
                toast.warning("No person detected!");
                onViolation("no-person");
             }
        }

        if (phoneDetected) {
            if (Math.random() < 0.05) {
                toast.error("Cell phone detected!");
                onViolation("phone-detected");
                setWarnings(prev => prev + 1);
            }
        }
      }

      animationFrameId = requestAnimationFrame(detectFrame);
    };

    if (isProctoring && model) {
        detectFrame();
    }

    return () => {
        cancelAnimationFrame(animationFrameId);
    };
  }, [isProctoring, model, onViolation]);


  const startProctoring = async () => {
    try {
      // 1. Request Webcam
      const userStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
            width: { ideal: 640 }, // Lower res for faster AI inference
            height: { ideal: 480 },
            facingMode: "user"
        }, 
        audio: false 
      });

      streamRef.current = userStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
        videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error("Video play failed:", e));
        };
      }

      // 2. Request Screen Share 
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { displaySurface: "monitor" } 
      });
      screenRef.current = displayStream;

      displayStream.getVideoTracks()[0].onended = () => {
         toast.error("Screen sharing stopped! This is a violation.");
         onViolation("screen-share-stopped");
         setWarnings(prev => prev + 1);
      };

      setIsProctoring(true);
      toast.success("AI Proctoring Active: Monitoring for multiple people & devices.");

    } catch (err: any) {
      console.error("Proctoring Error:", err);
      toast.error("Proctoring failed to start. Ensure camera permissions are allowed.");
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isProctoring) {
        setWarnings(prev => prev + 1);
        onViolation("tab-switch");
        toast.warning("Warning: Tab switching detected!");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (screenRef.current) screenRef.current.getTracks().forEach(track => track.stop());
    };
  }, [isProctoring, onViolation]);

  if (!isProctoring) {
    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="bg-dark-200 border border-white/10 p-8 rounded-2xl max-w-md text-center space-y-6">
                <ShieldCheck className="w-16 h-16 text-primary-200 mx-auto" />
                <div>
                   <h2 className="text-2xl font-bold text-white">Using AI Proctoring (YOLO/COCO-SSD)</h2>
                   <p className="text-light-100 mt-2">
                     Integrity Shield is active. We monitor for:
                   </p>
                </div>
                
                <div className="flex gap-4 justify-center text-sm text-light-100">
                    <ul className="text-left list-disc pl-4 space-y-1">
                        <li>Multiple People Detected</li>
                        <li>Cell Phone Usage</li>
                        <li>Leaving the Frame</li>
                        <li>Tab Switching</li>
                    </ul>
                </div>

                {isModelLoading ? (
                    <Button disabled className="btn-secondary w-full flex items-center gap-2">
                        <Loader2 className="animate-spin" /> Loading AI Model...
                    </Button>
                ) : (
                    <Button onClick={startProctoring} className="btn-primary w-full">
                        Enable Proctoring & Start
                    </Button>
                )}
                <p className="text-xs text-gray-500">Processing happens locally on your device.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none">
      {warnings > 0 && (
         <div className="bg-destructive-100 text-white px-4 py-2 rounded-lg flex items-center gap-2 animate-bounce shadow-lg pointer-events-auto">
            <AlertTriangle size={20} />
            <span>Violations: {warnings}</span>
         </div>
      )}
      <div className="w-64 h-48 bg-black rounded-xl overflow-hidden border-2 border-primary-200 shadow-[0_0_20px_rgba(130,103,248,0.4)] relative group pointer-events-auto">
        {/* Video Element */}
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" 
        />
        
        {/* AI Canvas Overlay */}
        <canvas 
            ref={canvasRef}
            className="absolute inset-0 w-full h-full transform scale-x-[-1]" 
        />
        
        {/* Status Indicators */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">AI Scanning</span>
        </div>

        <div className="absolute inset-0 border-2 border-primary-200/20 pointer-events-none z-20"></div>
      </div>
    </div>
  );
};
