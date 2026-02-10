# 🚀 PostgreSQL Migration Learning Plan

## 📋 Phase 1: Setup & Understanding (30 minutes)

### What You'll Learn:
- How to create a Supabase account
- Understanding PostgreSQL connection strings
- What environment variables are and why they're secure

### Tasks:
1. [ ] Create Supabase account at https://supabase.com
2. [ ] Create a new project (choose a region close to you)
3. [ ] Get your database credentials:
   - Go to Project Settings → Database
   - Copy the Connection Pooling URL (Transaction Mode)
   - Copy the anon/public key and service_role key
4. [ ] Add credentials to `.env.local` file

---

## 📋 Phase 2: Install Prisma ORM (15 minutes)

### What You'll Learn:
- What an ORM (Object-Relational Mapping) is
- How Prisma generates TypeScript types automatically
- How to define database schemas in code

### What is Prisma?
Prisma is a modern ORM that:
- Writes SQL queries for you using JavaScript/TypeScript
- Auto-generates TypeScript types from your database schema
- Provides a simple, intuitive API

**Example Comparison:**

```typescript
// OLD: Firestore (manual, no types)
const users = await db.collection("users").where("email", "==", email).get();
const data = users.docs[0].data(); // ❌ No type safety!

// NEW: Prisma (typed, auto-complete)
const user = await prisma.user.findUnique({
  where: { email }
}); // ✅ Full TypeScript support!
```

### Tasks:
1. [ ] Install Prisma: `npm install prisma @prisma/client`
2. [ ] Initialize Prisma: `npx prisma init`
3. [ ] Update `.env` with DATABASE_URL

---

## 📋 Phase 3: Design Database Schema (45 minutes)

### What You'll Learn:
- How to design relational database tables
- Understanding Primary Keys, Foreign Keys, and Relationships
- Data types in PostgreSQL

### Schema Overview:

```
┌─────────────┐
│    users    │ (Main user account)
└──────┬──────┘
       │
       ├──────► interviews (One user → Many interviews)
       │
       ├──────► resume_analyses (One user → Many resumes)
       │
       ├──────► notifications (One user → Many notifications)
       │
       └──────► assessment_results (One user → Many assessments)

┌─────────────┐
│    jobs     │ (Job postings)
└──────┬──────┘
       │
       └──────► resume_analyses (One job → Many applications)

┌──────────────┐
│  interviews  │
└──────┬───────┘
       │
       └──────► feedback (One interview → One feedback)
```

### Tasks:
1. [ ] Create `prisma/schema.prisma` with all tables
2. [ ] Run `npx prisma generate` to create TypeScript types
3. [ ] Run `npx prisma db push` to create tables in Supabase

---

## 📋 Phase 4: Create Prisma Client (10 minutes)

### What You'll Learn:
- How to create a singleton database client
- Why we reuse connections instead of creating new ones

### Tasks:
1. [ ] Create `Frontend/DataBase/postgresql/client.ts`
2. [ ] Replace Firestore imports with Prisma client

---

## 📋 Phase 5: Migrate Server Actions (2 hours)

### What You'll Learn:
- How to convert Firestore queries to SQL (via Prisma)
- CRUD operations: Create, Read, Update, Delete
- Relationships and JOINs

### Conversion Examples:

#### Example 1: Creating a User
```typescript
// BEFORE (Firestore)
await db.collection("users").doc(uid).set({
  name,
  email,
  createdAt: new Date().toISOString()
});

// AFTER (Prisma)
await prisma.user.create({
  data: {
    id: uid,
    name,
    email
  }
});
```

#### Example 2: Querying with Filters
```typescript
// BEFORE (Firestore)
const interviews = await db
  .collection("interviews")
  .where("userId", "==", userId)
  .get();

// AFTER (Prisma)
const interviews = await prisma.interview.findMany({
  where: {
    userId
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

#### Example 3: Relations (The Power of SQL!)
```typescript
// BEFORE (Firestore) - Need multiple queries
const interview = await db.collection("interviews").doc(id).get();
const feedback = await db
  .collection("feedback")
  .where("interviewId", "==", id)
  .get();

// AFTER (Prisma) - Single query with JOIN!
const interview = await prisma.interview.findUnique({
  where: { id },
  include: {
    feedback: true,  // Automatically joins!
    user: true       // Get user info too!
  }
});
```

### Files to Migrate:
1. [ ] `auth.action.ts` - User authentication
2. [ ] `general.action.ts` - Interviews & Feedback
3. [ ] `job.action.ts` - Job postings
4. [ ] `resume.action.ts` - Resume analysis
5. [ ] `assessment.action.ts` - Assessment results

---

## 📋 Phase 6: Migrate Supabase Auth (1 hour)

### What You'll Learn:
- How Supabase Auth works (similar to Firebase Auth)
- JWT tokens and session management
- Row Level Security (RLS) in PostgreSQL

### Tasks:
1. [ ] Install `@supabase/supabase-js`
2. [ ] Create Supabase client for auth
3. [ ] Update auth actions to use Supabase Auth
4. [ ] Update frontend to use Supabase Auth SDK

---

## 📋 Phase 7: Testing & Cleanup (30 minutes)

### Tasks:
1. [ ] Test user signup/signin
2. [ ] Test creating interviews
3. [ ] Test resume upload & analysis
4. [ ] Remove Firebase dependencies
5. [ ] Delete old Firestore code

---

## 🎓 Learning Resources

### During Migration:
- **Prisma Docs**: https://www.prisma.io/docs
- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Tutorial**: https://www.postgresqltutorial.com/

### Key Concepts to Understand:
1. **Primary Key**: Unique identifier for each row (like document ID in Firestore)
2. **Foreign Key**: Links tables together (e.g., `userId` in interviews table)
3. **Relations**: How tables connect (One-to-Many, Many-to-Many)
4. **Migrations**: Version control for your database schema
5. **Indexes**: Speed up queries (like Firestore compound indexes)

---

## 🚦 Current Status: ⏳ Ready to Begin

**Next Step:** Tell me when you're ready, and I'll help you with Phase 1!
