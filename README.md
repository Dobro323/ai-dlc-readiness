# AI-DLC Readiness Assessor

Enterprise AI development readiness assessment tool built on the [AWS AI-DLC methodology](https://github.com/awslabs/aidlc-workflows).

**Live demo**: https://ai-dlc-readiness.vercel.app

---

## What it does

Describe your current development process → get a personalized AI-DLC transformation roadmap with:
- Readiness score (0–100) and maturity level
- Per-stage recommendations (skip / required / critical)
- Prioritized roadmap with timelines and expected velocity gains
- Public audit trail following AI-DLC spec

## Built with AI-DLC methodology

This project was built following the AWS AI-DLC (AI-Driven Development Lifecycle) workflow:

```
ai-dlc-readiness/
├── aidlc-docs/
│   ├── audit.md          ← full audit trail
│   └── aidlc-state.md    ← workflow state tracking
├── src/app/
│   ├── api/assess/       ← Anthropic API route
│   ├── page.js           ← main assessor UI
│   └── page.module.css
└── README.md
```

## Stack

- **Next.js 15** — frontend + API routes
- **Anthropic Claude API** — assessment engine
- **Vercel** — deployment (free tier)

## Local setup

```bash
git clone https://github.com/Dobro323/ai-dlc-readiness
cd ai-dlc-readiness
npm install
cp .env.local.example .env.local
# Add your ANTHROPIC_API_KEY
npm run dev
```

## Deploy to Vercel

```bash
npx vercel --prod
# Set ANTHROPIC_API_KEY in Vercel dashboard
```

## About AI-DLC

AI-DLC (AI-Driven Development Lifecycle) is an open-source methodology by AWS that reimagines software development for the AI era. Core principle: AI plans, humans validate, AI executes — with checkpoints at every stage.

→ [github.com/awslabs/aidlc-workflows](https://github.com/awslabs/aidlc-workflows)

---

Built by [Rich Alter](https://github.com/Dobro323)
