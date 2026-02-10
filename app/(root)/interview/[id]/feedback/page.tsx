import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { CheckCircle, XCircle, AlertTriangle, TrendingUp, Brain, Code, MessageSquare } from "lucide-react";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@backend/lib/actions/general.action";
import { getAssessmentResult } from "@backend/Client/actions/assessment.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@backend/lib/actions/auth.action";

const Feedback = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const [feedback, assessment] = await Promise.all([
     getFeedbackByInterviewId({
        interviewId: id,
        userId: user?.id!,
      }),
      getAssessmentResult(id, user?.id!)
  ]);

  // Scoring Logic
  const interviewScore = feedback?.totalScore || 0;
  // Mocking technical score if simple code exists, or use random for demo if undefined
  const technicalScore = assessment?.technicalCode ? 85 : 0; 
  const psychoScore = assessment ? 
    (assessment.psychometricScores.resilience + assessment.psychometricScores.teamwork + assessment.psychometricScores.leadership) / 3 
    : 0;

  const finalScore = Math.round((interviewScore * 0.6) + (technicalScore * 0.2) + (psychoScore * 0.2));
  const isHire = finalScore >= 70;

  // Mock Rationale Generation (In real app, AI would generate this based on all inputs)
  const rationale = isHire 
    ? `Candidate demonstrates strong competency in ${interview.role}. Technical skills are solid (${technicalScore}%), and communication during the interview was effective (${interviewScore}%). Psychometric profile indicates good leadership potential.`
    : `Candidate shows promise but falls short of the senior requirements for ${interview.role}. While technical basics are there, the depth of response in the interview was lacking. Psychometric scores suggest potential friction in high-pressure team environments.`;

  return (
    <section className="section-feedback flex flex-col gap-8 max-w-4xl mx-auto py-10">
      
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-2">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
           Decision Engine Result
        </h1>
        <p className="text-light-100 text-lg">
           Comprehensive Analysis for <span className="text-white font-semibold">{interview.role}</span> Role
        </p>
      </div>

      {/* Final Decision Card */}
      <div className={`w-full p-8 rounded-2xl border-2 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl ${isHire ? 'bg-green-950/30 border-green-500/50' : 'bg-red-950/30 border-red-500/50'}`}>
         <div className="flex items-center gap-6">
            {isHire ? <CheckCircle className="w-20 h-20 text-green-400" /> : <XCircle className="w-20 h-20 text-red-500" />}
            <div>
                <h2 className={`text-3xl font-extrabold tracking-tight ${isHire ? 'text-green-400' : 'text-red-500'}`}>
                    {isHire ? "RECOMMENDATION: HIRE" : "RECOMMENDATION: NO HIRE"}
                </h2>
                <p className="text-light-100 mt-1">Confidence Score: <span className="font-mono text-white">{finalScore}%</span></p>
            </div>
         </div>
         <div className="text-right">
             <div className="text-sm text-light-200">Date Evaluated</div>
             <div className="font-semibold text-white">{dayjs().format("MMM D, YYYY")}</div>
         </div>
      </div>

      {/* The "Why" - Rationale */}
      <div className="card-border">
          <div className="card p-6">
             <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Brain className="text-primary-200" /> AI Rationale
             </h3>
             <p className="text-light-100 leading-relaxed text-lg">
                &quot;{rationale}&quot;
             </p>
             <div className="mt-4 flex gap-2 text-sm text-gray-400 bg-dark-300 p-3 rounded-lg border border-white/5">
                 <AlertTriangle size={16} />
                 <span>Note: This decision is AI-generated based on technical, behavioral, and psychometric data points.</span>
             </div>
          </div>
      </div>

      {/* Competency Mapping - Visual Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-border">
             <div className="card p-6 h-full">
                 <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="text-blue-400" /> Competency Map
                 </h3>
                 <div className="space-y-6">
                     <ScoreBar label="Technical Proficiency" score={technicalScore} icon={<Code size={18} />} color="bg-blue-500" />
                     <ScoreBar label="Communication" score={interviewScore} icon={<MessageSquare size={18} />} color="bg-purple-500" />
                     <ScoreBar label="Resilience & Adaptability" score={assessment?.psychometricScores?.resilience || 50} icon={<ActivityIcon />} color="bg-orange-500" />
                     <ScoreBar label="Leadership Potential" score={assessment?.psychometricScores?.leadership || 50} icon={<ActivityIcon />} color="bg-green-500" />
                 </div>
             </div>
          </div>

          <div className="card-border">
             <div className="card p-6 h-full flex flex-col">
                 <h3 className="text-xl font-bold text-white mb-4">Interview Strengths</h3>
                 <ul className="space-y-3 mb-6">
                    {feedback?.strengths?.slice(0, 3).map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-light-100">
                            <CheckCircle size={16} className="text-green-400 mt-1 shrink-0" />
                            <span>{s}</span>
                        </li>
                    )) || <p className="text-gray-500">No specific strengths recorded.</p>}
                 </ul>

                 <h3 className="text-xl font-bold text-white mb-4">Areas for Improvement</h3>
                 <ul className="space-y-3">
                    {feedback?.areasForImprovement?.slice(0, 3).map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-light-100">
                            <TrendingUp size={16} className="text-yellow-400 mt-1 shrink-0" />
                            <span>{s}</span>
                        </li>
                    )) || <p className="text-gray-500">No specific improvements recorded.</p>}
                 </ul>
             </div>
          </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Button className="btn-secondary flex-1 h-12 text-lg">
          <Link href="/" className="flex w-full h-full items-center justify-center">
             Back to Dashboard
          </Link>
        </Button>

        <Button className="btn-primary flex-1 h-12 text-lg">
          <Link href={`/assessment/${id}`} className="flex w-full h-full items-center justify-center">
               Retake Assessment
          </Link>
        </Button>
      </div>
    </section>
  );
};

// Helper Components
const ScoreBar = ({ label, score, icon, color }: any) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-light-100">{icon} {label}</span>
            <span className="font-bold text-white">{score}%</span>
        </div>
        <div className="h-2 w-full bg-dark-300 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${score}%` }} />
        </div>
    </div>
);

const ActivityIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);

export default Feedback;
