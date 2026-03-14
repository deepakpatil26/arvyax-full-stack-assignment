# ArvyaX Journal: System Architecture

This document outlines the design decisions, scalability strategy, and technical considerations for the AI-Assisted Journaling System.

## Tech Stack

- **Framework**: Next.js 15 (App Router) for a full-stack, serverless-ready architecture.
- **Database**: SQLite with Prisma ORM (Prototypes) / PostgreSQL (Production).
- **AI Engine**: Groq (Llama 3.3 70B) for low-latency, high-accuracy emotional analysis.
- **Animations**: Framer Motion for premium UX.

## 1. Scalability Strategy

To support 100,000+ users:

- **Database**: Migrate from SQLite to a managed **PostgreSQL** (e.g., Supabase or AWS RDS) with connection pooling (Prisma Accelerate).
- **API Layer**: Deploy on **Vercel** or **AWS Lambda**. Next.js API routes scale horizontally by default.
- **Caching Layer**: Use **Redis** via Upstash to cache LLM responses across different users for similar inputs (e.g., common phrases).
- **Background Tasks**: Offload heavy AI processing to background workers (e.g., Inngest or BullMQ) to keep the UI responsive.

## 2. LLM Cost & Latency Reduction

- **Semantic Caching**: Before calling the LLM, we check the database for existing analysis of that entry. If found, we skip the AI call.
- **Model Tiering**: Use Llama 3 70B for deep insights and 8B for simpler summary/keyword extraction to reduce token costs.
- **Token Optimization**: System prompts are highly compressed to reduce input tokens.

## 3. Data Protection & Security

- **Data at Rest**: Use encrypted database storage.
- **Input Sanitization**: All journal text is sanitized before being sent to the AI or stored in the database to prevent injection attacks.
- **Environment Safety**: API keys (Groq) are managed exclusively via server-side environment variables, never exposed to the frontend.

## 4. Future Enhancements

- **Multi-modal Input**: Support for voice recordings (Whisper API) alongside text.
- **Mood Trends**: Advanced time-series visualization of emotional health over months.
- **End-to-End Encryption**: User-side encryption for ultimate privacy in personal journaling.
