# 🚀 Prisma & PostgreSQL Cheat Sheet

## 📚 Quick Reference for Common Operations

---

## 🔍 READING DATA (Queries)

### Get One Record by ID
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

### Get One Record by Other Field
```typescript
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" }
});
```

### Get First Match
```typescript
const interview = await prisma.interview.findFirst({
  where: { userId }
});
```

### Get All Records
```typescript
const allUsers = await prisma.user.findMany();
```

### Get with Filters
```typescript
const activeJobs = await prisma.job.findMany({
  where: {
    status: "active",
    department: "Engineering"
  }
});
```

### Get with Multiple Conditions (AND)
```typescript
const results = await prisma.interview.findMany({
  where: {
    userId: "abc-123",
    finalized: true,
    createdAt: {
      gte: new Date("2024-01-01")  // Greater than or equal
    }
  }
});
```

### Get with OR Conditions
```typescript
const results = await prisma.resumeAnalysis.findMany({
  where: {
    OR: [
      { category: "High Match" },
      { matchScore: { gte: 80 } }
    ]
  }
});
```

### Get with Sorting
```typescript
const interviews = await prisma.interview.findMany({
  orderBy: {
    createdAt: 'desc'  // desc = newest first, asc = oldest first
  }
});
```

### Get with Limit
```typescript
const recent = await prisma.interview.findMany({
  take: 10,  // Limit to 10 results
  orderBy: { createdAt: 'desc' }
});
```

### Get with Pagination
```typescript
const page2 = await prisma.interview.findMany({
  skip: 20,   // Skip first 20
  take: 20,   // Get next 20
  orderBy: { createdAt: 'desc' }
});
```

### Get with Relations (JOINs!)
```typescript
const interview = await prisma.interview.findUnique({
  where: { id },
  include: {
    user: true,      // Include related user
    feedback: true   // Include related feedback
  }
});

// Result has nested objects!
// interview.user.name
// interview.feedback.totalScore
```

### Get with Selective Fields
```typescript
const users = await prisma.user.findMany({
  select: {
    name: true,
    email: true
    // id will NOT be included unless explicitly selected
  }
});
```

---

## ✏️ CREATING DATA

### Create One Record
```typescript
const user = await prisma.user.create({
  data: {
    name: "John Doe",
    email: "john@example.com"
  }
});
```

### Create with Relations
```typescript
const interview = await prisma.interview.create({
  data: {
    role: "Software Engineer",
    transcript: [...],
    user: {
      connect: { id: userId }  // Link to existing user
    }
  }
});
```

### Create Multiple Records
```typescript
const newUsers = await prisma.user.createMany({
  data: [
    { name: "Alice", email: "alice@example.com" },
    { name: "Bob", email: "bob@example.com" },
  ]
});
```

### Create with Nested Relations
```typescript
const interview = await prisma.interview.create({
  data: {
    role: "Engineer",
    userId: userId,
    feedback: {
      create: {  // Create related feedback at the same time!
        userId: userId,
        totalScore: 85,
        categoryScores: {...},
        strengths: ["Great communication"],
        areasForImprovement: ["More depth"],
        finalAssessment: "Strong candidate"
      }
    }
  }
});
```

---

## 🔄 UPDATING DATA

### Update One Record
```typescript
const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: {
    name: "John Updated"
  }
});
```

### Update Multiple Records
```typescript
const result = await prisma.job.updateMany({
  where: { status: "active" },
  data: { status: "closed" }
});
// Returns: { count: 5 } (number of updated records)
```

### Increment a Number
```typescript
await prisma.job.update({
  where: { id: jobId },
  data: {
    applicantsCount: {
      increment: 1  // Add 1 to current value
    }
  }
});
```

### Update or Create (Upsert)
```typescript
const user = await prisma.user.upsert({
  where: { email: "john@example.com" },
  update: { name: "John Updated" },     // If exists, update
  create: { name: "John", email: "john@example.com" }  // If not, create
});
```

---

## 🗑️ DELETING DATA

### Delete One Record
```typescript
await prisma.user.delete({
  where: { id: userId }
});
```

### Delete Multiple Records
```typescript
await prisma.notification.deleteMany({
  where: { read: true }
});
```

### Delete All Records from Table
```typescript
await prisma.notification.deleteMany();  // ⚠️ Deletes ALL!
```

---

## 📊 COUNTING & AGGREGATIONS

### Count Records
```typescript
const count = await prisma.interview.count({
  where: { userId }
});
```

### Average, Sum, Min, Max
```typescript
const stats = await prisma.feedback.aggregate({
  _avg: { totalScore: true },  // Average score
  _sum: { totalScore: true },  // Sum of all scores
  _min: { totalScore: true },  // Minimum score
  _max: { totalScore: true },  // Maximum score
  _count: true                 // Count
});

// Result:
// {
//   _avg: { totalScore: 78.5 },
//   _sum: { totalScore: 1570 },
//   _min: { totalScore: 45 },
//   _max: { totalScore: 98 },
//   _count: 20
// }
```

### Group By
```typescript
const categoryStats = await prisma.resumeAnalysis.groupBy({
  by: ['category'],  // Group by category
  _count: true,      // Count in each category
  _avg: {
    matchScore: true  // Average score per category
  }
});

// Result:
// [
//   { category: "High Match", _count: 15, _avg: { matchScore: 92 } },
//   { category: "Potential", _count: 25, _avg: { matchScore: 75 } },
//   { category: "Reject", _count: 10, _avg: { matchScore: 45 } }
// ]
```

---

## 🔄 TRANSACTIONS (Multiple Operations)

### Simple Transaction
```typescript
await prisma.$transaction([
  prisma.interview.create({ data: {...} }),
  prisma.notification.create({ data: {...} })
]);
// Both succeed or both fail (atomic)
```

### Interactive Transaction
```typescript
await prisma.$transaction(async (tx) => {
  // Create interview
  const interview = await tx.interview.create({
    data: {...}
  });
  
  // Create notification
  await tx.notification.create({
    data: {
      userId,
      message: `Interview ${interview.id} created`
    }
  });
  
  // Update job applicants count
  await tx.job.update({
    where: { id: jobId },
    data: { applicantsCount: { increment: 1 } }
  });
});
```

---

## 🔍 ADVANCED FILTERING

### String Operations
```typescript
const results = await prisma.user.findMany({
  where: {
    email: {
      contains: "@gmail.com",    // Contains substring
      startsWith: "john",        // Starts with
      endsWith: ".com",          // Ends with
      not: "admin@example.com"   // Not equal
    }
  }
});
```

### Number Comparisons
```typescript
const highScorers = await prisma.feedback.findMany({
  where: {
    totalScore: {
      gte: 80,  // Greater than or equal
      lte: 100  // Less than or equal
    }
  }
});
```

### Date Filtering
```typescript
const recentInterviews = await prisma.interview.findMany({
  where: {
    createdAt: {
      gte: new Date("2024-01-01"),  // After this date
      lte: new Date("2024-12-31")   // Before this date
    }
  }
});
```

### Array Contains
```typescript
const candidates = await prisma.resumeAnalysis.findMany({
  where: {
    skillsFound: {
      hasSome: ["React", "TypeScript"]  // Has at least one
    }
  }
});
```

### NOT, IN, NOT IN
```typescript
const results = await prisma.interview.findMany({
  where: {
    userId: {
      not: currentUserId,           // Not equal
      in: ["user1", "user2"],       // In this list
      notIn: ["user3", "user4"]     // Not in this list
    }
  }
});
```

---

## 🚀 RAW SQL (When You Need It)

### Raw Query (SELECT)
```typescript
const results = await prisma.$queryRaw`
  SELECT * FROM users WHERE email LIKE ${'%@gmail.com'}
`;
```

### Raw Execute (INSERT/UPDATE/DELETE)
```typescript
await prisma.$executeRaw`
  UPDATE jobs SET status = 'closed' WHERE created_at < NOW() - INTERVAL '30 days'
`;
```

---

## 🎯 COMMON PATTERNS

### Check if Exists
```typescript
const exists = await prisma.user.findUnique({
  where: { email: "user@example.com" }
}) !== null;
```

### Get or Create
```typescript
let user = await prisma.user.findUnique({
  where: { email }
});

if (!user) {
  user = await prisma.user.create({
    data: { email, name }
  });
}
```

### Soft Delete (Mark as Deleted)
```typescript
// Add 'deletedAt' field to your schema first
await prisma.user.update({
  where: { id: userId },
  data: { deletedAt: new Date() }
});

// Query only non-deleted
const activeUsers = await prisma.user.findMany({
  where: { deletedAt: null }
});
```

---

## 🔧 USEFUL COMMANDS

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Create migration (production)
npx prisma migrate dev --name add_user_role

# Open Prisma Studio (visual editor)
npx prisma studio

# Format schema file
npx prisma format

# View migration status
npx prisma migrate status

# Reset database (⚠️ deletes all data!)
npx prisma migrate reset
```

---

## 💡 PRO TIPS

1. **Always use `include` for relations** - Much faster than separate queries
2. **Use `select` to reduce data** - Only fetch what you need
3. **Index frequently queried fields** - Add `@@index([fieldName])` in schema
4. **Use transactions for related operations** - Ensures data consistency
5. **Enable query logging in development** - See the SQL being generated

---

## 🎓 Learning Resources

- **Prisma Docs:** https://www.prisma.io/docs/concepts/components/prisma-client
- **Prisma Examples:** https://github.com/prisma/prisma-examples
- **PostgreSQL Tutorial:** https://www.postgresqltutorial.com/

---

**Save this file! You'll reference it constantly while coding!** 📌
