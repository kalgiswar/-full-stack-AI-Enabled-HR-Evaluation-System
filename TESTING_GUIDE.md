# 🧪 Testing Your PostgreSQL Database - Step by Step

## ✅ **Quick Testing Guide**

Since you have Prisma Studio running, let's test using the visual interface first!

---

## **Method 1: Visual Testing with Prisma Studio** (Easiest!)

### **Step 1: Open Prisma Studio**
- Go to: **http://localhost:51212**
- You should see all 7 tables in the left sidebar

### **Step 2: Add a Test User**
1. Click on **"users"** table
2. Click **"Add record"** button (top right)
3. Fill in the form:
   - **email**: `test@example.com`
   - **name**: `Test User`
   - **role**: `candidate`
   - Leave other fields as default
4. Click **"Save 1 change"**

**✅ If you see the user appear in the table, your database is working!**

### **Step 3: Add a Test Job**
1. Click on **"jobs"** table
2. Click **"Add record"**
3. Fill in:
   - **title**: `Software Engineer`
   - **department**: `Engineering`
   - **location**: `Remote`
   - **description**: `Looking for a talented developer`
   - **criteria**: `React, TypeScript`
   - **status**: `active`
   - **applicants_count**: `0`
4. Click **"Save 1 change"**

**✅ Job created!**

### **Step 4: Add a Test Interview** 
1. Click on **"interviews"** table
2. Click **"Add record"**
3. Fill in:
   - **user_id**: Select the test user you created (from dropdown)
   - **role**: `Frontend Developer`
   - **finalized**: Check the box (true)
   - **transcript**: Leave as `{}`
4. Click **"Save 1 change"**

**✅ Interview created with relationship to user!**

### **Step 5: View the Relationship**
1. Go back to **"users"** table
2. Click on your test user
3. You should see **"interviews (1)"** showing the relationship!

**✅ This confirms relationships (Foreign Keys) are working!**

---

## **Method 2: Test with Actual Application**

### **Step 1: Start Your Development Server**
```bash
# In the Frontend directory
npm run dev
```

### **Step 2: Try to Sign Up**
1. Open your app in browser (usually http://localhost:3000)
2. Go to the signup page
3. Try creating a new account

**Note:** This will test the FULL stack:
- Frontend form
- Server action
- Supabase auth
- PostgreSQL database

---

## **Method 3: Quick Database Query Test**

Open a new PowerShell terminal and run:

```powershell
# Set environment variable for this session
$env:DATABASE_URL="postgresql://postgres:vVHjUaINozlvJ5LV@db.jejpaynztrbeotggvsmf.supabase.co:5432/postgres"

# Enter Node REPL
node

# Then paste this (one line at a time):
```

```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Test query
prisma.user.findMany().then(users => {
  console.log('Users in database:', users)
  process.exit(0)
})
```

**If you see an array of users, it's working!**

---

## **What to Test:**

### ✅ **Basic Operations** (in Prisma Studio):
- [ ] Create a user
- [ ] Create a job
- [ ] Create an interview linked to user
- [ ] View the data
- [ ] Edit a record
- [ ] Delete a record

### ✅ **Relationships** (in Prisma Studio):
- [ ] User has interviews
- [ ] Interview has feedback
- [ ] Job has resume analyses
- [ ] User has notifications

### ✅ **Application Flow** (in your app):
- [ ] Sign up new user
- [ ] Sign in
- [ ] Create interview
- [ ] View interviews
- [ ] Sign out

---

## **Expected Results:**

### **If Everything Works:**
- ✅ You can add records in Prisma Studio
- ✅ Relationships show up correctly
- ✅ Data persists (refresh browser, data is still there)
- ✅ You can query data

### **If Something's Wrong:**
- ❌ Can't connect to database → Check DATABASE_URL in .env.local
- ❌ Can't add records → Check Prisma schema
- ❌ Relationships don't work → Check foreign keys

---

## **Quick Verification Checklist:**

Run these checks:

### **1. Database Connection**
- ✅ Prisma Studio opens (http://localhost:51212)
- ✅ All 7 tables visible

### **2. Tables Exist**
- ✅ users
- ✅ interviews
- ✅ feedback
- ✅ jobs
- ✅ resume_analyses
- ✅ notifications
- ✅ assessment_results

### **3. Can Add Data**
- ✅ Add a user successfully
- ✅ User appears in table

### **4. Relationships Work**
- ✅ Can link interview to user
- ✅ Relationship shows in UI

---

## **What I Recommend:**

**Start Simple:**
1. **Open Prisma Studio** (http://localhost:51212)
2. **Add 1 user** manually
3. **Verify it appears** in the table
4. **Add 1 interview** linked to that user
5. **Check the relationship** works

**That's it!** If these work, your entire migration is successful! 🎉

---

## **Having Issues?**

Tell me:
- "I can't see tables in Prisma Studio"
- "I added a user but got an error"
- "Relationships aren't showing"
- "I want to test the application instead"

I'll help you troubleshoot! 🔧

---

## **Next Steps After Testing:**

Once you've verified the database works:
1. ✅ Test complete!
2. 📱 Update frontend authentication
3. 🚀 Deploy to production

**Ready to test?** Open **http://localhost:51212** and try adding a user! 🎯
