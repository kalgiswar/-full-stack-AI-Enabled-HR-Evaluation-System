// ============================================
// 🧪 DATABASE TEST SCRIPT
// ============================================
// This script tests your PostgreSQL database
// Run with: node test-database.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🧪 Starting Database Tests...\n');

  try {
    // ============================================
    // TEST 1: Database Connection
    // ============================================
    console.log('📡 Test 1: Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');

    // ============================================
    // TEST 2: Count Records in Each Table
    // ============================================
    console.log('📊 Test 2: Counting records in each table...');
    
    const counts = {
      users: await prisma.user.count(),
      interviews: await prisma.interview.count(),
      feedback: await prisma.feedback.count(),
      jobs: await prisma.job.count(),
      resumeAnalyses: await prisma.resumeAnalysis.count(),
      notifications: await prisma.notification.count(),
      assessmentResults: await prisma.assessmentResult.count(),
    };

    console.log('Table counts:');
    console.log(`  - Users: ${counts.users}`);
    console.log(`  - Interviews: ${counts.interviews}`);
    console.log(`  - Feedback: ${counts.feedback}`);
    console.log(`  - Jobs: ${counts.jobs}`);
    console.log(`  - Resume Analyses: ${counts.resumeAnalyses}`);
    console.log(`  - Notifications: ${counts.notifications}`);
    console.log(`  - Assessment Results: ${counts.assessmentResults}`);
    console.log('✅ All tables accessible!\n');

    // ============================================
    // TEST 3: Create Test User
    // ============================================
    console.log('👤 Test 3: Creating test user...');
    
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'testuser@example.com' }
    });

    let testUser;
    if (existingUser) {
      console.log('ℹ️  Test user already exists, using existing user');
      testUser = existingUser;
    } else {
      testUser = await prisma.user.create({
        data: {
          email: 'testuser@example.com',
          name: 'Test User',
          role: 'candidate',
        },
      });
      console.log(`✅ Created test user: ${testUser.name} (${testUser.email})`);
    }
    console.log(`   User ID: ${testUser.id}\n`);

    // ============================================
    // TEST 4: Create Test Job
    // ============================================
    console.log('💼 Test 4: Creating test job...');
    
    const testJob = await prisma.job.create({
      data: {
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'Remote',
        description: 'We are looking for a talented software engineer...',
        criteria: 'React, TypeScript, Node.js',
        status: 'active',
        applicantsCount: 0,
      },
    });
    console.log(`✅ Created test job: ${testJob.title}`);
    console.log(`   Job ID: ${testJob.id}\n`);

    // ============================================
    // TEST 5: Create Test Interview
    // ============================================
    console.log('🎤 Test 5: Creating test interview...');
    
    const testInterview = await prisma.interview.create({
      data: {
        userId: testUser.id,
        role: 'Software Engineer',
        transcript: [
          { role: 'interviewer', content: 'Tell me about yourself' },
          { role: 'candidate', content: 'I am a software engineer...' }
        ],
        duration: 1800,
        finalized: true,
      },
    });
    console.log(`✅ Created test interview: ${testInterview.id}`);
    console.log(`   Role: ${testInterview.role}\n`);

    // ============================================
    // TEST 6: Create Test Feedback (with relationship!)
    // ============================================
    console.log('📝 Test 6: Creating test feedback...');
    
    const testFeedback = await prisma.feedback.create({
      data: {
        interviewId: testInterview.id,
        userId: testUser.id,
        totalScore: 85,
        categoryScores: {
          communicationSkills: 90,
          technicalKnowledge: 85,
          problemSolving: 80,
          culturalFit: 88,
          confidenceClarity: 82
        },
        strengths: ['Clear communication', 'Strong technical skills'],
        areasForImprovement: ['More depth in system design'],
        finalAssessment: 'Strong candidate, recommended for next round',
      },
    });
    console.log(`✅ Created test feedback`);
    console.log(`   Total Score: ${testFeedback.totalScore}\n`);

    // ============================================
    // TEST 7: Test Relations (JOIN query!)
    // ============================================
    console.log('🔗 Test 7: Testing relationships with JOIN...');
    
    const interviewWithDetails = await prisma.interview.findUnique({
      where: { id: testInterview.id },
      include: {
        user: true,
        feedback: true,
      },
    });

    console.log('✅ Retrieved interview with related data:');
    console.log(`   Candidate: ${interviewWithDetails.user.name}`);
    console.log(`   Score: ${interviewWithDetails.feedback.totalScore}`);
    console.log(`   This was ONE query (JOIN) instead of 3 separate queries!\n`);

    // ============================================
    // TEST 8: Test Aggregations
    // ============================================
    console.log('📊 Test 8: Testing aggregations...');
    
    const stats = await prisma.feedback.aggregate({
      _avg: { totalScore: true },
      _max: { totalScore: true },
      _min: { totalScore: true },
      _count: true,
    });

    console.log('✅ Calculated statistics:');
    console.log(`   Average Score: ${stats._avg.totalScore || 0}`);
    console.log(`   Highest Score: ${stats._max.totalScore || 0}`);
    console.log(`   Lowest Score: ${stats._min.totalScore || 0}`);
    console.log(`   Total Feedbacks: ${stats._count}\n`);

    // ============================================
    // TEST 9: Test Complex Query
    // ============================================
    console.log('🔍 Test 9: Testing complex filtering...');
    
    const finalizedInterviews = await prisma.interview.findMany({
      where: {
        finalized: true,
        feedback: {
          totalScore: {
            gte: 80 // Greater than or equal to 80
          }
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        feedback: {
          select: {
            totalScore: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Found ${finalizedInterviews.length} high-scoring finalized interviews`);
    finalizedInterviews.forEach(interview => {
      console.log(`   - ${interview.user.name}: ${interview.feedback.totalScore} points`);
    });
    console.log('');

    // ============================================
    // TEST 10: Cleanup (optional)
    // ============================================
    console.log('🧹 Test 10: Testing delete operations...');
    
    // Delete in reverse order of creation (due to foreign keys)
    await prisma.feedback.delete({ where: { id: testFeedback.id } });
    console.log('✅ Deleted test feedback');
    
    await prisma.interview.delete({ where: { id: testInterview.id } });
    console.log('✅ Deleted test interview');
    
    await prisma.job.delete({ where: { id: testJob.id } });
    console.log('✅ Deleted test job');
    
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Deleted test user');
    
    console.log('\n🎉 All tests passed! Your database is working perfectly!\n');

    // ============================================
    // SUMMARY
    // ============================================
    console.log('📋 Summary:');
    console.log('✅ Database connection working');
    console.log('✅ All tables accessible');
    console.log('✅ Create operations working');
    console.log('✅ Read operations working');
    console.log('✅ Relationships (JOINs) working');
    console.log('✅ Aggregations working');
    console.log('✅ Complex queries working');
    console.log('✅ Delete operations working');
    console.log('\n🚀 Your PostgreSQL migration is 100% functional!\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testDatabase();
