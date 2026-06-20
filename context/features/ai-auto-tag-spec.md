# AI Auto-Tagging

## Overview

Add AI-powered tag suggestions for items using the OpenAI "gpt-5-nano" model. Users click a "Suggest Tags" button in the tags area, and the AI returns 3-5 freeform tag suggestions based on the item's title and content. Each suggestion has accept/reject controls. Pro-only feature with both UI-level and server-side gating. If this is the first AI feature implemented, it also establishes the OpenAI foundation (client, server action, rate limit config) for subsequent AI features.

## Requirements

- Create OpenAI client utility with `AI_MODEL` constant (if not already created by a prior AI feature)
- Use the standard openai SDK and keep it simple
- Create `generateAutoTags` server action with auth, Pro gating, Zod validation, rate limiting
- Add AI rate limit config (20 requests/hour per user) to existing rate limit utility (if not already added)
- Add "Suggest Tags" button (Sparkles icon, ghost variant) near the tags input in create item dialog and item drawer edit mode
- Display suggested tags as badges with accept (check) and reject (X) controls per tag
- Accepted tags get added to the item's tag list
- Tags are freeform (not limited to existing tags in the database)
- Truncate content to 2000 chars before API call
- Hide the Suggest Tags button for free users (Pro-only UI gating)
- Error handling via toast (Pro gating, rate limit, AI service errors)
- Follow existing patterns
- Unit tests for server action

## OpenAI SDK & gpt-5-nano gotchas

Use the **Responses API** (`client.responses.create()`). Per OpenAI's own docs, the Responses API is recommended for all new projects, and specifically for reasoning models — `gpt-5-nano` is a GPT-5-family reasoning model — "reasoning models perform better when used with the Responses API." It also gets meaningfully better cache utilization (40-80% in OpenAI's internal tests) than Chat Completions, which matters for cost. Chat Completions is not deprecated (OpenAI supports it indefinitely), it's just the legacy path — Responses API is the actively recommended one, especially here.

### Avoid the empty-content trap

GPT-5-family models spend tokens on internal reasoning before producing visible output. This applies to **both** APIs (not unique to Responses) — an overly restrictive output token cap lets reasoning consume the entire budget, leaving nothing for the actual answer, which looks like "empty content."

- Don't set a restrictive `max_output_tokens` — leave it unset or generous, and/or set `reasoning: { effort: "minimal" }` so less of the budget goes to invisible reasoning.

### Structured output

Use strict JSON-schema structured output via the Responses API's `text.format`:

```typescript
const response = await client.responses.create({
  model: 'gpt-5-nano',
  instructions: 'You are a developer tool assistant...',
  input: 'Suggest 3-5 tags for this snippet...',
  reasoning: { effort: 'minimal' },
  text: {
    format: {
      type: 'json_schema',
      name: 'tag_suggestions',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          tags: { type: 'array', items: { type: 'string' }, maxItems: 5 },
        },
        required: ['tags'],
        additionalProperties: false,
      },
    },
  },
});
const { tags } = JSON.parse(response.output_text);
```

- With `strict: true` + a defined schema, the response is guaranteed to be `{"tags": [...]}` — no need to handle a bare-array fallback.
- Always normalize tags to lowercase after receiving them.

## Notes

- `OPENAI_API_KEY` already in `.env`
- `isPro` is available server-side via session but not passed to create/edit UI components — use server-side gating for enforcement, UI gating for button visibility requires passing `isPro` as a prop or fetching it client-side
- See `docs/ai-integration-plan.md` for full architectural context