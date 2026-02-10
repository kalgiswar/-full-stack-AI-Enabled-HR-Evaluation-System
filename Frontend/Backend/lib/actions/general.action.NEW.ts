// ============================================
// 📚 LEARNING: Interview & Feedback Actions
// ============================================
// This shows the POWER of PostgreSQL relationships!
// Notice how much simpler queries become with JOINs
// ============================================

"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { prisma } from "@database/postgresql/client";
import { feedbackSchema } from "@/constants";

// ============================================
// 📝 CREATE FEEDBACK
// ============================================
// What's different:
// 1. Use Prisma instead of Firestore
// 2. Automatic timestamp handling
// 3. Type-safe data insertion

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    // ============================================
    // STEP 1: Generate AI feedback (same as before)
    // ============================================
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    // ============================================
    // STEP 2: Save to PostgreSQL
    // ============================================
    
    // BEFORE (Firestore):
    // let feedbackRef;
    // if (feedbackId) {
    //   feedbackRef = db.collection("feedback").doc(feedbackId);
    // } else {
    //   feedbackRef = db.collection("feedback").doc();
    // }
    // await feedbackRef.set(feedback);
    
    // AFTER (Prisma) - Much cleaner!
    const feedback = feedbackId
      ? await prisma.feedback.update({
          where: { id: feedbackId },
          data: {
            interviewId,
            userId,
            totalScore: object.totalScore,
            categoryScores: object.categoryScores, // JSON stored as-is
            strengths: object.strengths, // Arrays work perfectly!
            areasForImprovement: object.areasForImprovement,
            finalAssessment: object.finalAssessment,
            // createdAt is auto-managed, no need to set manually!
          },
        })
      : await prisma.feedback.create({
          data: {
            interviewId,
            userId,
            totalScore: object.totalScore,
            categoryScores: object.categoryScores,
            strengths: object.strengths,
            areasForImprovement: object.areasForImprovement,
            finalAssessment: object.finalAssessment,
          },
        });

    return { success: true, feedbackId: feedback.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

// ============================================
// 🔍 GET INTERVIEW BY ID
// ============================================
// Showcase: Including related data in one query!

export async function getInterviewById(id: string): Promise<Interview | null> {
  
  // BEFORE (Firestore):
  // const interview = await db.collection("interviews").doc(id).get();
  // return interview.data() as Interview | null;
  
  // AFTER (Prisma) - With relationships!
  const interview = await prisma.interview.findUnique({
    where: { id },
    include: {
      user: true,      // Include user data
      feedback: true,  // Include feedback (if exists)
    },
  });
  
  // ============================================
  // 📚 LEARNING: What did we get?
  // ============================================
  // interview = {
  //   id: "abc-123",
  //   userId: "user-456",
  //   role: "Software Engineer",
  //   transcript: [...],
  //   user: {              // ✨ This is the JOIN magic!
  //     id: "user-456",
  //     name: "John Doe",
  //     email: "john@example.com"
  //   },
  //   feedback: {          // ✨ One-to-one relation
  //     totalScore: 85,
  //     strengths: [...],
  //     ...
  //   }
  // }
  //
  // With Firestore, you'd need 2-3 separate queries!
  // ============================================

  return interview as Interview | null;
}

// ============================================
// 🎯 GET FEEDBACK BY INTERVIEW ID
// ============================================
// Simpler filtering with Prisma

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  try {
    // BEFORE (Firestore):
    // const querySnapshot = await db
    //   .collection("feedback")
    //   .where("interviewId", "==", interviewId)
    //   .get();
    // const feedbackDoc = querySnapshot.docs.find(doc => doc.data().userId === userId);
    
    // AFTER (Prisma) - One clean query!
    const feedback = await prisma.feedback.findFirst({
      where: {
        interviewId,
        userId,
      },
    });

    return feedback as Feedback | null;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return null;
  }
}

// ============================================
// 📋 GET LATEST INTERVIEWS
// ============================================
// Showcase: Complex filtering, sorting, and limiting

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  try {
    // BEFORE (Firestore):
    // - Limited query capabilities
    // - Had to fetch all, then filter/sort in memory
    // - Required complex index creation
    
    // AFTER (Prisma) - Clean, powerful queries!
    const interviews = await prisma.interview.findMany({
      where: {
        finalized: true,
        ...(userId && { userId: { not: userId } }), // Exclude user's own interviews
      },
      orderBy: {
        createdAt: 'desc', // Sort by newest first
      },
      take: limit, // Limit results
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        feedback: {
          select: {
            totalScore: true,
          },
        },
      },
    });

    // ============================================
    // 📚 LEARNING: What's happening here?
    // ============================================
    // 1. WHERE clause filters the data
    // 2. ORDER BY sorts the results
    // 3. TAKE limits the number of results
    // 4. INCLUDE joins related tables
    // 5. SELECT chooses specific fields from relations
    //
    // This would require MULTIPLE queries in Firestore!
    // With PostgreSQL + Prisma, it's ONE efficient query!
    // ============================================

    return interviews as Interview[];

  } catch (error: any) {
    console.error("Error fetching latest interviews:", error);
    return null;
  }
}

// ============================================
// 👨‍💼 GET INTERVIEWS BY USER ID
// ============================================
// Simple, clean, type-safe

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  if (!userId) return [];

  try {
    // BEFORE (Firestore):
    // - Manual null checks
    // - In-memory sorting
    // - Complex error handling for indexes
    
    // AFTER (Prisma):
    const interviews = await prisma.interview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        feedback: true, // Include related feedback
      },
    });

    return interviews as Interview[];

  } catch (error: any) {
    console.error("Error fetching user interviews:", error);
    return null;
  }
}

// ============================================
// 📚 COMPARISON SUMMARY:
// ============================================
//
// FIRESTORE CHALLENGES:
// ❌ Manual sorting/filtering in memory
// ❌ Multiple queries for related data
// ❌ Complex index management
// ❌ Limited query operators
// ❌ No type safety
//
// POSTGRESQL + PRISMA BENEFITS:
// ✅ Powerful SQL queries (JOINs, aggregations)
// ✅ One query for complex data
// ✅ Automatic indexes
// ✅ Full SQL query capabilities
// ✅ Complete TypeScript type safety
// ✅ Auto-complete in your IDE
// ✅ Compile-time error checking
//
// ============================================

// ============================================
// 💡 BONUS: Advanced Prisma Features
// ============================================
//
// 1. **Aggregations** (Analytics!):
// const avgScore = await prisma.feedback.aggregate({
//   _avg: { totalScore: true },
//   where: { userId }
// });
//
// 2. **Transactions** (Multiple operations):
// await prisma.$transaction([
//   prisma.interview.create({ data: {...} }),
//   prisma.notification.create({ data: {...} })
// ]);
//
// 3. **Count queries**:
// const count = await prisma.interview.count({
//   where: { userId, finalized: true }
// });
//
// 4. **Pagination**:
// const page2 = await prisma.interview.findMany({
//   skip: 20,  // Skip first 20
//   take: 20,  // Get next 20
// });
//
// ============================================
