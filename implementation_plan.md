# Implementation Plan: AI Enabled HR Evaluation System

## Objective
TRANSFORM the current "Hireguard" mock interview platform into a full "End-to-End HR Evaluation System" with Proctoring, Resume Parsing, and Multi-modal assessments.

## Phase 1: Smart Resume Shortlisting (The "Gatekeeper")
- [ ] **Resume Upload Interface**: Drag & drop zone for PDF/DOCX.
- [ ] **Job Description Input**: Text area to paste the JD.
- [ ] **Parsing & Scoring Engine**:
    - Use Google Gemini to parse the Resume content.
    - Match against JD.
    - Return a "Match Score" (0-100) and category (High Match, Potential, Reject).
- [ ] **Shortlist Dashboard**: View uploaded resumes and their scores.

## Phase 2: Multi-Modal Assessment Engine
- [ ] **Assessment Router**: Navigation between different test types.
- [ ] **Coding Sandbox**: Integrate `monaco-editor` for code challenges.
- [ ] **Psychometric Sliders**: UI for self-assessment.
- [ ] **Scenario MCQs**: Situational questions.

## Phase 3: Integrity Shield (Proctoring)
- [ ] **Webcam Monitoring**: request access and show feed.
- [ ] **Tab Switch Detection**: `visibilitychange` event listener.
- [ ] **Audit Log**: Store suspicious events in state/DB.

## Phase 4: Explainable AI Decision Engine
- [ ] **Report Generation**: Compile scores from Resume + Assessment.
- [ ] **Feedback UI**: Show specific reasons for Hire/No-Hire.

## Current Focus: Phase 1 (Resume Shortlisting)
1. Install `pdf-parse` for text extraction (or rely on Gemini Vision if applicable, but text extraction is safer for docs).
2. Create `app/(root)/resume-shortlist/page.tsx`.
3. Create Server Action `lib/actions/resume.action.ts` for processing.
