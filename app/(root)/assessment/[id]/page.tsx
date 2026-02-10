"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CodingSandbox } from "@/Client/components/CodingSandbox";
import { IntegrityShield } from "@/Client/components/IntegrityShield";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { saveAssessmentResult } from "@backend/Client/actions/assessment.action";

export default function AssessmentPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [activeTab, setActiveTab] = useState("technical");
    const [code, setCode] = useState("// Write a function to reverse a string\nfunction reverseString(str) {\n  \n}");
    const [psychoScores, setPsychoScores] = useState({ resilience: 50, leadership: 50, teamwork: 50 });
    const [violations, setViolations] = useState<string[]>([]);
    
    // New State for Multi-Modal Assessment
    const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
    const [textResponse, setTextResponse] = useState("");

    // Timer Logic
    const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes

    React.useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Sample Data (In a real app, this would come from the DB/API)
    const mcqQuestions = [
        {
            id: "q1",
            scenario: "A deadline is approaching, but a key team member is sick. What do you do?",
            options: [
                "Ask for an extension immediately.",
                "Redistribute the work among the remaining team.",
                "Do the work yourself and work overtime.",
                "Ignore it and hope they return."
            ]
        },
        {
            id: "q2",
            scenario: "You find a security vulnerability in a legacy codebase. It's Friday 5 PM.",
            options: [
                "Patch it immediately and deploy.",
                "Log it and go home.",
                "Inform the lead and assess 'severity' before deciding.",
                "Post about it on social media."
            ]
        }
    ];

    const handleViolation = (type: string) => {
        setViolations(prev => [...prev, type]);
        // Ideally log to DB
    };

    const [isAssessmentActive, setIsAssessmentActive] = useState(true);

// ... imports and setup

    // ... handleViolation ...

    const handleNext = (nextTab: string) => {
        setActiveTab(nextTab);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        console.log("Submit clicked");
        // Keeping proctoring active
        
        if (violations.length > 3) {
            toast.error("Too many proctoring violations. Assessment flagged.");
        } 
        
        try {
            toast.loading("Submitting Assessment...");
            console.log("Saving data...");
            const result = await saveAssessmentResult({
                assessmentId: id,
                technicalCode: code,
                psychometricScores: psychoScores,
                mcqAnswers: mcqAnswers,
                textResponse: textResponse,
                violations: violations,
            });
            console.log("Save result:", result);

            toast.dismiss();

            if (result.success) {
                toast.success("Assessment submitted successfully!");
                console.log("Navigating to interview...");
                // Force Hard Navigation to ensure we move forward
                window.location.href = `/interview/${id}`;
            } else {
                toast.error(`Failed to submit: ${result.error || "Unknown error"}`);
                console.error("Submission failed:", result);
                
                // DEMO MODE: Proceed anyway even if backend fails
                toast.warning("Proceeding to interview (Demo Mode)...");
                setTimeout(() => {
                    window.location.href = `/interview/${id}`; 
                }, 1500);
            }
        } catch (error) {
            toast.dismiss();
            console.error("Submit error:", error);
            alert("Critical Error during submission. Check console.");
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto my-8 relative">
            <IntegrityShield onViolation={handleViolation} isActive={isAssessmentActive} />
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-white">Technical & Psychometric Assessment</h1>
                <div className="bg-dark-200 px-4 py-2 rounded-full text-light-100 text-sm border border-white/10 font-mono">
                    Time Remaining: {formatTime(timeLeft)}
                </div>
            </div>

            {/* Progress / Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-2 overflow-x-auto">
                {['technical', 'scenario', 'open-response', 'psychometric'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-semibold transition-colors shrink-0 capitalize ${activeTab === tab ? "text-primary-200 border-b-2 border-primary-200" : "text-light-100 hover:text-white"}`}
                    >
                        {tab.replace('-', ' ')}
                    </button>
                ))}
            </div>

            <div className="min-h-[500px]">
                {activeTab === "technical" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                        <div className="card-border h-full">
                            <div className="card p-6 flex flex-col gap-4 h-full">
                                <h3 className="text-xl font-bold text-white">Problem Statement</h3>
                                <p className="text-light-100">
                                    Write a function that takes a string as input and returns the string reversed.
                                    Ensure your solution handles empty strings and special characters correctly.
                                </p>
                                <div className="mt-auto">
                                    <h4 className="text-sm font-bold text-white mb-2">Test Cases:</h4>
                                    <ul className="text-sm text-light-100 list-disc list-inside">
                                        <li>"hello" &rarr; "olleh"</li>
                                        <li>"Racecar" &rarr; "racecaR"</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                         <div className="lg:col-span-2 h-[500px] flex flex-col gap-4">
                            <CodingSandbox 
                                language="javascript"
                                code={code}
                                onChange={(val) => setCode(val || "")}
                            />
                            <div className="flex justify-end">
                                <Button onClick={() => handleNext("scenario")} className="btn-secondary">
                                    Next: Scenario Questions &rarr;
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "scenario" && (
                    <div className="card-border max-w-3xl mx-auto mt-10">
                        <div className="card p-8 flex flex-col gap-8">
                            <h3 className="text-2xl font-bold text-center text-white">Scenario-Based Assessment</h3>
                            <p className="text-light-100 text-center">Select the best course of action for each workplace scenario.</p>
                            
                            <div className="space-y-8">
                                {mcqQuestions.map((q) => (
                                    <div key={q.id} className="space-y-4">
                                        <p className="font-semibold text-lg text-white">{q.scenario}</p>
                                        <div className="flex flex-col gap-2">
                                            {q.options.map((option) => (
                                                <label key={option} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${mcqAnswers[q.id] === option ? 'bg-primary-200/20 border-primary-200 text-primary-100' : 'bg-dark-300 border-white/5 text-light-100 hover:bg-dark-200'}`}>
                                                    <input 
                                                        type="radio" 
                                                        name={q.id} 
                                                        value={option}
                                                        checked={mcqAnswers[q.id] === option}
                                                        onChange={() => setMcqAnswers({...mcqAnswers, [q.id]: option})}
                                                        className="w-4 h-4 accent-primary-200"
                                                    />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={() => handleNext("open-response")} className="btn-secondary">
                                    Next: Open Response &rarr;
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "open-response" && (
                     <div className="card-border max-w-3xl mx-auto mt-10">
                        <div className="card p-8 flex flex-col gap-8">
                             <h3 className="text-2xl font-bold text-center text-white">Communication & Thought Process</h3>
                             <div className="space-y-4">
                                <label className="block text-lg font-semibold text-white">
                                    Describe a time you failed to meet a goal. What happened and what did you learn?
                                </label>
                                <p className="text-sm text-light-100">Please provide a detailed response (min 50 words).</p>
                                <textarea 
                                    className="w-full h-64 bg-dark-300 border border-white/10 rounded-xl p-4 text-light-100 focus:outline-none focus:border-primary-200 resize-none"
                                    placeholder="Type your answer here..."
                                    value={textResponse}
                                    onChange={(e) => setTextResponse(e.target.value)}
                                />
                             </div>
                             <div className="flex justify-end">
                                <Button onClick={() => handleNext("psychometric")} className="btn-secondary">
                                    Next: Psychometric Profile &rarr;
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "psychometric" && (
                    <div className="card-border max-w-2xl mx-auto mt-10">
                        <div className="card p-8 flex flex-col gap-8">
                            <h3 className="text-2xl font-bold text-center text-white">Psychometric Profile</h3>
                            
                            <div className="space-y-6">
                                {/* Sliders... */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-white">
                                        <label>How do you handle tight deadlines?</label>
                                        <span className="text-primary-200">{psychoScores.resilience}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" max="100" 
                                        value={psychoScores.resilience}
                                        onChange={(e) => setPsychoScores({...psychoScores, resilience: parseInt(e.target.value)})}
                                        className="w-full h-2 bg-dark-300 rounded-lg appearance-none cursor-pointer accent-primary-200"
                                    />
                                    <div className="flex justify-between text-xs text-light-100">
                                        <span>I panic easily</span>
                                        <span>I thrive under pressure</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-white">
                                        <label>Preference for Group Work?</label>
                                        <span className="text-primary-200">{psychoScores.teamwork}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" max="100" 
                                        value={psychoScores.teamwork}
                                        onChange={(e) => setPsychoScores({...psychoScores, teamwork: parseInt(e.target.value)})}
                                        className="w-full h-2 bg-dark-300 rounded-lg appearance-none cursor-pointer accent-primary-200"
                                    />
                                    <div className="flex justify-between text-xs text-light-100">
                                        <span>Solo Player</span>
                                        <span>Team Player</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-white">
                                        <label>Leadership Tendency?</label>
                                        <span className="text-primary-200">{psychoScores.leadership}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" max="100" 
                                        value={psychoScores.leadership}
                                        onChange={(e) => setPsychoScores({...psychoScores, leadership: parseInt(e.target.value)})}
                                        className="w-full h-2 bg-dark-300 rounded-lg appearance-none cursor-pointer accent-primary-200"
                                    />
                                    <div className="flex justify-between text-xs text-light-100">
                                        <span>Follower</span>
                                        <span>Natural Leader</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-white/10">
                                <Button className="btn-primary" onClick={handleSubmit}>
                                    Submit Assessment & Proceed to Interview
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Removed the global submit button to enforce flow */}
        </div>
    );
}
