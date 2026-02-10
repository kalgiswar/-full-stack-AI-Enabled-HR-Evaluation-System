export const HR_STATS = [
    { label: "Active Candidates", value: "42", change: "+12%", trend: "up" },
    { label: "Interviews Today", value: "8", change: "On Track", trend: "neutral" },
    { label: "Avg. Match Score", value: "76%", change: "+5%", trend: "up" },
    { label: "Time to Hire", value: "14d", change: "-2d", trend: "up" },
];

export const PIPELINE_DATA = [
    {
        id: "c1",
        name: "Alex Morgan",
        role: "Frontend Developer",
        stage: "Interview",
        matchScore: 88,
        status: "High Potential",
        appliedDate: "2024-03-10",
        avatar: "/avatars/alex.png", // Mock
        skills: ["React", "TypeScript", "Node.js"]
    },
    {
        id: "c2",
        name: "Sarah Chen",
        role: "Backend Engineer",
        stage: "Assessment",
        matchScore: 92,
        status: "Top Pick",
        appliedDate: "2024-03-12",
        avatar: "/avatars/sarah.png", 
        skills: ["Python", "Django", "AWS"]
    },
    {
        id: "c3",
        name: "Jordan Lee",
        role: "Product Designer",
        stage: "Screening",
        matchScore: 65,
        status: "Reviewing",
        appliedDate: "2024-03-14",
        avatar: "/avatars/jordan.png",
        skills: ["Figma", "UI/UX", "Prototyping"]
    },
    {
        id: "c4",
        name: "David Kim",
        role: "Full Stack Dev",
        stage: "Offer",
        matchScore: 95,
        status: "Offer Sent",
        appliedDate: "2024-03-01",
        avatar: "/avatars/david.png",
        skills: ["MERN", "Docker", "K8s"]
    },
    {
        id: "c5",
        name: "Emily Wang",
        role: "Data Scientist",
        stage: "Rejected",
        matchScore: 45,
        status: "Skills Gap",
        appliedDate: "2024-03-05",
        avatar: "/avatars/emily.png",
        skills: ["Python", "R", "Pandas"]
    }
];

export const SKILL_DISTRIBUTION = [
    { name: "Frontend", value: 35 },
    { name: "Backend", value: 30 },
    { name: "Design", value: 15 },
    { name: "Data", value: 20 },
];
