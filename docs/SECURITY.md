# Security Model

## Authentication

- **Provider**: Supabase Auth (email/password)
- **Session**: Managed via `AuthContext` with `onAuthStateChange` listener
- **Email confirmation**: Required (auto-confirm disabled)

## Authorization (RBAC)

Roles are stored in `user_roles` table (never on the user/profile table):

| Role | Permissions |
|------|------------|
| `user` | Browse public content, manage own watchlists and notes |
| `analyst` | Same as user (future: expanded analysis tools) |
| `admin` | Full access: source management, ingestion, clustering, settings, audit log |

### Role checking
- Database: `has_role(_user_id, _role)` — SECURITY DEFINER function that bypasses RLS
- Frontend: `useAuth()` hook exposes `isAdmin` boolean
- New users auto-assigned `user` role via `handle_new_user()` trigger

## Route Protection

| Route | Access |
|-------|--------|
| `/`, `/feed`, `/clusters/*`, `/regions/*`, `/countries/*`, `/actors`, `/narratives`, `/sources` | Public |
| `/watchlists` | Authenticated users |
| `/admin` | Admin role only |
| `/auth` | Public (redirects if already authenticated) |

## Row-Level Security (RLS)

All tables have RLS enabled. Policy patterns:

| Table | SELECT | INSERT/UPDATE/DELETE |
|-------|--------|---------------------|
| items, sources, event_clusters, actors, narratives, ingestion_jobs | Public (`true`) | Admin only |
| analyst_notes | Own notes + admin can view all | Own notes only |
| watchlists, watchlist_entities | Own only | Own only |
| admin_audit_log, system_settings | Admin only | Admin only |
| user_roles | Own role only | Admin only |

## Secret Management

All secrets are stored as Supabase secrets (encrypted at rest), never in code:
- `SUPABASE_SERVICE_ROLE_KEY` — used by edge functions
- `LOVABLE_API_KEY` — AI gateway access
- `NEWS_API_KEY`, `YOUTUBE_API_KEY`, `X_BEARER_TOKEN`, `TELEGRAM_BOT_TOKEN` — optional platform keys

## Edge Function Security

- Edge functions use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for system operations
- CORS headers allow all origins (appropriate for a public API)
- No user authentication required for edge function calls (they operate as system services)
