# GeoLens Architecture

## Overview

GeoLens is an open-source geopolitical intelligence platform that ingests news from diverse sources, enriches items with AI-extracted metadata, clusters related events, and presents them through an analytical dashboard.

## System Diagram

```
Sources (RSS, APIs)
    │
    ▼
┌──────────────────┐
│  ingest-source   │  Edge Function — fetches & deduplicates
└────────┬─────────┘
         │ items table
         ▼
┌──────────────────┐
│   enrich-item    │  Edge Function — AI tagging, scoring, clustering
└────────┬─────────┘
         │ event_clusters, event_cluster_items
         ▼
┌──────────────────┐
│  cluster-admin   │  Edge Function — merge, split, regenerate summaries
└──────────────────┘
         │
         ▼
┌──────────────────┐
│   React Frontend │  Vite + Tailwind + shadcn/ui
└──────────────────┘
```

## Frontend Architecture

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui component library
- **State**: React Query for server state, React Context for auth & region
- **Routing**: React Router v6 with public/protected/admin route layers

### Key directories
| Path | Purpose |
|------|---------|
| `src/pages/` | Route-level page components |
| `src/components/layout/` | App shell, sidebar, search |
| `src/components/shared/` | Reusable cards, badges, indicators |
| `src/components/admin/` | Admin panel sub-views |
| `src/components/auth/` | ProtectedRoute, AdminRoute |
| `src/contexts/` | AuthContext, RegionContext |
| `src/hooks/` | useAuthGate, useMobile |
| `src/lib/` | Demo data, region definitions, source templates |

## Backend Architecture

All backend logic runs as **Supabase Edge Functions** (Deno runtime).

| Function | Status | Purpose |
|----------|--------|---------|
| `ingest-source` | ✅ Implemented | Fetch RSS/Atom feeds, deduplicate, insert items |
| `enrich-item` | ✅ Implemented | AI metadata extraction + multi-signal clustering |
| `cluster-admin` | ✅ Implemented | Merge, split, pin items, regenerate summaries |
| `generate-daily-brief` | 🔲 Placeholder | Daily intelligence briefing generation |

## Database

PostgreSQL via Supabase with Row-Level Security on all tables.

### Core tables
- `sources` — Source registry with RSS URLs, reliability scores, bias labels
- `items` — Ingested content with tags, scores, summaries
- `event_clusters` — Grouped events with significance/confidence scores
- `event_cluster_items` — Many-to-many link with relevance scores
- `actors` — Named entities (countries, orgs, leaders)
- `actor_relationships` — Relationships between actors
- `narratives` — Tracked narrative frames
- `item_narratives` — Items linked to narratives
- `ingestion_jobs` — Job tracking with retry/error logging
- `analyst_notes` — User-created notes on items/clusters/actors
- `watchlists` / `watchlist_entities` — User watchlists
- `user_roles` — RBAC (admin, analyst, user)
- `admin_audit_log` — Admin action tracking
- `system_settings` — Key-value config store

## Data Flow

1. **Ingestion**: `ingest-source` fetches RSS feed → parses items → deduplicates by `external_item_id` → inserts into `items` with status `pending`
2. **Enrichment**: `enrich-item` picks pending items → calls Lovable AI Gateway for entity extraction, tagging, scoring → updates item → assigns to best-matching cluster or creates new one
3. **Clustering**: Multi-signal scoring (actor 30%, country 20%, topic 20%, time 20%, region 10%) with 0.35 threshold
4. **Presentation**: React frontend queries Supabase directly via client SDK with RLS enforcement
5. **Admin ops**: `cluster-admin` handles merge/split/pin/regenerate with AI-powered summary regeneration

## Authentication & Authorization

- Supabase Auth with email/password
- `user_roles` table stores roles (admin, analyst, user)
- `has_role()` security definer function for RLS policies
- Frontend: public content browsing, auth required for watchlists/notes, admin required for /admin
