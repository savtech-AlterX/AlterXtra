---
name: context-transfer
description: Package the entire current conversation into a single copy-pasteable text block so the user can start a fresh chat and continue seamlessly with zero prior context. Use this whenever the user asks to "transfer context," "continue this in a new chat/thread/session," "summarize this conversation so I can paste it elsewhere," "hand this off," wants a "context dump," is about to hit a context/length limit and needs to move the conversation, or explicitly invokes /context-transfer or "Context Transfer." Trigger this even if they just say something like "give me something I can paste into a new conversation" or "I need to switch chats but don't want to lose where we are."
---

# Context Transfer

Your job here is narrow but high-stakes: read back over the *entire* current
conversation thread and compile everything a brand-new Claude session — with
absolutely no memory of this conversation — would need to pick up exactly
where this one left off, with nothing lost and nothing to re-derive.

Think of the reader of your output as a sharp colleague who is walking in
cold. They weren't in the room. They don't know what's already been tried,
what was decided and why, or what's half-finished. If you leave something
out because it seemed obvious "from context," it won't be obvious to them —
there is no context on the other side except what you write.

## Before writing anything

Reread the whole thread, not just the last few turns. Pay special attention
to things that are easy to lose in a summary:

- Decisions that were made *after* an earlier approach was rejected — the
  rejected approach and *why* it was rejected matters as much as the final
  choice, otherwise the new session may re-propose the same dead end.
- Exact names: file paths, function/variable names, branch names, ticket or
  PR numbers, URLs, API keys/env var *names* (never values/secrets),
  package versions, config values, error messages.
- Anything the user corrected you on. Corrections encode preferences and
  constraints that are easy to silently drop in a summary.
- The actual current state of things (what's committed, what's still only
  in a draft, what's untested) — not the state you'd expect if everything
  had gone smoothly.

## Output format

Your entire response must be **one single copy-pasteable text block and
nothing else** — no "Here's your summary:" before it, no "Let me know if
you want changes" after it. The user is going to select-all and paste this
directly into a new chat, so anything outside the block is noise they'd
have to manually strip out. Put the whole thing inside one fenced code
block (triple backticks) so it can be copied in one click.

Write it addressed to the new session, in second person, as if briefing it
directly — e.g. "You're picking up a conversation already in progress.
Here's everything you need." Open the block with a one-line framing
sentence like that before diving into the sections below.

Use exactly these five sections, in this order. Skip a section only if it
is truly empty (e.g. there are no open questions) — don't pad, but don't
compress either. Err toward granular: a bullet the new session doesn't need
costs a moment's read; a missing bullet costs a wrong guess or a repeated
question back to the user.

```
## 1. Goals, task & key decisions
What we're actually trying to accomplish, the concrete task(s) in flight,
and every meaningful decision made along the way with the reasoning behind
it — including approaches that were tried and abandoned, and why.

## 2. Progress
What's finished (and verified working, vs. finished-but-untested — say
which). What's in progress right now, including how far it got. What's
been discussed but not started at all.

## 3. Key files, links, names & details
Every file path touched or referenced, URLs, repo/branch/PR names, function
or variable names introduced or renamed, config keys, commands that were
run, specific numbers/figures that matter, and any other concrete detail
someone would otherwise have to go dig up again. Prefer a flat list over
prose here — it's meant to be scanned and grepped, not read as narrative.

## 4. Where we left off & next steps
The precise last thing that happened before this handoff, and what the
immediate next action is. If there was a plan for what comes after that,
include it in order.

## 5. Other details
Anything else that doesn't fit cleanly above but would matter to getting
this right: constraints, preferences the user stated, open questions,
things to watch out for, gotchas already discovered, tone/style
expectations, deadlines.
```

## A few things that matter more than they seem

**Never include secrets.** If credentials, tokens, or API keys came up,
reference that they exist and where they live (e.g. "the `.env.production`
file, not committed") — never paste the actual secret value into the
transfer block.

**Don't summarize away specificity.** "We fixed the auth bug" is useless to
the new session; "the login form was calling `/api/auth` instead of
`/api/v2/auth`, fixed in `src/auth/login.ts:42`, verified by re-running the
login flow manually" is what lets it continue without re-investigating.

**State matters more than narrative.** The new session doesn't need a
blow-by-blow story of how the conversation unfolded — it needs an accurate
snapshot of where things stand *right now*. If something was said early on
and later superseded, report only the current, correct state (but do
mention it if the earlier approach is likely to get re-suggested and
should be avoided).

**When in doubt, include it.** This is the one situation where being overly
thorough beats being terse — the cost of the new session re-asking the user
something they already said once is much higher than the cost of one extra
paragraph.
