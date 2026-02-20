import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/Client/components/InterviewCard";
import ClientDashboardWrapper from "@/Client/components/ClientDashboardWrapper"; // Import Wrapper

import { getCurrentUser } from "@backend/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@backend/lib/actions/general.action";
import { getJobs } from "@backend/HR/actions/job.action";

async function Home() {
  const user = await getCurrentUser(); 
  
  const [userInterviewsData, liveJobsData] = await Promise.all([
    getInterviewsByUserId(user?.id || ""),
    getJobs()
  ]);

  const liveJobs = liveJobsData || [];
  const userInterviews = userInterviewsData || [];

  // Mock Data
  const mockInterviews = [
    {
      id: "mock-frontend",
      role: "Frontend Developer",
      type: "Practice",
      techstack: ["React", "JavaScript", "CSS"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "mock-backend",
      role: "Backend Engineer",
      type: "Practice",
      techstack: ["Node.js", "Express", "MongoDB"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "mock-fullstack",
      role: "Full Stack Developer",
      type: "Practice",
      techstack: ["Next.js", "TypeScript", "PostgreSQL"],
      createdAt: new Date().toISOString(),
    },
    {
        id: "mock-ios",
        role: "iOS Developer",
        type: "Practice",
        techstack: ["Swift", "SwiftUI", "Combine"],
        createdAt: new Date().toISOString(),
    },
    {
        id: "mock-android",
        role: "Android Engineer",
        type: "Practice",
        techstack: ["Kotlin", "Jetpack Compose", "Coroutines"],
        createdAt: new Date().toISOString(),
    },
    {
        id: "mock-devops",
        role: "DevOps Engineer",
        type: "Practice",
        techstack: ["Docker", "Kubernetes", "Terraform"],
        createdAt: new Date().toISOString(),
    },
    {
        id: "mock-ai",
        role: "AI / ML Engineer",
        type: "Practice",
        techstack: ["Python", "PyTorch", "OpenAI"],
        createdAt: new Date().toISOString(),
    },
    {
        id: "mock-qa",
        role: "QA Automation",
        type: "Practice",
        techstack: ["Selenium", "Cypress", "Jest"],
        createdAt: new Date().toISOString(),
    }
  ];

  const hasPastInterviews = userInterviews.length > 0;
  const hasLiveJobs = liveJobs.length > 0;

  return (
    <ClientDashboardWrapper user={user}>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>AI-Enabled HR Evaluation System: From Resume to Offer</h2>
          <p className="text-lg text-white/70">
            A complete platform for Smart Resume Shortlisting, Multi-Modal Assessment, and Explainable AI Hiring Decisions.
          </p>

          <div className="flex flex-wrap gap-4 w-full">
            <Button asChild className="btn-primary flex-1">
              <Link href="/resume-shortlist">Check Resume Score</Link>
            </Button>
            <Button asChild className="btn-secondary flex-1 shadow-inner">
              <Link href="/interview">Start Custom Interview</Link>
            </Button>
          </div>
          <div className="flex justify-center w-full">
            <Button variant="link" asChild className="text-primary-200 hover:text-white font-bold transition-all underline decoration-primary-200/30 underline-offset-4">
                <Link href="/hr/dashboard">Recruiter View (HR Dashboard) &rarr;</Link>
            </Button>
          </div>
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden animate-float"
        />
      </section>

      {/* NEW: Live Job Openings section */}
      <section className="flex flex-col gap-8 mt-12 bg-primary-200/[0.03] p-8 rounded-[40px] border border-primary-200/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
               <Image src="/job-logo.jpeg" alt="Job Logo" width={48} height={48} className="object-cover" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Live Job Openings</h2>
              <p className="text-light-100 italic mt-1">Apply now for active roles and get instant AI assessment.</p>
            </div>
          </div>
          {hasLiveJobs && (
             <span className="text-[10px] bg-success-100/20 text-success-100 border border-success-100/30 px-3 py-1 rounded-full font-bold uppercase tracking-widest animate-pulse">
                New Opportunities
             </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hasLiveJobs ? (
            liveJobs.map((job: any) => (
              <div key={job.id} className="relative group">
                <InterviewCard
                  userId={user?.id || "guest-user"}
                  interviewId={job.id}
                  role={job.role || job.title}
                  type="Job Opening"
                  techstack={job.techstack || [job.department, job.location]}
                  createdAt={job.createdAt}
                />
                <div className="absolute inset-0 bg-primary-200/5 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-[30px] z-10 pointer-events-none">
                  <Link 
                    href={`/apply/${job.id}`} 
                    className="bg-primary-200 text-white px-8 py-3 rounded-xl font-bold shadow-[0_4px_20px_rgba(130,103,248,0.5)] pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition-all hover:scale-105 active:scale-95"
                  >
                    Apply Now &rarr;
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center card-border border-dashed bg-white/[0.01]">
                <p className="text-light-100 italic">No live job openings currently available. HR team is updating the board.</p>
            </div>
          )}
        </div>
      </section>

      {/* Your Interviews section */}
      <section className="flex flex-col gap-6 mt-12">
        <h2 className="text-2xl font-bold">Your Past Assessments</h2>

        <div className="interviews-section overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-6">
            {hasPastInterviews ? (
              userInterviews?.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  userId={user?.id || "guest-user"}
                  interviewId={interview.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                />
              ))
            ) : (
                <div className="w-full card-border p-12 text-center bg-white/[0.02]">
                    <p className="text-light-100 italic">You haven&apos;t taken any assessments yet. Try a practice mode below!</p>
                </div>
            )}
          </div>
        </div>
      </section>

      {/* Practice Mode Assessments */}
      <section className="flex flex-col gap-6 mt-12 mb-20">
        <h2 className="text-2xl font-bold">Practice Assessments</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockInterviews.map((interview: any) => (
             <InterviewCard
              key={interview.id}
              userId={user?.id || "guest-user"}
              interviewId={interview.id}
              role={interview.role}
              type="Practice"
              techstack={interview.techstack}
              createdAt={interview.createdAt}
            />
          ))}
        </div>
      </section>
    </ClientDashboardWrapper>
  );
}

export default Home;
