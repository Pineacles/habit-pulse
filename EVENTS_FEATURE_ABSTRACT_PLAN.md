# Events + Habits Feature (Abstract Plan)

## Goal Of This Document

Define the next product feature direction at a conceptual level (no implementation details), so it can be built later with clear intent and consistent naming.

This plan assumes we adopt **Option A**:
- Rename the current "All Goals" concept to **Habits**
- Add a dedicated **Events** area
- Extend calendar with view filters (**Habits / Events / All**)
- Keep future Google/Outlook calendar sync out of scope for now, but design with it in mind

---

## Product Vision

HabitPulse should become a combined:
- **Habit tracking system** (recurring behavior, progress ratio, streak-oriented)
- **Personal calendar system** (one-time events/milestones, date/time-oriented)

The user should be able to:
- Track recurring habits daily
- Add one-time events/milestones on specific dates
- See both dimensions from one calendar without visual overload

---

## Naming And Terminology

### Recommended Language

- **Habit** = recurring item (repeat by weekdays or interval)
- **Event** = one-time dated item (optionally timed)
- **Calendar** = visualization layer that can show habits, events, or both

### Navigation Labels

- `Today`
- `Habits` (renamed from "All Goals")
- `Events` (new page)
- `Calendar`
- `Settings`

### Why This Naming

- "Habit" matches product identity (HabitPulse)
- "Event" aligns with external calendar ecosystems (Google/Outlook terminology)
- Avoids ambiguity that "Goal" can mean both recurring and one-off

---

## Information Architecture

## 1) Today Page

Primary focus remains habit execution.

Add lightweight event awareness:
- Badge/indicator for event count (e.g., `2 events today`)
- Optional compact today's event preview

Do not turn Today into a full event management page.

## 2) Habits Page

Keep this page habit-only.

No full event list here. At most:
- Small badge indicator for upcoming events
- Quick link to Events page

Reason: avoid mixing two mental models in one management surface.

## 3) Events Page (New)

Dedicated event management page:
- List and calendar-aware event creation/editing
- Filtering/sorting for date relevance
- CRUD operations with clear date ownership

This is the operational "source of truth" for event editing.

## 4) Calendar Page

Acts as the unified visual layer with mode switching:
- **Habits** mode: current heatmap/progress visualization
- **Events** mode: event-focused day rendering
- **All** mode: compact combined signals

Day click should open one detail panel showing both dimensions.

---

## Calendar Experience Design

## View Filter Model

Add a top-level control:
- `Habits`
- `Events`
- `All`

### Habits Mode
- Keep current completion ratio and color intensity behavior
- Keep day cell counters (`completed/total`)

### Events Mode
- Show event presence and count per day
- Prefer readability over density
- Support quick understanding of "busy days"

### All Mode
- Keep habit color foundation
- Overlay a subtle event indicator (dot/count)
- Ensure accessibility and avoid visual clutter

---

## Day Detail Panel (On Date Click)

Single panel with structured sections:

1. **Events**
   - All events on selected date
   - Ordered by time (all-day first or last, decided in UX pass)

2. **Done Habits**

3. **Not Done Habits**

Panel header should summarize day context, e.g.:
- `3/5 habits completed`
- `2 events`

---

## Event Domain Definition (Abstract)

An Event should conceptually contain:
- Identity
- Ownership (user-bound)
- Title
- Date (required)
- Time (optional for v1; recommended to include soon)
- Notes/description (optional)
- Status (active/completed/cancelled as needed by UX)
- Metadata placeholders for future external sync

Important: Events should be a distinct domain from Habits, not a subtype of Habit.

---

## Scope Boundaries

## In Scope (for upcoming feature build)

- Rename Goal UI language to Habit where appropriate
- New Events page
- Calendar filter modes (Habits / Events / All)
- Event badge indicator on Today and/or Habits pages
- Unified day detail panel with Events + Habit states

## Out Of Scope (for now)

- Google Calendar integration
- Outlook integration
- Two-way sync conflict resolution
- Push events to external providers
- Notification/reminder engine

---

## External Calendar Readiness (Future-Proofing)

Even before integration is implemented, design events with future mapping in mind:
- External source marker (local/google/outlook/etc.)
- External ID support
- Last synced timestamp concept
- Ownership/sync boundaries

This avoids expensive redesign when integrations are added.

---

## UX Principles To Preserve

- Keep habit execution friction low
- Do not overload compact calendar cells
- Ensure mode filter state is obvious
- Preserve visual consistency with existing theme
- Maintain accessibility for keyboard and screen readers

---

## Rollout Strategy (Recommended)

Phase 1:
- Naming cleanup (Goals -> Habits in UI)
- Add Events page with basic event lifecycle

Phase 2:
- Calendar filter modes + day panel integration
- Badge indicators in Today/Habits

Phase 3:
- UX polish, density tuning, mobile refinement

Phase 4 (future):
- External calendar integration foundation

---

## Success Criteria

Feature is successful when users can:
- Distinguish habits from events instantly
- Add/manage events without entering habit screens
- Switch calendar context with one click
- Understand any selected day in one panel

And the product remains:
- Simple
- Readable
- Expandable for future integrations

---

## Open Product Decisions (To Finalize Before Build)

1. Should event time be included in v1 or date-only first?
2. In All mode, should event indicator be dot-only or count badge?
3. Should Events appear as read-only summary on Today, or expandable mini list?
4. Should completed events remain visible by default or be archived from main list?
5. Should habit completion ratio ever include events? (Recommendation: **No**)

