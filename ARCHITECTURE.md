# Architecture & Scaling

## Scaling to 100k Users
To scale this system effectively:
1. **Database Migration**: Move from SQLite to a managed PostgreSQL cluster (e.g., Supabase or AWS RDS) with read replicas.
2. **Caching Layer**: Implement Redis for the Insights API and session data to reduce database load.
3. **Queue System**: Process AI analysis asynchronously using a background worker (e.g., BullMQ) to ensure fast response times for the journal entry creation.
4. **Horizontal Scaling**: Deploy the Next.js app to a Vercel/Node cluster with a Load Balancer to handle concurrent requests.

## Reducing LLM Cost
1. **Result Caching**: The current prototype already implements result caching at the entry level. This prevents duplicate API calls for the same entry.
2. **Model Selection**: Use smaller, cheaper models (like Llama 3 8B or GPT-3.5) for simple sentiment tasks, reserving larger models (70B+) only for complex summaries.
3. **Batching**: Allow users to analyze a week's worth of entries in a single batch prompt rather than individual calls.

## Caching Repeated Analysis
As implemented in this prototype, every `JournalEntry` has a one-to-one relationship with `JournalAnalysis`. Before the system calls the Groq API, it checks if an analysis record already exists for the given `entryId`. If found, it returns the cached result immediately.

## Protecting Sensitive Data
1. **Encryption at Rest**: Ensure the database uses AES-256 encryption.
2. **Data Minimization**: Avoid sending PII (Personally Identifiable Information) to the LLM; only send the journal text.
3. **IAM Policies**: Use strict database access controls and rotate API keys frequently.
4. **End-to-End Encryption**: For maximum privacy, journal entries could be encrypted client-side, with only the user holding the decryption key.
