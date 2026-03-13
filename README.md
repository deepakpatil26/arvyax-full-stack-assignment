# ArvyaX AI-Assisted Journaling System

A full-stack prototype that allows users to create journal entries after nature sessions, analyze emotions using AI, and view mental state insights over time.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Database**: SQLite with Prisma
- **AI**: Groq (Llama 3)
- **Styling**: Vanilla CSS + Framer Motion

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file with:
   ```env
   DATABASE_URL="file:./dev.db"
   GROQ_API_KEY="your_groq_api_key_here"
   ```

3. **Database Initialization**:
   ```bash
   npx prisma db push
   ```

4. **Run Application**:
   ```bash
   npm run dev
   ```

## Features
- Nature session journal entries (Forest, Ocean, Mountain).
- Automated emotion analysis via Groq SDK.
- Insights dashboard with keyword matching and dominant emotion tracking.
- Fluid, premium UI-driven animations.
