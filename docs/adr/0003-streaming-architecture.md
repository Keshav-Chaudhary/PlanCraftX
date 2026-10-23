# ADR 0003: GenAI Streaming Architecture & Atomic Validation

## Status

Accepted

## Context

Streaming AI outputs improves perceived responsiveness and user engagement. However, treating partial chunks of structured JSON as valid state can cause DOM parsing crashes, layout shifts, schema violations, or screen-reader announcement spam.

## Decision

We enforce a split streaming architecture tailored to each domain requirement:

1. **Personalized Ideas (`/api/ideas`)**:
   - Streamed using Newline-Delimited JSON (NDJSON), outputting exactly one discrete idea JSON object per line.
   - The client buffers incoming byte chunks until a complete newline delimiter (`\n`) is encountered.
   - Each completed line is independently parsed and validated against the Zod `IdeaItemSchema`.
   - Valid idea objects are appended to the UI immediately.
   - Incomplete lines or malformed lines are never rendered as ideas; errors are logged and counted.
   - A final summary event line confirms the total idea count and completion.

2. **Budget Allocations, Timelines & Vendor Checklists**:
   - Non-streaming structured server requests.
   - Complete responses are generated with Gemini response schema, received in full on the server, Zod-validated, normalized by domain logic (e.g. largest-remainder budget normalization), and returned atomically.
   - UI presents a clear, accessible loading indicator and polite status message during generation.

3. **Context-Aware Chat (`/api/chat`)**:
   - Plain-text streaming only.
   - Received chunks are rendered progressively as plain text (no markdown HTML evaluation via dangerouslySetInnerHTML).
   - Assistive technology updates: per-token announcements are suppressed; completion is announced once via an `aria-live="polite"` region.

## Consequences

- Guaranteed zero invalid intermediate states in the UI.
- Screen readers receive coherent, non-spammy announcements.
- Full compliance with WCAG 2.2 criteria 4.1.3 (Status Messages).
