# JobTransit Follow-Up Question Machine — Integration & Architecture Guide

## 1. Overview & Purpose

The **Follow-up Question Machine** is an adaptive, rule-based career navigation module for JobTransit. Inspired by modern transit systems, JobTransit maps optimal routes and milestones for candidates navigating changing AI and software industry demands.

Because real-world CVs frequently contain gaps, ambiguous technical scopes, or unstated learning constraints, the Follow-up Question Machine identifies these missing checkpoints and presents targeted, low-friction questions (typically 4–6 questions per candidate) before issuing a verified **Career Transit Card**.

### Core Tenets
1. **Never Assume Negative Proficiency**: If a skill or project is absent from a CV, the engine never assumes the candidate lacks capability; it clarifies only when critical to recommendation accuracy.
2. **Strict Provenance Integrity**: Original CV evidence is never discarded or overwritten. Answers provided by the user receive provenance metadata (`user_confirmed`), while CV facts retain `cv` origin.
3. **Adaptive, Non-Linear Queue**: A candidate whose CV already provides clear direction (e.g. Profile B) skips redundant checkpoints and reaches review with fewer questions. Candidates making an ambitious tech transition (e.g. Profile C) are prompted to clarify learning capacity and openness.
4. **Backend-Enforced Validation**: Question eligibility, option IDs, single/multi-selection constraints, and completion criteria are validated on the backend before the session can be confirmed.

---

## 2. Shared Profile Contract (`CareerProfile`)

The shared profile contract is defined in `src/types/careerProfile.ts`. Both the mock harness and the upcoming CV extraction pipeline adhere to this schema.

### 2.1 TypeScript Schema

```typescript
export type InformationSource = 'cv' | 'user_confirmed' | 'derived'

export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'unknown'

export type ProfileFieldStatus =
  | 'known'
  | 'missing'
  | 'ambiguous'
  | 'confirmed'
  | 'unknown'

export interface SkillEvidence {
  description: string
  source: 'cv' | 'user_confirmed'
}

export interface CareerSkill {
  name: string
  evidence: SkillEvidence[]
  proficiency: SkillProficiency
  source: InformationSource
}

export interface EducationEntry {
  qualification?: string
  field?: string
  institution?: string
  year?: string | number
}

export interface ProjectEntry {
  name: string
  technologies?: string[]
  responsibilities?: string[]
  context?: string
}

export interface ExperienceEntry {
  title?: string
  company?: string
  responsibilities?: string[]
  duration?: string
}

export interface CareerPreferences {
  targetRoles: string[]
  workInterests: string[]
}

export interface LearningPreferences {
  hoursPerWeekRange: string | null
  timelineMonths: number | null
  timelinePreference: string | null
  willingnessToLearn: string | null
}

export interface CareerProfile {
  id?: string
  candidateName?: string
  skills: CareerSkill[]
  education: EducationEntry[]
  projects: ProjectEntry[]
  experience: ExperienceEntry[]
  certifications: string[]
  careerStage: string | null
  experienceContext?: string | null
  careerPreferences: CareerPreferences
  learningPreferences: LearningPreferences
  fieldStatuses?: Record<string, ProfileFieldStatus>
  updatedAt?: string
}
```

---

## 3. REST API Specification

All endpoints are hosted at `/api/follow-up/*`. The client API layer (`src/client/followUpApi.ts`) communicates via standard HTTP `fetch` and falls back cleanly to the shared TypeScript service (`src/server/sessionService.ts`) in isolated or offline environments.

### 3.1 Start Session
`POST /api/follow-up/start`

Initiates an adaptive question session from either a pre-configured mock profile or a structured initial profile payload from the CV extractor.

#### Request Body (Mock Profile)
```json
{
  "mockProfileId": "student_cs"
}
```

#### Request Body (CV Extractor Structured Profile)
```json
{
  "source": "cv_extractor",
  "initialProfile": {
    "candidateName": "Jordan Rivera",
    "careerStage": "student_or_recent_grad",
    "skills": [
      {
        "name": "Python",
        "proficiency": "intermediate",
        "source": "cv",
        "evidence": [{ "description": "Lab coursework in OOP and data analysis", "source": "cv" }]
      }
    ],
    "projects": [
      {
        "name": "Distributed File Synchronizer",
        "technologies": ["Go", "gRPC", "Docker"],
        "context": "Final semester capstone project"
      }
    ],
    "careerPreferences": {
      "targetRoles": [],
      "workInterests": []
    },
    "learningPreferences": {
      "hoursPerWeekRange": null,
      "timelineMonths": null,
      "timelinePreference": null,
      "willingnessToLearn": null
    }
  }
}
```

#### Response (`201 Created`)
```json
{
  "sessionId": "jt_1740000000_abc1234",
  "status": "in_progress",
  "currentQuestion": {
    "id": "target_roles",
    "fieldKey": "targetRoles",
    "prompt": "Which career areas would you like to explore?",
    "subtitle": "Select one or more destinations. You can always adjust your route later.",
    "selectionType": "multiple",
    "required": true,
    "options": [
      {
        "id": "ai_ml",
        "label": "AI / Machine Learning",
        "description": "Agentic AI, LLMs, computer vision, and predictive modeling",
        "badge": "High Trend"
      },
      {
        "id": "software_backend",
        "label": "Backend / Software Engineering",
        "description": "APIs, distributed systems, microservices, and databases"
      },
      {
        "id": "undecided",
        "label": "I'm still exploring",
        "description": "We'll suggest high-compatibility transit routes based on your skills"
      }
    ]
  },
  "progress": {
    "answered": 0,
    "totalAnswered": 0,
    "estimatedRemaining": 4,
    "currentStepIndex": 1,
    "totalKnownQuestions": 4,
    "isReviewReady": false,
    "isComplete": false
  },
  "profileSummary": { ... }
}
```

---

### 3.2 Get Next Question
`GET /api/follow-up/:sessionId/next`

Evaluates the current session state and returns the active question or signals review readiness.

#### Response (`200 OK`)
```json
{
  "sessionId": "jt_1740000000_abc1234",
  "status": "in_progress",
  "currentQuestion": {
    "id": "experience_context",
    "fieldKey": "experienceContext",
    "prompt": "Where have you applied your technical skills?",
    "selectionType": "single",
    "required": true,
    "options": [ ... ]
  },
  "progress": {
    "answered": 1,
    "totalAnswered": 1,
    "estimatedRemaining": 3,
    "currentStepIndex": 2,
    "totalKnownQuestions": 4,
    "isReviewReady": false,
    "isComplete": false
  },
  "isReviewReady": false
}
```

---

### 3.3 Submit Answer
`POST /api/follow-up/:sessionId/answer`

Submits selected option IDs for the active question. Validates single/multiple selection, option ID membership, and required constraints. Recalculates remaining eligible questions.

#### Request Body
```json
{
  "questionId": "target_roles",
  "selectedOptionIds": ["ai_ml", "software_backend"]
}
```

#### Optional Question Skip
```json
{
  "questionId": "career_timeline",
  "selectedOptionIds": [],
  "isSkipped": true
}
```

#### Response (`200 OK`)
```json
{
  "sessionId": "jt_1740000000_abc1234",
  "status": "in_progress",
  "currentQuestion": {
    "id": "work_preference",
    "fieldKey": "workInterests",
    "prompt": "What kind of technical work interests you most?",
    "selectionType": "multiple",
    "required": true,
    "options": [ ... ]
  },
  "progress": {
    "answered": 2,
    "totalAnswered": 2,
    "estimatedRemaining": 2,
    "currentStepIndex": 3,
    "totalKnownQuestions": 4,
    "isReviewReady": false,
    "isComplete": false
  },
  "updatedProfile": { ... },
  "isReviewReady": false
}
```

---

### 3.4 Get Profile Summary
`GET /api/follow-up/:sessionId/summary`

Returns the consolidated profile, field statuses, unresolved items, and user answers for review.

#### Response (`200 OK`)
```json
{
  "sessionId": "jt_1740000000_abc1234",
  "status": "review_ready",
  "profile": { ... },
  "fieldStatuses": {
    "careerStage": "known",
    "targetRoles": "confirmed",
    "experienceContext": "confirmed",
    "workInterests": "confirmed",
    "hoursPerWeekRange": "confirmed",
    "timelinePreference": "unknown"
  },
  "unresolvedFields": ["timelinePreference"],
  "isEligibleForCompletion": true,
  "answers": { ... }
}
```

---

### 3.5 Complete Session
`POST /api/follow-up/:sessionId/complete`

Validates that all required questions have been answered or explicitly handled according to policy. Marks the session `completed` and returns the final verified `CareerProfile`.

#### Response (`200 OK`)
```json
{
  "sessionId": "jt_1740000000_abc1234",
  "status": "completed",
  "completedAt": "2026-10-23T14:45:00.000Z",
  "finalProfile": {
    "id": "profile_student_cs",
    "candidateName": "Alex Chen",
    "careerStage": "student_or_recent_grad",
    "skills": [ ... ],
    "careerPreferences": {
      "targetRoles": ["software_backend"],
      "workInterests": ["build_software"]
    },
    "learningPreferences": {
      "hoursPerWeekRange": "hours_3_5",
      "timelineMonths": 6,
      "timelinePreference": "months_6",
      "willingnessToLearn": null
    },
    "fieldStatuses": { ... },
    "updatedAt": "2026-10-23T14:45:00.000Z"
  },
  "message": "Transit Card successfully validated and confirmed."
}
```

---

## 4. Question Bank Reference

| Question ID | Field Key | Prompt | Type | Required | Condition for Asking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `career_stage` | `careerStage` | *Which best describes your current situation?* | Single | Yes | Missing or ambiguous on CV |
| `target_roles` | `targetRoles` | *Which career areas would you like to explore?* | Multiple | Yes | Target roles missing or unclear |
| `experience_context` | `experienceContext` | *Where have you applied your technical skills?* | Single | Yes | Practical context ambiguous (e.g. lab vs production) |
| `work_preference` | `workInterests` | *What kind of technical work interests you most?* | Multiple | Yes | Technical work preference missing |
| `learning_openness` | `willingnessToLearn` | *How open are you to learning new technologies for your next role?* | Single | Conditional | Only when candidate is pivoting or making a major tech transition |
| `learning_hours` | `hoursPerWeekRange` | *How much time can you spend learning each week?* | Single | Yes | Weekly availability missing |
| `career_timeline` | `timelinePreference` | *When would you like to reach your next career milestone?* | Single | Optional (Skip allowed) | Milestone timeline missing |

---

## 5. Mock Profiles Test Harness

The module includes three built-in test profiles located in `src/data/mockProfiles.ts`:

### Profile A: Alex Chen — CS Student (`student_cs`)
* **Evidence**: Undergraduate in Computer Science; academic Python and SQL lab work; 1 academic term project.
* **Missing**: Target role, work preference, learning availability. Ambiguous applied experience context.
* **Adaptive Path**: Asks `target_roles`, `experience_context`, `work_preference`, `learning_hours`. Skips `career_stage` (known from CV).

### Profile B: Marcus Vance — Software Graduate (`software_grad`)
* **Evidence**: Documented React, Node.js, and TypeScript project portfolio. Clear preference for building backend/fullstack software.
* **Missing**: Learning availability and timeline.
* **Adaptive Path**: Skips `career_stage`, `target_roles`, `work_preference`, and `experience_context`. Only asks `learning_hours` and optional `career_timeline` (~1–2 questions).

### Profile C: Elena Rostova — Experienced Dev Exploring AI (`experienced_dev_ai`)
* **Evidence**: 3+ years production backend engineering (Python/FastAPI/PostgreSQL). Mentions interest in AI, but lacks verified production ML experience.
* **Missing**: Formal target confirmation, learning openness, weekly availability.
* **Adaptive Path**: Skips `career_stage` and `experience_context`. Asks `target_roles`, `learning_openness` (due to tech pivot), and `learning_hours`.

---

## 6. How the Future CV Extractor Integrates

When the CV extraction service is completed, integration requires zero rewrites to the Follow-up Question Machine:

1. **Map Extractor Output**: Map extracted entities (skills, education, projects, employment) into the `CareerProfile` structure.
2. **Start Session**: Call `POST /api/follow-up/start` with `{ "source": "cv_extractor", "initialProfile": mappedProfile }` (or invoke `followUpApi.startSession(...)`).
3. **Display Module**: Render `<FollowUpPage />` or route the user to `/follow-up?sessionId=...`.
4. **Consume Verified Output**: On session completion, the validated `finalProfile` is returned and forwarded to the downstream Career Transit Map generator and route-matching engine.

### Integration Code Snippet
```typescript
import { followUpApi } from '@/client/followUpApi'
import type { CareerProfile } from '@/types/careerProfile'

// 1. Transform raw extractor JSON into CareerProfile contract
function mapExtractorPayload(rawExtractorJson: any): Partial<CareerProfile> {
  return {
    candidateName: rawExtractorJson.full_name,
    careerStage: rawExtractorJson.inferred_stage || null,
    skills: (rawExtractorJson.detected_skills || []).map((skill: any) => ({
      name: skill.name,
      proficiency: skill.confidence > 0.8 ? 'intermediate' : 'unknown',
      source: 'cv',
      evidence: [
        {
          description: skill.raw_context_snippet || 'Extracted from resume',
          source: 'cv',
        },
      ],
    })),
    education: rawExtractorJson.education || [],
    projects: rawExtractorJson.projects || [],
    experience: rawExtractorJson.experience || [],
    careerPreferences: {
      targetRoles: rawExtractorJson.explicit_target_roles || [],
      workInterests: [],
    },
    learningPreferences: {
      hoursPerWeekRange: null,
      timelineMonths: null,
      timelinePreference: null,
      willingnessToLearn: null,
    },
  }
}

// 2. Launch follow-up session
export async function launchCandidateSession(rawCvData: any) {
  const initialProfile = mapExtractorPayload(rawCvData)
  const session = await followUpApi.startSession({
    source: 'cv_extractor',
    initialProfile,
  })
  return session
}
```

---

## 7. Storage Limitations & Production Notes

* **In-Memory Store**: Currently, sessions are maintained in `sessionStore.ts` in memory. This is optimal for development, automated testing, and stateless client sessions.
* **Production Persistence**: In a production multi-server environment, `sessionStore.ts` can be backed by Redis or Firebase / PostgreSQL by implementing the standard `getSession(id)`, `saveSession(s)`, and `deleteSession(id)` interface without altering the UI or question engine.
