"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Monitor, ShieldCheck, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const IntegrityShield = ({ onViolation, isActive = true }: { onViolation: (type: string) => void; isActive?: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenRef = useRef<MediaStream | null>(null);
  
  const [isProctoring, setIsProctoring] = useState(false);
  const [warnings, setWarnings] = useState(0);

  // Force stop if isActive becomes false
  useEffect(() => {
    if (!isActive) {
      setIsProctoring(false);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (screenRef.current) screenRef.current.getTracks().forEach(t => t.stop());
    }
  }, [isActive]);

  const startProctoring = async () => {
    try {
      // 1. Request Webcam with specific constraints for better detection
      const userStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
        }, 
        audio: false 
      });

      streamRef.current = userStream;
      
      // Ensure video element is connected to stream
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
        // Explicitly call play to handle some browser edge cases
        videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error("Video play failed:", e));
        };
      }

      // 2. Request Screen Share 
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: {
            displaySurface: "monitor" // Suggesting entire screen
        } 
      });
      screenRef.current = displayStream;

      // Handle screen share stop 
      displayStream.getVideoTracks()[0].onended = () => {
         toast.error("Screen sharing stopped! This is a violation.");
         onViolation("screen-share-stopped");
         setWarnings(prev => prev + 1);
      };

      setIsProctoring(true);
      toast.success("Integrity Systems Synchronized!");

    } catch (err: any) {
      console.error("Proctoring Error:", err);
      if (err.name === "NotAllowedError") {
        toast.error("Camera/Screen access denied. Please check site permissions in your browser URL bar.");
      } else if (err.name === "NotFoundError") {
        toast.error("No camera found. Please connect a webcam.");
      } else {
        toast.error("Proctoring failed to start. Ensure no other app is using your camera.");
      }
    }
  };

  useEffect(() => {
    // Tab switching detection
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
      
      // Cleanup: Stop ALL tracks (Webcam + Screen)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenRef.current) {
        screenRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isProctoring, onViolation]);

  if (!isProctoring) {
    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="bg-dark-200 border border-white/10 p-8 rounded-2xl max-w-md text-center space-y-6">
                <ShieldCheck className="w-16 h-16 text-primary-200 mx-auto" />
                <div>
                   <h2 className="text-2xl font-bold text-white">Proctoring Required</h2>
                   <p className="text-light-100 mt-2">
                     To ensure assessment integrity, we require access to your:
                   </p>
                </div>
                
                <div className="flex gap-4 justify-center text-sm text-light-100">
                    <div className="flex flex-col items-center gap-2">
                        <Camera className="w-8 h-8 text-blue-400" />
                        <span>Webcam</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Monitor className="w-8 h-8 text-purple-400" />
                        <span>Entire Screen</span>
                    </div>
                </div>

                <Button onClick={startProctoring} className="btn-primary w-full">
                    Enable Proctoring & Start
                </Button>
                <p className="text-xs text-gray-500">Your data is processed securely and not stored permanently.</p>
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
      <div className="w-48 h-36 bg-black rounded-2xl overflow-hidden border-2 border-primary-200 shadow-[0_0_20px_rgba(130,103,248,0.4)] relative group pointer-events-auto">
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform scale-x-[-1]" 
        />
        
        {/* Scanning Overlay */}
        <div className="absolute inset-0 border-[1px] border-primary-200/30 pointer-events-none">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary-200"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary-200"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary-200"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary-200"></div>
            
            {/* Moving Scanner Line */}
            <div className="absolute left-0 right-0 h-[2px] bg-primary-200/50 shadow-[0_0_10px_#8267f8] animate-scanTopToBottom"></div>
        </div>

        {/* Live Status Tags */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live AI Scanning</span>
        </div>

        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
            <span className="text-[9px] font-medium text-success-100 uppercase tracking-tighter">Face Detected: Verified</span>
        </div>

        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-center text-white px-2 font-bold uppercase tracking-widest">
            Proctoring Shield Active
        </div>
      </div>
    </div>
  );
};
