# English Interview Trainer

**A focused interview-practice product that helps English learners turn passive understanding into clear, job-relevant answers under pressure.**

[Try the live product](https://interview-speaking-sprint.luotianyudsg.chatgpt.site)

English Interview Trainer (EIT) is an independent AI product project. I led problem discovery, product positioning, competitive research, PRD and MVP definition, content design, user testing, feedback analysis, prioritization, UAT, AI feature design, and technical approach decisions. Implementation was completed through AI-assisted development using ChatGPT Work, Codex, and other AI agents; this repository is presented as a product portfolio, not as a claim that every line of code was written manually.

## Overview

Many English learners can understand written or spoken English, yet struggle to organize and produce an answer in a high-pressure job interview. General vocabulary apps do not address the short preparation window, the role-specific context, or the gap between recognizing an expression and using it aloud.

EIT is designed around a complete practice loop:

> **Learn → Practice → Test → Diagnose → Review → Retest**

The goal is not general English study. It is to help candidates prepare usable language, structure job-relevant answers, identify the most important weakness, and try again.

## Why I Built This

I built EIT while preparing for product and operations interviews in English. I was the first user: I could recognize many expressions, but recognition did not reliably turn into a structured spoken answer during interview practice.

That experience shaped the initial product hypothesis: for short-term interview preparation, a focused system combining role-relevant content, active recall, spaced review, and interview-style output could be more useful than a large general-purpose vocabulary list.

## Product Evolution

| Version | What changed | Why it changed |
| --- | --- | --- |
| **V0.1 — MVP** | Active-recall cards, interview expressions, answer structures, scenario questions, review, and TTS | Test whether a narrow interview-preparation product could close the gap between “I understand it” and “I can say it.” |
| **3-user usability test** | Observed first-time use and collected open feedback from three users | Repeated feedback exposed browser TTS compatibility issues and a stronger need for role-specific, natural, spoken content. |
| **V0.2 — Content and function iteration** | Redesigned the content into 25 core interview questions; strengthened role fit, evidence, follow-up questions, Chinese logic notes, and spoken signposts | Users found some answers too generic, too simple, or too written for real interviews. |
| **V0.2.1 — Visual refinement** | Improved presentation and mobile usability while preserving the learning model | Make the product easier to scan and use during short practice sessions. |
| **V0.3 — AI Text Mock Interview** | Added JD-based question generation, six-dimension evaluation, bilingual diagnosis, retry comparison, and a final summary | The earlier product supported learning and practice but lacked a test-and-diagnose loop. |
| **Local persistence** | Stored recent mock sessions, answers, feedback, retries, and summaries in versioned LocalStorage | Let users resume practice without adding accounts or a database before they were necessary. |
| **Bilingual AI feedback** | Chinese-first diagnosis with useful English terms, corrections, structure, and suggested answers | Make feedback easier to understand while keeping the practice output in English. |

## Key Features

- Active-recall learning from Chinese prompts to English output
- Spaced review and progress tracking
- Structured interview question and expression library
- Text-to-speech support for listening and shadowing practice
- JD-based mock interview with Company (optional), Position, and Job Description inputs
- Five tailored interview questions per mock session
- Six-dimension structured AI evaluation, scored 0–5 per dimension and 0–30 in total
- Bilingual diagnosis, focused improvement advice, language corrections, and a suggested answer
- Retry flow with a comparison of what improved and what is still missing
- Interview summary with strengths, weakest area, and recommended review topics
- Versioned LocalStorage persistence for the five most recent mock sessions
- Installable PWA with mobile support

## User Research and Iteration

The first usability round included **3 users**. Two of the three reported that TTS did not work in non-Safari browsers. Other feedback pointed to four product problems:

- Content needed to adapt more closely to the target role and interview context.
- Some sample answers felt too written or indirect for spoken interviews.
- Answers needed clearer auditory structure so an interviewer could follow them without subtitles.
- The product lacked a test, scoring, and feedback loop after learning.

These findings did not translate directly into a list of requested features. They were grouped into underlying problems and used to drive two iterations:

- **V0.2** redesigned the content around 25 core interview questions, more natural spoken answers, role fit, evidence, follow-up questions, and clear signposts.
- **V0.3** introduced the text mock interview to close the loop from practice to diagnosis and retesting.

The product principle behind this process was:

> **Listen to the user's problem, not necessarily the user's prescribed solution.**

For example, a request for “more templates” may signal that the current content is not specific enough. The product decision should address the underlying need rather than automatically adding more generic material.

## AI Mock Interview

```text
Company (optional) + Position (required) + JD (required)
                              ↓
                  5 tailored questions
                              ↓
                  User answers in English
                              ↓
                  Six-dimension evaluation
                              ↓
             Diagnosis + suggested improvement
                              ↓
                 Retry + attempt comparison
                              ↓
                      Final summary
```

The evaluator uses a transparent rubric rather than claiming model “accuracy”:

1. **Relevance** — answers the question and connects to the role or JD
2. **Structure** — presents an easy-to-follow spoken flow
3. **Evidence** — supports claims with specific examples
4. **Action & Result** — makes personal contribution and outcome clear
5. **Clarity** — is concise, understandable, and easy to follow without subtitles
6. **English** — uses natural, interview-appropriate English

Each dimension receives an integer score from **0 to 5**, for a total of **30**. The score is a structured coaching signal for the current response, not a prediction of interview success or an accuracy metric.

## Product Decisions and Trade-offs

### 1. Keep V0.1 deliberately small

Accounts, a database, community features, leaderboards, and payment were excluded from the MVP. The first question was whether focused content and active output were useful—not whether a complete learning platform could be built.

### 2. Validate the AI loop with text before voice

The first mock interview uses text instead of adding speech recognition immediately. This reduces cost and implementation complexity while testing the central value proposition: can tailored questions, diagnosis, and retry help users improve an interview answer?

### 3. Keep the DeepSeek key off the client

Calling the model directly from the browser would expose the API key. The product therefore routes model requests through a Tencent CloudBase Serverless Function, where `DEEPSEEK_API_KEY` is read from the runtime environment.

### 4. Treat infrastructure limits as a product constraint

The CloudBase free plan's 3-second timeout could not reliably complete an LLM request. After comparing timeout behavior, cost, and billing risk, I chose the lowest viable plan and configured an approximately 30-second request window. The current server-side model timeout is 25 seconds so the product can return a controlled error before the platform limit.

### 5. Use local persistence before accounts and a database

Mock-interview history is stored in versioned LocalStorage. This supports resuming and comparing practice sessions without introducing authentication, personal data collection, or backend storage before the need is validated.

## Architecture

```text
Web / PWA
   ↓
Tencent CloudBase Serverless Function
   ↓
DeepSeek API
   ↓
Validated structured JSON
   ↓
Frontend diagnosis, retry, and summary
```

This is a product-oriented technical solution: it protects the model credential, constrains inputs and outputs, and supports a reliable feedback flow without building unnecessary infrastructure.

## Validation

Only verified project evidence is reported here:

- **3** first-round test users
- **25** core interview questions after the content redesign
- **5** JD-tailored questions per mock interview
- **6** evaluation dimensions
- **20/20** local regression checks passed
- **1/1** mobile persistence test passed
- **1/1** real DeepSeek bilingual end-to-end test passed

These checks validate defined flows and implementation behavior. They are not claims about DAU, retention, satisfaction, interview outcomes, efficiency improvement, or model accuracy.

## Product Screens

The repository does not yet contain portfolio-ready screenshots, so no screenshots have been fabricated or substituted. The recommended capture set is:

1. Home page and learning loop
2. Active-recall learning page
3. JD-based mock interview setup and question
4. Six-dimension score and bilingual diagnosis
5. Retry comparison and final summary

Until those assets are added, the [live product](https://interview-speaking-sprint.luotianyudsg.chatgpt.site) is the best way to review the experience.

## Product, AI, and Implementation

| Area | My role / tools |
| --- | --- |
| **Product** | Problem definition, product positioning, competitive research, PRD, MVP scope, prioritization, content system, user testing, feedback analysis, UAT, and version planning |
| **AI product** | AI interview flow, prompt and rubric design, structured LLM evaluation, bilingual feedback, retry comparison, safety boundaries, and model/API trade-offs |
| **AI tools** | ChatGPT Work, Codex, and AI agents for research support, prototyping, implementation, debugging, and testing; DeepSeek API for the in-product evaluator |
| **Implementation** | Web/PWA, LocalStorage, Tencent CloudBase Serverless Function, environment-based secret handling, and Git |

Development was completed with **AI-assisted development using AI agents**. I owned the product decisions, acceptance criteria, testing, and iteration; I do not present this project as independently hand-written full-stack engineering.

## Run Locally

```bash
python3 -m http.server 4173 -d dist
```

Open `http://127.0.0.1:4173`. The learning experience works locally. The AI mock interview requires a separately deployed CloudBase function with `DEEPSEEK_API_KEY` configured as a server-side runtime environment variable.

Run the local unit and regression checks with Node.js 18 or later:

```bash
node --test tests/eitMockInterview.test.js tests/eitMockFrontend.test.js
```

The real bilingual end-to-end test is opt-in and must only be run in an authorized environment with the server-side API configuration available.

## Privacy and Security

- The DeepSeek API key is never stored in frontend code and must not be committed to Git.
- Local `.env` files, private research notes, and test artifacts are excluded from public commits.
- The server returns controlled error messages without provider response bodies or credentials.
- Mock interview history is stored in the user's browser; no account or application database is used in this version.
- JD and answer text are sent to the configured AI service to generate questions and feedback, as disclosed in the product UI.
