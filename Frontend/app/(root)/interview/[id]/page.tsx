// ... imports
import { IntegrityShield } from "@/Client/components/IntegrityShield"; // Import IntegrityShield

// ... inside the component (Server Component)
      <div className="flex flex-row gap-4 justify-between">
          {/* ... existing header code ... */}
      </div>

      {/* Render Proctoring via Client Wrapper or inside Agent if Agent is client. Assuming Agent is client. */}
      {/* If Agent is client, we can add a prop "enableProctoring={true}" to it? */}
      {/* Let's check Agent.tsx first. */}
import { redirect } from "next/navigation";

import Agent from "@/Client/components/Agent";
import { getRandomInterviewCover } from "@/lib/utils";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@backend/lib/actions/general.action";
import { getCurrentUser } from "@backend/lib/actions/auth.action";
import DisplayTechIcons from "@/Client/components/DisplayTechIcons";

const InterviewDetails = async ({ params }: RouteParams) => {
  const { id } = await params;

  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  return (
    <>
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
          <div className="flex flex-row gap-4 items-center">
            <Image
              src={getRandomInterviewCover()}
              alt="cover-image"
              width={40}
              height={40}
              className="rounded-full object-cover size-[40px]"
            />
            <h3 className="capitalize">{interview.role} Interview</h3>
          </div>

          <DisplayTechIcons techStack={interview.techstack} />
        </div>

        <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit">
          {interview.type}
        </p>
      </div>

      <Agent
        userName={user?.name!}
        userId={user?.id}
        interviewId={id}
        type="interview"
        questions={interview.questions}
        feedbackId={feedback?.id}
      />
    </>
  );
};

export default InterviewDetails;
