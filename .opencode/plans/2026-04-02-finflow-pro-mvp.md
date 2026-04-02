# FinFlow Pro MVP — Implementation Plan

**Date:** 2026-04-02
**Goal:** Implement complete Pro subscription system with 13 phases
**Architecture:** Next.js 14 App Router, Supabase, TypeScript, Tailwind CSS
**Tech Stack:** Recharts, Framer Motion, Lucide React, Supabase SSR

---

## User Decisions
- Calculator → Pro-gated, Market → stays free
- Build all at once (13 phases sequentially)

## Phase 1: Database Migration
**File:** `supabase_pro_migration.sql` (run in Supabase SQL Editor)
- Add `is_pro`, `streak_freeze_count`, `total_xp` to users
- Create 5 tables: subscriptions, friendships, friend_goals, streak_freezes, points_log
- Create leaderboard view
- Create reset_monthly_freezes() function
- RLS policies on all tables

## Phase 2: Core Pro Infrastructure
**Files to create:**
- `lib/hooks/useProStatus.ts` — hook checking subscription status
- `components/ProGate.tsx` — wrapper component for Pro-only content
- `components/UpgradeModal.tsx` — inline modal for locked features
- `components/ProBadge.tsx` — crown badge for Pro users
- `app/upgrade/page.tsx` — full upgrade page with Free vs Pro comparison

## Phase 3: Lessons System (43 lessons)
**Files to create/modify:**
- `lib/lessons.ts` — all 43 lessons with full content, quizzes, tracks, isPro flags
- `app/learn/page.tsx` — REWRITE: track-based layout, lock overlays, Pro badges, XP display
- `app/learn/[id]/page.tsx` — NEW: dynamic lesson page with Pro check, XP awards, badge animations

## Phase 4: Pro-Gate Calculator
**File to modify:**
- `app/calculator/page.tsx` — wrap content in `<ProGate>`

## Phase 5: Streak System
**Files to create:**
- `lib/streak.ts` — server-side streak logic with freeze support
- `components/StreakWidget.tsx` — 7-day visualization, freeze count, Pro/Free views

## Phase 6: Leaderboard Updates
**File to modify:**
- `app/leaderboard/page.tsx` — Free: top 10 + locked section + user rank; Pro: full + filters (Week/Month/All Time) + top 3 medals

## Phase 7: Advanced Analytics
**Files to create:**
- `app/analytics/page.tsx` — 5 Recharts charts (income vs expenses, spending by category, savings rate, income growth, spending trends), stats cards, goal timeline projector, biggest spending weeks

## Phase 8: CSV Export
**Files to create/modify:**
- `lib/exportCSV.ts` — CSV export utility
- `app/income/page.tsx` — add export button
- `app/expenses/page.tsx` — add export button
- `app/settings/page.tsx` — add export button

## Phase 9: Completion Certificate
**Files to create:**
- `lib/generateCertificate.ts` — PDF certificate generation via print window
- Certificate button on Learn page (appears at 43/43 completion)

## Phase 10: Friend System
**Files to create:**
- `lib/friends.ts` — sendFriendRequest, acceptFriendRequest, getFriends, challengeFriendToGoal
- `app/friends/page.tsx` — friend requests, pending, accepted, challenge buttons

## Phase 11: Tax Calculator
**Files to create:**
- `app/tax-calculator/page.tsx` — US/UK/Israel/Other country support, income types, results with disclaimers

## Phase 12: UI Updates
**Files to modify:**
- `components/BottomNav.tsx` — Pro-aware navigation (Free: Home|Income|Spend|Goals|Learn|Settings; Pro: Home|Income|Goals|Learn|More)
- `components/Sidebar.tsx` — add Pro badge, Analytics, Friends, Tax Calculator links
- `app/dashboard/page.tsx` — Pro badge near name, StreakWidget, expiry banner
- `app/settings/page.tsx` — Pro status display

## Phase 13: Admin & Environment
**Files to create/modify:**
- `app/admin/activate-pro/page.tsx` — password-protected Pro activation (testing only)
- `.env.example` — add STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, ADMIN_PASSWORD

## Deliverables Checklist (28 new files, 12 modified)
- [ ] supabase_pro_migration.sql
- [ ] lib/hooks/useProStatus.ts
- [ ] components/ProGate.tsx
- [ ] components/UpgradeModal.tsx
- [ ] components/ProBadge.tsx
- [ ] app/upgrade/page.tsx
- [ ] lib/lessons.ts
- [ ] app/learn/page.tsx (modified)
- [ ] app/learn/[id]/page.tsx
- [ ] app/calculator/page.tsx (modified)
- [ ] lib/streak.ts
- [ ] components/StreakWidget.tsx
- [ ] app/leaderboard/page.tsx (modified)
- [ ] app/analytics/page.tsx
- [ ] lib/exportCSV.ts
- [ ] app/income/page.tsx (modified)
- [ ] app/expenses/page.tsx (modified)
- [ ] app/settings/page.tsx (modified)
- [ ] lib/generateCertificate.ts
- [ ] lib/friends.ts
- [ ] app/friends/page.tsx
- [ ] app/tax-calculator/page.tsx
- [ ] components/BottomNav.tsx (modified)
- [ ] components/Sidebar.tsx (modified)
- [ ] app/dashboard/page.tsx (modified)
- [ ] app/admin/activate-pro/page.tsx
- [ ] .env.example (modified)
