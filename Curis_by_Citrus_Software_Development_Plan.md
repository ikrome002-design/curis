# Curis by Citrus — Production Software Development Plan (v1.0)

**Product:** Curis by Citrus — Multi-Tenant Healthcare Operating System
**Owner:** Citrus Labs Limited
**Document type:** Production Software Development Plan (IDE-agent-executable implementation blueprint)
**Functional baseline:** `Curis_by_Citrus_Platform_Project_Scope.md` (the "Platform Scope")
**Technical baseline:** `Product Technical Details v.2..txt`
**Governing integration specifications:** `Wallet_by_Citrus_Platform_Project_Scope.md` (the "Wallet Spec"); `Refer_and_Earn_Project_Scope.md` (the "R&E Spec")
**Precedence rule:** Where anything in this plan conflicts with the Wallet Spec or the R&E Spec for the functionality those documents govern (Citrus-side money movement; referral attribution, qualification, reward, and payout), the Wallet Spec and R&E Spec prevail. Where this plan conflicts with the Platform Scope on Curis product behavior, the Platform Scope prevails. This plan adds implementation detail; it never weakens a scope rule.

---

## 0. How the Implementation Agent Must Use This Plan

This plan is written for an IDE-based AI coding agent (the "Agent") executing inside a repository. It is not advice. It is an ordered, gated execution program.

### 0.1 Operating Manifesto (binding on every task)

1. **Prove the Problem.** For every task the Agent starts, it must first state: what must be built; why; which Platform Scope section (or Wallet/R&E Spec section) requires it; what concrete failure occurs if omitted; and how completion will be verified. If the Agent cannot cite the requirement, it must stop and record the gap instead of inventing behavior.
2. **Root Cause Analysis.** Before changing existing behavior, the Agent must read the affected files, reproduce the defect (failing test or recorded request/response), identify the root cause as distinct from symptoms, and list affected files, functions, routes, tables, and workflows.
3. **Fix with Precision.** Every change addresses the proven root cause. Prohibited: broad rewrites without justification; styling fixes for logic defects; frontend fixes for backend authorization defects; temporary hacks; duplicated logic; silent `catch` blocks; commented-out code left behind.
4. **Test Thoroughly.** Every phase ships with unit, feature, API, authorization, tenant-isolation, and validation tests, plus component/browser tests where the phase touches UI. The phase's test commands must pass locally and in CI before the phase gate closes.
5. **Demonstrate Resolution.** Every phase gate requires recorded proof: test output, example API responses (success and denial), database state evidence (query output), tenant-isolation denial evidence, and edge-case evidence, stored under `docs/evidence/phase-<NN>/`.

### 0.2 Phase Gates

The roadmap (Section 27) is executed strictly in order. A phase is closed only when its Acceptance Criteria pass and evidence is committed. The Agent must never begin a later phase that depends on an unclosed gate. Cross-phase refactors require a written justification referencing the root cause.

### 0.3 Fixed Decisions (do not re-litigate)

| Decision | Value | Source |
| --- | --- | --- |
| Backend | Laravel 11.x, PHP 8.3 (≥ 8.2 required) | Technical baseline §1 |
| SPA auth | Laravel Sanctum (cookie-based SPA auth); no Passport (no OAuth2 server requirement in Curis; Curis is an OAuth *client* to Wallet) | Technical baseline §1; Wallet Spec |
| Frontend | Vue 3 + TypeScript + Vite + Pinia + Vue Router | Technical baseline §1/§9 |
| Styling | Tailwind CSS (v4), CSS custom-property theme tokens | Technical baseline §1 |
| Database | PostgreSQL 16 | Technical baseline §1 |
| Cache/queues | Redis 7; Redis-backed Laravel queues (Horizon) | Technical baseline §1 |
| Storage | S3-compatible object storage (production: managed S3-compatible; local: MinIO) | Technical baseline §1 |
| Search | Meilisearch (tenant-filtered indexes) | Technical baseline §1 |
| Deployment | Docker images, GitHub Actions CI/CD | Technical baseline §1/§20 |
| Tenancy | Single database, row-level tenancy (`tenant_id` on every tenant-owned row) with ORM global scopes + policy checks | Platform Scope §8–9 |
| Public identifiers | ULIDs on every externally visible record; internal `bigint` PKs never exposed | Platform Scope §8.2 |
| Staff auth | Passwordless magic link (email) | Platform Scope §11.1 |
| Patient auth | Passwordless magic link + OTP + device trust + adaptive reauth | Platform Scope §11.2 |
| Money movement | Citrus-side money movement exclusively via Wallet by Citrus; Curis registers no payment-provider callbacks | Wallet Spec (governing) |
| Referral logic | Attribution/qualification/reward/payout exclusively in Refer & Earn; Curis emits signed events only | R&E Spec (governing) |
| Launch market | Kenya; KES; Africa/Nairobi; English | Platform Scope §38 |

### 0.4 Repository Layout (single monorepo)

```text
curis/
├── app/                        # Laravel application (modular monolith)
├── bootstrap/ config/ database/ routes/ storage/ tests/
├── resources/
│   ├── js/                     # Vue 3 SPA (all portals, one build, role-shelled)
│   └── css/
├── docker/                     # Dockerfiles, entrypoints, nginx, supervisord
├── deploy/                     # compose files, k8s manifests (if used), runbooks
├── docs/
│   ├── adr/                    # Architecture Decision Records
│   ├── evidence/               # phase-gate evidence
│   └── runbooks/
├── .github/workflows/          # CI/CD
└── Makefile
```

---

## 1. Executive Architecture Summary

Curis by Citrus is a governed healthcare operating system connecting patient intake, triage, clinical consultation, prescriptions, diagnostics, pharmacy dispensing, health records, inventory, billing, payment validation, patient access, merchant oversight, and Curis platform billing in one role-separated, audit-defensible execution environment (Platform Scope §1, §6).

### 1.1 Architecture in one paragraph

A **Laravel 11 modular monolith** serves a **versioned REST API** (`/api/v1`) and one **Vue 3 + TypeScript SPA** built once and served across **role-scoped portal hostnames** (`reception.curis.ke`, `doctor.curis.ke`, `finance.curis.ke`, …, `curis.ke` for patients, `curis.citruslabs.limited` for the Super Administrator). Tenancy is **row-level in a single PostgreSQL 16 database**: every tenant-owned row carries `tenant_id`, enforced by (a) a `BelongsToTenant` ORM global scope, (b) policy-layer ownership checks, (c) composite indexes leading with `tenant_id`, and (d) CI tenant-isolation tests that block deployment on failure. All clinical and financial behavior is implemented as **explicit server-side state machines** (queue, triage, consultation, prescription, dispensing, laboratory, invoice, payment, credit note, admission, Curis billing period), so no workflow step can bypass a predecessor state. Clinical records and financial documents become **immutable at finalization/posting**, protected by application guards *and* PostgreSQL triggers. Financial truth is a **double-entry subledger** with additive-only corrections. Audit events are **append-only and hash-chained**. Integrations are **event-driven through a transactional outbox**: outbound signed events to Refer & Earn, inbound signed webhooks from Wallet by Citrus, with idempotency on both sides. Background work runs on **Redis queues (Horizon)** with tenant context serialized into every job. The system deploys as **Docker images through a GitHub Actions pipeline** with pre-deploy tests, safe migrations, health checks, and rollback.

### 1.2 Why a modular monolith (evidence-based decision)

- The Platform Scope demands cross-module transactional invariants (e.g., consultation closure atomically finalizes records, triggers billing, updates queues — §15.9) that are cheap inside one database transaction and expensive across services.
- A startup team must operate this; one deployable with strong module boundaries (`app/Domain/*`) keeps operational surface small while preserving later extraction seams.
- Failure if ignored: distributed sagas for invoice/receipt/ledger writes would introduce partial-failure states that Platform Scope §24.2 (balanced, immutable postings) prohibits.
- Recorded as `docs/adr/0001-modular-monolith.md`.

### 1.3 Core guarantees the architecture enforces by construction

1. No clinical artifact outside a valid patient/visit/branch/session context (state machines + policies).
2. No invoice without a valid trigger; no receipt without Finance-validated payment (system-derived billing engine).
3. No cross-tenant read/write/enumeration (scoping + policies + ULIDs + isolation tests).
4. No role privilege combination within one session (role-context sessions + conflict engine).
5. No silent edit of finalized records (immutability triggers + amendment workflows).
6. No Citrus-side money movement outside Wallet by Citrus (no provider SDKs in this codebase).
7. No referral reward logic in Curis (event emission only).
8. Every material action audit-logged, append-only, exportable.

---

## 2. Assumptions and Constraints

### 2.1 Assumptions (each must be revalidated at Phase 0; failures become blockers, not guesses)

| # | Assumption | Impact if false |
| --- | --- | --- |
| A1 | Launch market Kenya: KES currency, Africa/Nairobi time zone, English UI | Localization work pulled forward |
| A2 | Merchant facilities hold required licenses; Curis records but does not confer regulatory standing | Onboarding checklist content changes |
| A3 | Staff and patients have email and/or SMS-capable phones for passwordless auth | Auth fallback design required |
| A4 | Branch internet connectivity exists; offline-first clinical operation is out of MVP scope beyond Downtime Safeguard Mode | Scope change request required |
| A5 | Wallet by Citrus exposes product registry entry, sandbox, OAuth client credentials, webhook contract before Phase 24 | Phase 24 blocked; manual settlement evidence path still ships |
| A6 | Refer & Earn exposes product registry entry, signing keys, event schema versions, sandbox before Phase 25 | Phase 25 blocked; events queue in outbox until available |
| A7 | eTIMS field-level technical specification is available for the eTIMS-ready invoice structure | Fields modeled from published KRA guidance; flagged for verification |
| A8 | First launch merchants require Admissions, Ward Management, and the five specialist departments (launch-core per Platform Scope §41) | Phases 22–23 can be re-sequenced later, never skipped |
| A9 | Kenyan Data Protection Act, 2019 governs personal-data handling | Privacy controls (Section 24) support merchant compliance |
| A10 | Transactional email + SMS providers with production sender identities are procurable | Notification phase blocked on provider credentials |

### 2.2 Hard constraints

1. Patient and third-party payments to facilities are **off-platform**; Curis records declarations and validates them, and never holds patient funds (Platform Scope §7.1).
2. Curis platform-fee money movement (onboarding fees, settlements, Curis-fee refunds) goes **only** through Wallet by Citrus rails; this codebase must contain **zero** payment-provider SDKs, credentials, or callback endpoints (Wallet Spec, governing).
3. Referrer rewards are calculated and paid **only** by Refer & Earn; this codebase contains no reward math (R&E Spec, governing).
4. AI assistance is bounded per Platform Scope §31: drafting/structuring only, visibly marked, human-finalized, never autonomous.
5. No jQuery anywhere. No frontend-enforced security. No sequential IDs in any API response.
6. All 44 Platform Scope sections are in scope for launch (MVP Lite includes Admissions and specialist departments per Platform Scope §41).

---

## 3. Non-Negotiable Security Rules

These rules bind every phase. The Agent must treat any violation found in code review or testing as a release-blocking defect.

1. **No jQuery.** CI greps `package.json`, lockfiles, and bundles for `jquery`; the build fails if found.
2. **Frontend checks are UX only.** Every privileged decision is re-made server-side (policy/gate/middleware). Tests must prove denial with the UI bypassed (raw HTTP).
3. **No cross-tenant leakage.** Every tenant-owned Eloquent model uses `BelongsToTenant`. Every policy verifies ownership. CI runs the tenant-isolation suite (Section 25.6); a red suite blocks deploy.
4. **No skipped authorization.** Every route is covered by `auth` middleware plus a policy/gate assertion test. A route-coverage test (Section 25.4) fails CI if any `/api/v1` route lacks an authorization test.
5. **No hardcoded secrets.** Secrets live in environment variables/secret manager. `gitleaks` runs in CI; findings block merge.
6. **No sensitive data in logs.** Log processors redact tokens, magic-link URLs, OTPs, cookies, `Authorization` headers, patient identifiers in free text. A unit test asserts redaction.
7. **No device detection for layout.** Responsive behavior is CSS media queries on viewport width only (Section 13).
8. **Never disable browser zoom.** `viewport` meta must not contain `user-scalable=no` or `maximum-scale`. Lint check in CI.
9. **No fixed layouts that break on mobile.** Layout components use fluid containers; Section 13 breakpoints are mandatory.
10. **No shipping without validation, rate limiting, and secure authentication.** Every mutating endpoint has a FormRequest; every public and authenticated route group has a named throttle; auth flows follow Sections 9.
11. **Accessibility is enforced** per Section 15; axe checks run in component CI for core screens.
12. **CSS is presentation only.** State transitions are driven by backend state or JS logic, never `:checked`-style CSS hacks for business behavior.
13. **JavaScript is never a substitute for backend authorization.**
14. **Immutability is enforced in the database.** Finalized clinical records, issued invoices, receipts, journal entries, audit events, and dispensing records have PostgreSQL `BEFORE UPDATE/DELETE` triggers raising exceptions, in addition to application guards.
15. **Idempotency for financial and clinical events.** All financially material creates accept/require idempotency keys; duplicate submission returns the original result; same key + different payload → `409 IDEMPOTENCY_CONFLICT`.
16. **Separation of duties is technically enforced.** The role-conflict engine (Section 10.5) blocks prohibited assignments at write time and at session time; Finance cannot validate a payment they declared; Audit is read-only at the policy layer.
17. **Patient-identifiable data never leaves the tenant boundary** in integration payloads: R&E events carry merchant-level facts only; Wallet payloads carry settlement references only (Platform Scope §30.3).
18. **Uploads are scanned, validated, privately stored, and downloaded only via signed, tenant-authorized URLs** (Section 19).
19. **Break-glass access requires reason + reauth + time-box + audit + notification** (Platform Scope §36.2); unlogged emergency access is prohibited and technically impossible (no alternate path).
20. **Webhook and event signatures are always verified** (HMAC/asymmetric, timestamp, replay window) before any state change; signature failure is logged as a security event and alerts.
21. **HTTPS everywhere in production**; HSTS enabled; secure, HttpOnly, SameSite cookies; CSRF protection on all browser flows.
22. **Strict CORS**: allowlist of Curis portal origins only; credentials mode only for those origins.
23. **Mass assignment protection**: every model declares `$fillable`; `$guarded = []` is banned by static analysis rule.
24. **SQL injection prevention**: query builder/Eloquent bindings only; raw SQL requires bound parameters and code-review sign-off comment `/* raw-sql-reviewed */`.
25. **Dependency scanning** (`composer audit`, `npm audit`, Dependabot) runs in CI; critical vulnerabilities block release.

---

## 4. System Architecture

### 4.1 Component overview

```text
                          ┌─────────────────────────────────────────────┐
                          │                 Edge / CDN                  │
                          │  TLS termination, static assets, WAF rules  │
                          └───────────────┬─────────────────────────────┘
                                          │
     Portal hostnames                     ▼
  curis.ke (patients)          ┌─────────────────────┐
  reception.curis.ke           │   Nginx (container)  │
  triage.curis.ke              │  /        → SPA      │
  doctor.curis.ke      ─────▶  │  /api/*   → PHP-FPM  │
  pharmacy.curis.ke            │  /webhooks→ PHP-FPM  │
  lab.curis.ke  … etc          └─────────┬───────────┘
  curis.citruslabs.limited               │
                                          ▼
                    ┌──────────────────────────────────────────┐
                    │        Laravel 11 Modular Monolith        │
                    │                                          │
                    │  HTTP Kernel middleware pipeline          │
                    │   → PortalContext (hostname → portal)     │
                    │   → Sanctum auth (staff/patient guards)   │
                    │   → TenantContext / BranchContext         │
                    │   → RoleContext (one role per session)    │
                    │   → Policy authorization                  │
                    │                                          │
                    │  app/Domain modules:                      │
                    │   Tenancy, Identity, Patients, Scheduling,│
                    │   Triage, Consultation, Prescriptions,    │
                    │   Pharmacy, Laboratory, Inventory,        │
                    │   HealthRecords, Admissions, Specialist,  │
                    │   Billing, Ledger, PlatformBilling,       │
                    │   Audit, Notifications, Integrations,     │
                    │   Support, Search, Reporting              │
                    └───────┬──────────┬──────────┬────────────┘
                            │          │          │
              ┌─────────────▼──┐  ┌────▼─────┐ ┌──▼────────────┐
              │ PostgreSQL 16   │  │ Redis 7  │ │ S3-compatible │
              │ row-level       │  │ cache +  │ │ object store  │
              │ tenancy,        │  │ queues   │ │ tenant-       │
              │ triggers,       │  │ (Horizon)│ │ prefixed keys │
              │ subledger       │  └────┬─────┘ └───────────────┘
              └─────────────────┘       │
                                        ▼
                          ┌───────────────────────────┐
                          │  Queue workers (Horizon)   │
                          │  tenant-context middleware │
                          │  outbox dispatcher         │
                          └─────┬──────────────┬───────┘
                                │              │
                     signed events        signed webhooks
                                ▼              ▼
                   ┌────────────────┐  ┌────────────────────┐
                   │ Refer & Earn    │  │ Wallet by Citrus    │
                   │ (outbound only) │  │ (API out, webhook in)│
                   └────────────────┘  └────────────────────┘
                                        + Email/SMS providers
                                        + Meilisearch (tenant-filtered)
```

### 4.2 Request lifecycle (staff API request)

1. DNS resolves the portal hostname to the edge; TLS terminates; request reaches Nginx; `/api/v1/...` proxies to PHP-FPM.
2. `ResolvePortalContext` middleware maps hostname → portal definition (`doctor.curis.ke` → `physician` portal). Unknown hostnames → 404.
3. Sanctum authenticates the session cookie against the `staff` guard (patients use the `patient` guard on `curis.ke` only).
4. `EnsureActiveStaffContext` verifies, in order: tenant active → branch assignment active → role assignment active → role matches portal → staff account active (Platform Scope §11.1). Any failure → 403 with a generic message, specific reason logged.
5. `SetTenantContext` binds `TenantContext` (tenant_id, branch_id, role_context, user_id) into the container and the DB session (`SET app.tenant_id` for defense-in-depth checks).
6. Route model binding resolves ULIDs **within tenant scope** (`Model::where('ulid', $v)->firstOrFail()` under the global scope) — a foreign tenant's ULID yields 404, indistinguishable from nonexistent.
7. FormRequest validates input; policy authorizes (permission + ownership + workflow state); action executes inside a DB transaction; domain events are recorded; audit event appended; outbox rows written in the same transaction.
8. Response is a versioned JSON resource. Errors follow the structured envelope (Section 11.6).

### 4.3 State-machine engine

All governed workflows are implemented with a single lightweight state-machine convention:

- Each stateful model declares `STATES`, `TRANSITIONS` (map of `from → [allowed to]`), and transition guard classes.
- Transitions execute only through `TransitionService::transition($model, $to, $context)` which: validates the transition table, runs guards (authorization, workflow preconditions), persists inside a transaction, appends the audit event, and dispatches domain events.
- Direct state-column writes are prevented by a model observer that rejects `state` changes not flagged by `TransitionService`.
- Failure if omitted: workflow bypass (e.g., dispensing against a draft prescription) — explicitly prohibited by Platform Scope §16.1, §18.4.

### 4.4 Transactional outbox (integration reliability)

- Every domain event with an external consumer (R&E events, notification fan-out, search indexing, Wallet-related internal updates) is written to `outbox_messages` in the **same transaction** as the business change.
- A Horizon-supervised dispatcher relays outbox rows to queue jobs with exponential backoff (1m, 5m, 30m, 2h, 12h caps), dead-letter state after exhaustion, alerting, and manual replay preserving original event IDs (R&E Spec retry contract).
- Guarantees: no business change without its event; no event without its business change; at-least-once delivery with consumer idempotency.

### 4.5 Environments

| Environment | Purpose | Data |
| --- | --- | --- |
| `local` | Docker Compose developer environment (MinIO, Mailpit, Meilisearch, Redis, Postgres) | Seeded synthetic data only |
| `testing` | CI | Ephemeral |
| `staging` | Pre-production, Wallet/R&E sandbox credentials | Synthetic; never production PHI |
| `production` | Live | Real data; access-controlled |

Separate Wallet and R&E credentials per environment (Wallet Spec: per-application credentials; compromise of one environment must not grant another).

---

## 5. Backend Architecture

### 5.1 Module layout (modular monolith)

```text
app/
├── Domain/
│   ├── Tenancy/          # tenants, branches, activation checklist, department enablement
│   │   ├── Models/  Actions/  Policies/  StateMachines/  Events/  Http/
│   ├── Identity/         # staff users, HR lifecycle, roles, permissions, conflict engine,
│   │                     # magic links, sessions, devices, break-glass
│   ├── Patients/         # patients, identifiers, contacts, consents, duplicates & merge,
│   │                     # patient auth (magic link + OTP + device trust)
│   ├── Scheduling/       # appointments, visits, check-in, queues
│   ├── Triage/           # triage sessions, vitals, priority
│   ├── Consultation/     # consultation sessions, notes, diagnoses, treatment plans,
│   │                     # closure verification, amendments
│   ├── Prescriptions/    # prescriptions, items, copy/refill requests
│   ├── Pharmacy/         # dispensing, substitutions, returns
│   ├── Laboratory/       # catalogue, orders, specimens, results, release
│   ├── Inventory/        # items, batches, stock movements, write-offs, reconciliation
│   ├── HealthRecords/    # health reports, external records, provenance, delivery
│   ├── Admissions/       # admissions, wards, beds, charge events, discharge
│   ├── Specialist/       # optician, mental health, nutrition, MCH, dentistry sessions
│   ├── Catalog/          # services, products, pricing versions, discounts, tax classes
│   ├── Billing/          # invoices, payment declarations, validations, receipts,
│   │                     # credit notes, insurance/sponsor attribution
│   ├── Ledger/           # accounts, journal entries, period close, reconciliation snapshots
│   ├── PlatformBilling/  # Curis tiers, billing periods, fee accrual, Curis invoices,
│   │                     # settlements, transparency ledger
│   ├── Audit/            # append-only audit events, hash chain, exports
│   ├── Notifications/    # in-app/email/SMS, templates, preferences
│   ├── Integrations/
│   │   ├── Wallet/       # OAuth client, API client, webhook controller, settlement sync
│   │   ├── ReferEarn/    # signed event emitter, attribution capture, reconciliation API
│   │   └── Outbox/       # outbox table, dispatcher, replay tooling
│   ├── Support/          # HR-initiated support requests, FAQ content
│   ├── Search/           # Meilisearch indexing, tenant-filtered queries
│   └── Reporting/        # role-authorized reports, exports, dashboards
├── Http/
│   ├── Middleware/       # cross-cutting middleware (portal, tenant, role, throttle, idempotency)
│   └── Controllers/      # thin; delegate to Domain actions
└── Support/              # shared kernel: Ulid, Money, StateMachine, AuditRecorder,
                          # IdempotencyStore, SignedWebhookVerifier, TenantContext
```

Rules: modules communicate through domain events and public action classes, never by reaching into another module's models for writes. `deptrac` (or `phpat`) enforces dependency direction in CI.

### 5.2 Key cross-cutting classes (must exist by end of Phase 8)

| Class | Responsibility |
| --- | --- |
| `Support\Tenancy\TenantContext` | Immutable value object: `tenantId`, `branchId`, `roleContext`, `userId`, `actorType`; bound per request/job |
| `Support\Tenancy\BelongsToTenant` (trait) | Global scope `where tenant_id = ctx`, auto-fill on create, write-guard rejecting cross-tenant FK references |
| `Support\Tenancy\TenantAwareJob` (middleware) | Serializes `TenantContext` into queued jobs; job fails hard if context missing for tenant-owned work |
| `Support\StateMachine\TransitionService` | Sole gateway for state transitions (Section 4.3) |
| `Support\Audit\AuditRecorder` | Appends hash-chained audit events inside the caller's transaction |
| `Support\Idempotency\IdempotencyStore` | Redis+Postgres-backed key store: scope (tenant, endpoint), request hash, response replay, conflict detection |
| `Support\Http\ApiError` | Structured error envelope factory (Section 11.6) |
| `Support\Money\Money` | Integer minor-units money type (KES cents); no float arithmetic anywhere (CI grep for `float` on money columns) |
| `Support\Webhooks\SignedWebhookVerifier` | HMAC/asymmetric verification, timestamp skew, replay window, per-application secret resolution |
| `Support\Signing\CitrusEventSigner` | R&E outbound signing: raw-body HMAC, `X-Citrus-*` headers per R&E contract |

### 5.3 Middleware pipeline (API)

```php
// bootstrap/app.php — api group (order matters)
ResolvePortalContext::class,          // hostname → portal definition
EnsureFrontendRequestsAreStateful::class, // Sanctum SPA
'auth:staff|patient',                 // guard chosen per portal
EnsureActiveStaffContext::class,      // staff portals only (8 ordered checks, Scope §11.1)
EnsureActivePatientContext::class,    // patient portal only
SetTenantContext::class,
EnforceRoleContext::class,            // session role must match portal; no URL-hopping
'throttle:api-standard',              // named limiter per route group
EnforceIdempotencyKey::class,         // mutating financial/clinical routes
SetAuditContext::class,               // actor/ip/ua/correlation-id
```

### 5.4 Domain actions pattern

Every use case is a single invokable action class with explicit dependencies, e.g. `App\Domain\Billing\Actions\ValidatePaymentDeclaration`:

```php
final class ValidatePaymentDeclaration
{
    public function __construct(
        private TransitionService $transitions,
        private ReceiptIssuer $receipts,
        private LedgerPoster $ledger,
        private AuditRecorder $audit,
    ) {}

    public function __invoke(PaymentDeclaration $declaration, ValidationDecision $decision, StaffUser $actor): PaymentValidation
    {
        return DB::transaction(function () use ($declaration, $decision, $actor) {
            $this->assertSeparationOfDuties($declaration, $actor);   // declarant ≠ validator
            $this->assertInvoiceBalance($declaration, $decision);     // no over-application without overpayment workflow
            $validation = $this->transitions->transition($declaration, $decision->approved ? 'validated' : 'rejected', ...);
            if ($decision->approved) {
                $receipt = $this->receipts->issueFor($validation);    // immutable receipt
                $this->ledger->postPaymentValidated($validation);     // balanced journal entry
            }
            $this->audit->record('payment.validated', ...);           // same transaction
            return $validation;
        });
    }
}
```

Controllers stay ≤ 15 lines: authorize → validate → delegate → respond with a Resource.

### 5.5 Scheduled tasks (Laravel Scheduler)

| Schedule | Job | Purpose |
| --- | --- | --- |
| every minute | `DispatchOutboxMessages` | Relay outbox (also event-triggered; this is the sweeper) |
| every 5 min | `ExpireStaleTokens` | Purge expired magic links/OTPs |
| every 15 min | `SyncWalletSettlementStatuses` | Poll Wallet for unresolved settlement states (webhooks primary) |
| hourly | `DetectStaleWorkflows` | Flag consultations/triage open past thresholds |
| daily 00:30 EAT | `GenerateDailyReconciliationSnapshots` | Per-branch snapshot (Scope §24.4) |
| daily 01:00 | `AccruePlatformFees` | Curis fee accrual for validated revenue (Scope §23) |
| daily 02:00 | `RunRetentionPolicies` | Archival + retention enforcement |
| daily 03:00 | `VerifyAuditHashChain` | Recompute and verify audit chain integrity; alert on mismatch |
| per-cycle | `ClosePlatformBillingPeriods` | Close weekly/14-day/monthly periods; issue Curis invoices |
| daily 04:00 | `ReconcileReferEarnFacts` | Serve/refresh R&E reconciliation dataset |
| weekly | `PruneOrphanedUploads` | Delete unattached uploads > 48h old (never finalized documents) |
| monthly | `EmitActivityQualificationDecisions` | Compute Curis active-use rule, emit `merchant_activity_qualification_decided` |

---

## 6. Frontend Architecture

### 6.1 One SPA, portal-shelled

A single Vue 3 + TypeScript application is built once and served on every portal hostname. At bootstrap, the app reads the injected portal context (server-rendered `<meta name="curis-portal" content="physician">`) and mounts the matching **portal shell**. Rationale: 20 account types (Platform Scope §10.1) with shared design system and API client; separate SPAs would multiply build/deploy surface 20×. Server-side authorization makes shared bundles safe: shipping a route's JS is not shipping its data.

```text
resources/js/
├── app.ts                      # bootstrap: portal detection, theme init, router, pinia
├── api/
│   ├── client.ts               # centralized Axios instance (CSRF, 401/419 handling, correlation-id)
│   ├── resources/              # typed API modules per domain (patients.ts, invoices.ts, …)
│   └── types/                  # OpenAPI-generated TS types (single source of truth)
├── design/                     # design-system components (Section 12)
│   ├── tokens.css              # CSS custom properties (light/dark)
│   └── components/             # CButton, CInput, CSelect, CTable, CModal, CToast, CCard,
│                               # CEmptyState, CBadge, CTabs, CQueueBoard, CStateTag …
├── layouts/
│   ├── PortalLayout.vue        # header, sidebar, content, profile menu
│   ├── AuthLayout.vue          # magic-link/OTP screens
│   └── PatientLayout.vue
├── portals/
│   ├── superadmin/  merchantadmin/  branch/  hr/  audit/  finance/
│   ├── frontoffice/ triage/  physician/  pharmacy/  laboratory/
│   ├── inventory/   healthrecords/  ward/  optician/  mindcare/
│   ├── nutrition/   mch/  dentistry/  patient/
│   │   └── (each: routes.ts, pages/, components/)
├── stores/                     # Pinia: session.store, tenant.store, queue.store,
│                               # notifications.store, theme.store, permissions.store
├── composables/                # useForm, usePagination, usePolling, useConfirm,
│                               # useReauth (step-up), useIdempotencyKey
└── router/
    ├── index.ts                # builds routes from active portal only
    └── guards.ts               # auth guard, permission-aware UX guard (never security)
```

### 6.2 State and data-flow rules

1. **Session store** holds the authenticated principal, active tenant/branch/role context, and permission list *as declared by the server* (`GET /api/v1/me`). The frontend never derives permissions itself.
2. **Permission-aware rendering**: `v-can="'payments.validate'"` directive hides/disables controls; a hidden control's endpoint still denies server-side — tests assert both.
3. **Forms** use `useForm<T>()`: typed payload, dirty tracking, submit lock (duplicate-submit prevention), 422 error mapping to fields, optimistic-lock (409) reload prompt.
4. **Polling over websockets for MVP**: queue boards and dashboards poll (`usePolling`, 5s visible / paused hidden). Rationale: fewer moving parts; Platform Scope requires ≤ 5s queue refresh which polling meets. ADR-0007 records the option to move to Laravel Reverb post-launch.
5. **Safe rendering**: all user content through interpolation; `v-html` is banned by ESLint rule except one audited `SafeHtml` component for sanitized report previews (DOMPurify, server-sanitized source).
6. **No secrets in frontend**: CI greps built assets for key patterns; `.env` frontend vars limited to `VITE_` public config.

### 6.3 Error/loading/empty/success states

Every data view implements the four states through a single `CAsyncBoundary` wrapper: loading skeletons, typed error panel (with correlation ID and retry), contextual empty state (with role-appropriate call to action), success content. Toasts (`CToast`) confirm mutations; destructive actions require `useConfirm` dialogs; sensitive actions route through `useReauth` (Section 9.6).

---

## 7. Database Architecture

### 7.1 Conventions (apply to every table)

- Engine: PostgreSQL 16. All schema changes via Laravel migrations; no manual DDL.
- Primary key: `id BIGINT GENERATED ALWAYS AS IDENTITY` (internal only).
- Public identifier: `ulid CHAR(26) NOT NULL UNIQUE` on every externally referenced table; ULIDs generated app-side (`Symfony\Uid`), indexed.
- Tenant ownership: `tenant_id BIGINT NOT NULL REFERENCES tenants(id)` on every tenant-owned table; branch attribution: `branch_id BIGINT REFERENCES branches(id)` on every branch-attributed table. Composite indexes lead with `tenant_id`.
- Money: `BIGINT` minor units + `currency CHAR(3) DEFAULT 'KES'`. Never `FLOAT`/`DOUBLE`; `NUMERIC(12,4)` only for tax rates and percentages.
- Timestamps: `TIMESTAMPTZ`, stored UTC. `created_at`/`updated_at` everywhere; domain timestamps explicit (`finalized_at`, `validated_at`).
- Soft deletes: **only** where recovery is a business requirement (drafts, catalog items, staff profiles). Finalized clinical and posted financial records: no soft delete, no hard delete — immutability triggers instead.
- Foreign keys: always declared; tenant-owned FKs verified same-tenant by the ORM write guard (and spot-checked by DB constraint triggers on the highest-risk tables: invoices, journal entries, dispensing).
- Retention: high-volume tables (`audit_events`, `stock_movements`, `queue_entries`, `notifications`, `outbox_messages`, `integration_events`) have partition-by-month strategy (native declarative partitioning) and documented archival jobs.

### 7.2 Table inventory (grouped; ~90 tables)

Full column DDL for governing tables follows in 7.3. Inventory:

| Group | Tables |
| --- | --- |
| Platform | `platform_settings`, `policy_versions`, `super_admins` |
| Tenancy | `tenants`, `tenant_activation_checklists`, `tenant_activation_items`, `branches`, `branch_settings`, `branch_departments` (enablement), `department_dependencies` |
| Identity (staff) | `staff_users`, `staff_profiles`, `professional_credentials`, `roles`, `permissions`, `permission_role`, `staff_role_assignments` (per-branch), `role_conflict_rules`, `staff_invitations`, `magic_link_tokens`, `staff_sessions`, `staff_devices`, `break_glass_grants` |
| Patients | `patients`, `patient_identifiers`, `patient_contacts`, `patient_consents`, `patient_tenant_links` (tenant-scoped clinical relationship), `trusted_devices`, `patient_otp_tokens`, `patient_sessions`, `duplicate_candidates`, `record_merges` |
| Scheduling | `appointments`, `visits`, `queue_entries` |
| Clinical | `triage_sessions`, `vital_signs`, `triage_notes`, `consultation_sessions`, `clinical_notes`, `diagnoses`, `treatment_plans`, `clinical_amendments`, `specialist_sessions`, `specialist_assessments` (typed JSONB per domain schema) |
| Prescriptions/Pharmacy | `prescriptions`, `prescription_items`, `medications`, `pharmacy_products`, `dispensing_records`, `dispensing_items`, `pharmacy_returns`, `prescription_requests` |
| Laboratory | `laboratory_services`, `laboratory_orders`, `laboratory_order_items`, `specimens`, `laboratory_results`, `laboratory_result_values`, `result_amendments` |
| Health records | `health_reports`, `health_report_versions`, `external_medical_records`, `report_requests`, `report_deliveries` |
| Admissions | `admissions`, `wards`, `beds`, `bed_assignments`, `admission_charge_events`, `discharge_records` |
| Catalog | `service_catalogue`, `product_catalogue`, `pricing_versions`, `pricing_version_lines`, `discounts`, `tax_classes`, `tax_rules` |
| Billing | `invoices`, `invoice_lines`, `billing_triggers` (typed event → invoice linkage), `payment_declarations`, `payment_validations`, `receipts`, `credit_notes`, `credit_note_lines`, `refunds`, `insurance_profiles`, `insurance_claim_records`, `sponsors`, `invoice_payer_splits` |
| Ledger | `ledger_accounts`, `journal_entries`, `journal_lines`, `financial_periods`, `reconciliation_snapshots` |
| Inventory | `inventory_items`, `batches`, `stock_movements`, `stock_reconciliations`, `write_off_approvals` |
| Platform billing | `billing_tiers`, `tier_versions`, `merchant_billing_configs`, `platform_billing_periods`, `platform_fee_accruals`, `curis_invoices`, `curis_invoice_lines`, `curis_settlements`, `settlement_evidence` |
| Audit/Sec | `audit_events` (partitioned, hash-chained), `security_events`, `fraud_risk_flags`, `audit_exports` |
| Notifications | `notifications`, `notification_templates`, `notification_deliveries`, `communication_preferences` |
| Integrations | `outbox_messages`, `integration_events` (inbound log), `idempotency_keys`, `webhook_endpoints_config`, `referral_attributions`, `refer_earn_event_log`, `wallet_api_log` |
| Support/Files | `support_requests`, `uploaded_files`, `file_scan_results` |
| Framework | `jobs`, `failed_jobs`, `job_batches`, `cache`, `sessions` (framework-managed) |

### 7.3 Governing table definitions (implement exactly; deviations require ADR)

#### `tenants`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | bigint identity | PK |
| `ulid` | char(26) | unique, indexed, public |
| `name` | varchar(160) | facility legal name |
| `slug` | varchar(80) | unique |
| `status` | varchar(24) | `pending_activation` → `active` → `suspended` → `terminated`; CHECK constraint |
| `billing_tier_id` | bigint FK `billing_tiers` | nullable until onboarding |
| `country_code` | char(2) | default `KE` |
| `timezone` | varchar(64) | default `Africa/Nairobi` |
| `legal_identity` | jsonb | registration no., tax IDs (encrypted-at-rest columns for tax IDs) |
| `activated_at`, `suspended_at` | timestamptz | lifecycle |
| `created_at`, `updated_at` | timestamptz | |

Indexes: `(status)`, `(ulid)`. Security: status transitions only via Super Administrator actions; every transition audit-logged. No soft delete (terminate is a state).

#### `staff_role_assignments`

| Column | Type | Notes |
| --- | --- | --- |
| `id`, `ulid` | | |
| `tenant_id` | bigint FK | tenant-owned |
| `staff_user_id` | bigint FK `staff_users` | |
| `branch_id` | bigint FK `branches` | assignment is per-branch |
| `role_id` | bigint FK `roles` | |
| `status` | varchar(16) | `active`, `suspended`, `revoked` |
| `assigned_by` | bigint FK `staff_users` | HR actor |
| `assigned_at`, `revoked_at` | timestamptz | |

Unique: `(tenant_id, staff_user_id, branch_id, role_id)` where status='active'. Index: `(tenant_id, staff_user_id, status)`. Security: writes only through HR actions; the role-conflict engine validates before insert (DB trigger re-checks the conflict matrix as defense-in-depth); every change audited.

#### `visits`

| Column | Type | Notes |
| --- | --- | --- |
| `id`, `ulid`, `tenant_id`, `branch_id` | | |
| `patient_id` | bigint FK `patients` | |
| `appointment_id` | bigint FK nullable | walk-ins have none |
| `state` | varchar(32) | queue/visit state machine (Scope §16.2); CHECK constraint |
| `visit_type` | varchar(24) | `outpatient`, `admission_linked` |
| `admission_id` | bigint FK nullable | |
| `checked_in_at`, `completed_at` | timestamptz | |

Indexes: `(tenant_id, branch_id, state)`, `(tenant_id, patient_id, created_at)`. Unique partial: one non-terminal visit per patient per branch (`(tenant_id, branch_id, patient_id) WHERE state NOT IN (terminal states)`) — enforces duplicate check-in prevention at the DB level.

#### `consultation_sessions`

| Column | Type | Notes |
| --- | --- | --- |
| `id`, `ulid`, `tenant_id`, `branch_id` | | |
| `visit_id` | bigint FK | required |
| `patient_id` | bigint FK | denormalized for query paths; consistency-checked |
| `physician_id` | bigint FK `staff_users` | |
| `state` | varchar(24) | `queued`,`in_consultation`,`closure_verification`,`finalized`,`escalated`,`admission_initiated`,`cancelled` |
| `started_at`, `finalized_at` | timestamptz | |
| `closure_checklist` | jsonb | verification outcomes at close |

Unique partials: one active consultation per physician (`(tenant_id, physician_id) WHERE state IN ('in_consultation','closure_verification')`); one active consultation per visit. Immutability: `BEFORE UPDATE` trigger rejects changes when `state='finalized'` except whitelisted amendment-linkage columns.

#### `invoices`

| Column | Type | Notes |
| --- | --- | --- |
| `id`, `ulid`, `tenant_id`, `branch_id` | | |
| `patient_id` | bigint FK nullable | admission/administrative invoices may attach to admission |
| `visit_id`, `admission_id` | bigint FK nullable | context |
| `billing_trigger_id` | bigint FK `billing_triggers` NOT NULL | **no invoice without a trigger** (Scope §17.1) |
| `state` | varchar(24) | `draft`,`issued`,`locked`,`payment_pending`,`partially_paid`,`paid`,`cancelled_before_payment` |
| `number` | varchar(32) | per-tenant sequential display number, unique `(tenant_id, number)` |
| `subtotal_minor`, `tax_minor`, `discount_minor`, `total_minor`, `balance_minor` | bigint | minor units |
| `currency` | char(3) | `KES` |
| `pricing_snapshot` | jsonb | frozen at issue: prices, pricing_version ids, tax treatment, discounts, trigger refs |
| `etims_metadata` | jsonb | eTIMS-ready fields; fiscal status placeholders |
| `issued_at`, `locked_at`, `paid_at` | timestamptz | |

Indexes: `(tenant_id, branch_id, state)`, `(tenant_id, patient_id)`, `(tenant_id, issued_at)`. Triggers: reject UPDATE of monetary columns and `pricing_snapshot` once `state != 'draft'`; reject DELETE always once issued. Correction path: credit notes only.

#### `journal_entries` / `journal_lines`

`journal_entries`: `id, ulid, tenant_id, branch_id, source_type, source_id, source_reference (unique per tenant), description, posted_at, financial_period_id, reversal_of_id (nullable FK self)`.
`journal_lines`: `id, journal_entry_id FK, ledger_account_id FK, debit_minor, credit_minor, currency`.
Constraints: per-entry balance enforced by deferred constraint trigger (`SUM(debit)=SUM(credit)`); lines immutable after insert (trigger); entries never deleted; corrections are new reversal entries referencing the original. Index: `(tenant_id, financial_period_id)`, `(source_type, source_id)`.

#### `audit_events` (partitioned monthly)

| Column | Type | Notes |
| --- | --- | --- |
| `id` | bigint identity | PK (with partition key) |
| `ulid` | char(26) | unique |
| `tenant_id` | bigint nullable | null = platform-level event |
| `branch_id` | bigint nullable | |
| `actor_type` | varchar(16) | `staff`,`patient`,`system`,`super_admin`,`integration` |
| `actor_id` | bigint nullable | |
| `role_context` | varchar(48) | |
| `action` | varchar(96) | dot-namespaced, e.g. `payment.validated` |
| `target_type`, `target_id` | varchar/bigint | polymorphic |
| `before`, `after` | jsonb nullable | only when safe and necessary; secrets never included |
| `ip`, `user_agent` | inet / varchar | where appropriate |
| `correlation_id` | uuid | request/job correlation |
| `prev_hash`, `hash` | char(64) | SHA-256 chain per tenant stream |
| `occurred_at` | timestamptz | |

Rules: INSERT-only (REVOKE UPDATE/DELETE from app role; trigger raises on attempts). Hash = SHA-256(prev_hash ‖ canonical JSON of event). Nightly `VerifyAuditHashChain` re-verifies; mismatch pages on-call.

#### `idempotency_keys`

`id, tenant_id nullable, scope (varchar: endpoint identifier), key (varchar 64), request_hash (char 64), response_status, response_body jsonb, locked_at, completed_at, expires_at`. Unique `(tenant_id, scope, key)`. Behavior: first request acquires row lock, processes, stores response; replay with same hash returns stored response; same key different hash → 409 `IDEMPOTENCY_CONFLICT`. TTL 72h (financial creates retained 30 days).

#### `outbox_messages`

`id, ulid (=event_id), tenant_id nullable, destination (varchar: 'refer_earn'|'notifications'|'search'|…), event_type, event_version, payload jsonb, headers jsonb, state ('pending','dispatched','confirmed','dead_letter'), attempts, next_attempt_at, last_error, created_at, dispatched_at`. Index `(state, next_attempt_at)`. Payload for `refer_earn` destination is the exact signed envelope body (merchant-level facts only; a schema validator rejects any payload containing patient fields).

#### `referral_attributions`

Exactly the R&E minimum local storage (R&E Spec §24.7): `id, tenant_id, referral_attribution_id (central), referral_code_snapshot, referrer_reference, referral_campaign_id, referral_campaign_version, attributed_at, attribution_status, central_confirmation_status, merchant_product_tenant_id, evidence jsonb (signed_link_claim, manual_code_claim, cookie_claim, timestamps)`. **Prohibited columns** (enforced by migration review): payout methods, referrer tax data, earnings balances, fraud evidence.

#### `curis_settlements`

`id, ulid, tenant_id, curis_invoice_id FK, method ('wallet','manual_evidence'), wallet_payment_reference (varchar, format CUR-PAY-<ULID>), wallet_state (mirrors Wallet collection states incl. UNKNOWN — never coerced to failed), amount_minor, currency, evidence_file_id FK nullable, declared_by nullable, validated_by_super_admin_at, state ('pending','wallet_confirmed','evidence_submitted','validated','rejected')`. Wallet webhook updates `wallet_state`; Super Administrator validation is the terminal authority (Platform Scope §23.4).

### 7.4 Migration policy

1. One migration per logical change; reversible `down()` where safe; irreversible migrations documented.
2. Zero-downtime rules: additive first (new nullable column → backfill job → NOT NULL constraint later); never drop/rename in the same deploy that stops writing.
3. Every migration adding a tenant-owned table must include `tenant_id` + leading composite index — enforced by a CI test that introspects schema and fails on violations (`tests/Architecture/TenantColumnTest.php`).
4. Immutability triggers ship in the same migration as their table.
5. Seeders: `RolesAndPermissionsSeeder` (versioned permission matrix), `RoleConflictRulesSeeder`, `LedgerChartSeeder`, `NotificationTemplatesSeeder`, `DemoTenantSeeder` (local/staging only, guarded by environment check).

---

## 8. Multi-Tenancy and Data Isolation Model

### 8.1 Tenant resolution

1. **Staff requests:** tenant comes from the authenticated staff user's active session context — never from a client-supplied header or URL. A staff session stores `(tenant_id, branch_id, role_assignment_id)` fixed at login/role-context selection.
2. **Patient requests:** the patient identity is platform-level; tenant scoping applies per resource (a patient sees only records in `patient_tenant_links` they own). Patient endpoints filter by `patient_id = session patient` AND the record's release state.
3. **Super Administrator:** platform-level guard, separate portal; reads tenant data only through governance endpoints that log every access and exclude patient-identifiable clinical payloads by projection (Platform Scope §8.2.14).
4. **Jobs:** tenant context is serialized into the job payload by `TenantAwareJob`; the job middleware rebinds `TenantContext` before handling. A tenant-owned model access without bound context throws `MissingTenantContextException` (fail-closed).
5. **Defense-in-depth:** `SetTenantContext` also executes `SET LOCAL app.tenant_id = :id`; the five highest-risk tables (invoices, journal_entries, dispensing_records, audit_events, health_reports) carry `CHECK`-style row triggers comparing `tenant_id` to `current_setting('app.tenant_id')` on write in production.

### 8.2 Enforcement matrix (implement and test every layer)

| Layer | Mechanism | Test that proves it |
| --- | --- | --- |
| ORM reads | `BelongsToTenant` global scope | `TenantScopeTest`: model query from tenant A context returns zero tenant-B rows |
| ORM writes | Creating observer sets `tenant_id`; write guard rejects cross-tenant FKs | `CrossTenantWriteTest`: attaching tenant-B patient to tenant-A visit throws |
| Route binding | ULID resolution inside scope → 404 for foreign ULIDs | `ForeignUlidTest`: GET tenant-B invoice ULID as tenant-A user → 404 |
| Policies | `$user->tenant_id === $model->tenant_id` in every policy `before()` | policy unit tests |
| Search | Meilisearch index rules force `tenant_id = ctx` filter server-side; tenant filter injected by backend, never client | `SearchIsolationTest` |
| Storage | Object keys `tenants/{tenant_ulid}/…`; signed URLs embed tenant claim verified at issue | `SignedUrlIsolationTest` |
| Cache | Keys prefixed `t:{tenant_id}:`; helper `TenantCache` is the only cache facade allowed for tenant data (Pint/PHPStan rule) | `CacheKeyTest` |
| Jobs | `TenantAwareJob` middleware | `JobContextTest`: job without context on tenant model → exception |
| Notifications | Notifiable resolution re-authorizes recipient against tenant + role before render | `NotificationScopeTest` |
| Exports | Export jobs receive tenant context; generated files stored under tenant prefix; download re-authorizes | `ExportScopeTest` |
| Webhooks/events | Envelope carries tenant/product context; outbound R&E schema validator blocks patient fields | `OutboxSchemaTest` |
| API enumeration | ULIDs only; sequential IDs never serialized (Resource layer omits `id`) | `NoSequentialIdTest` scans all Resources |

### 8.3 Denied-case catalog (all become automated tests in Phase 9)

1. Staff user of Tenant A GETs `/api/v1/patients/{ulid}` with a Tenant B patient ULID → **404**, audit `security.cross_tenant_probe` recorded.
2. Staff user with membership but no `payments.validate` permission POSTs `/api/v1/payment-declarations/{ulid}/validate` → **403** `PERMISSION_DENIED`.
3. Queued report job constructed without tenant context touching `invoices` → job fails with `MissingTenantContextException`; failed-job alert.
4. Export endpoint invoked by Branch user for another branch of the same tenant without cross-branch permission → **403** `BRANCH_SCOPE_DENIED`.
5. Valid Tenant B ULID passed in a POST body FK field (`patient_ulid`) by Tenant A front office → **422** validation error (`exists` rule is tenant-scoped), write guard as backstop.
6. Patient attempts to fetch another patient's receipt ULID → **404**.
7. Meilisearch query with a forged filter attempting `tenant_id != ctx` → server constructs filters; client filter input is whitelisted fields only → foreign rows never returned.
8. Super Administrator requests a tenant's patient list → endpoint does not exist on the platform portal; governance endpoints expose aggregates only → **404/403** with platform audit event.

### 8.4 External record sharing is not cross-tenant access

Patient-authorized external records (Platform Scope §8.3) enter through `external_medical_records` with provenance columns (`origin_facility`, `source`, `uploaded_at`, `provenance jsonb`, `label='externally_sourced'`, `merge_state`), visible only to authorized clinical/health-records roles of the receiving tenant, and merge only through the Health Records validation workflow — never a direct cross-tenant read.

---

## 9. Authentication Model

### 9.1 Guards and principals

| Guard | Principal | Portals | Mechanism |
| --- | --- | --- | --- |
| `staff` | `staff_users` | all merchant portals | Sanctum SPA cookie session after magic-link verification |
| `patient` | `patients` | `curis.ke` | Sanctum SPA cookie session after magic link **or** OTP |
| `super_admin` | `super_admins` | `curis.citruslabs.limited` | Magic link + mandatory TOTP second factor + IP allowlist (platform authority hardening) |

No password columns exist for staff or patients (passwordless by scope). Laravel's password-reset scaffolding is not installed for these guards. Custom auth logic is limited to token issuance/verification flows below, implemented on Laravel primitives (signed tokens, hashing, session guard) — justified because the Platform Scope mandates passwordless flows (§11.1–11.2), which first-party starter kits don't provide; ADR-0003 records this.

### 9.2 Staff magic-link flow

```text
POST /auth/staff/magic-link {email}            throttle: 5/min per IP, 3/min per email
 → always 202 (no account enumeration)
 → if eligible: create magic_link_tokens row
   { token_hash = SHA-256(random 64B), staff_user_id, portal, ip, expires_at = now()+10min, used_at = null }
 → queue MagicLinkMail (link: https://{portal-host}/auth/verify?token=…&signature=…)

GET /auth/verify?token=…
 → constant-time lookup by hash; reject if expired/used → generic error + security_events row
 → eligibility checks IN ORDER (Scope §11.1): department enabled → HR-created → email verified
   → staff active → active branch assignment → active role assignment → tenant active → branch active
 → single-use: used_at set atomically (UPDATE … WHERE used_at IS NULL returning row; race-safe)
 → session created (regenerate ID — session-fixation defense), device row upserted,
   new-device notification if fingerprint unseen
 → role-context selection: if exactly one active assignment matches portal → bind it;
   if multiple branches → branch picker; if none → 403
```

Session config: `SESSION_DRIVER=redis`, `SESSION_SECURE_COOKIE=true`, `SESSION_HTTP_ONLY=true`, `SESSION_SAME_SITE=lax`, absolute lifetime 12h, idle timeout 30min (activity-refreshed), sliding reauth for sensitive actions (Section 9.6).

### 9.3 Patient flow (magic link + OTP + device trust + adaptive reauth)

```text
POST /auth/patient/start {identifier: email|phone, channel_preference}
 → throttle 5/min IP, 3/min identifier; always 202
 → issue magic link (10 min) via email OR 6-digit OTP (5 min, hashed, max 5 attempts,
   resend throttle 60s exponential) via SMS/email per verified preference

POST /auth/patient/verify {otp | token}
 → verify; regenerate session; trusted_devices upsert (device fingerprint hash, label, last_seen)
 → risk engine inputs: new device, new geo/IP ASN, velocity, impossible travel
   → risk high ⇒ require second channel verification before session issue
 → login notification on new device (non-suppressible)
```

Access/refresh semantics: SPA cookie session (short-lived server session, rotating CSRF token); API tokens are not issued to browsers. Automatic logout after 30 min idle; bot protection (Turnstile/hCaptcha) on start endpoints after threshold; device revocation UI (Section 17).

### 9.4 Rate limiting (named limiters, configured in `AppServiceProvider`)

| Limiter | Rule |
| --- | --- |
| `auth-start` | 5/min per IP + 3/min per identifier + 50/day per identifier |
| `auth-verify` | 10/min per IP; OTP: 5 attempts per token then invalidate |
| `invitation-accept` | 5/min per IP |
| `api-standard` | 120/min per session |
| `api-heavy` (exports, reports) | 10/min per session |
| `api-financial` (declare/validate) | 30/min per session |
| `webhooks-wallet` | 300/min per source, signature-gated before processing |
| `patient-portal` | 60/min per session |

### 9.5 Session and device management

`staff_sessions` / `patient_sessions` project active Sanctum sessions for visibility (device, IP, last activity); users can revoke sessions/devices; revocation deletes the Redis session key immediately. Suspicious-login monitoring writes `security_events` and notifies (new device, geo anomaly, repeated failures).

### 9.6 Step-up reauthentication (sensitive actions)

Sensitive actions require a fresh verification ≤ 5 minutes old: payment validation, credit-note approval, price-version publication, staff deactivation, break-glass, period close/reopen, settlement validation, record merges (staff); report/record downloads, external sharing, prescription/report requests, contact changes, device removal (patients) — per Platform Scope §11.2/§11.3. Implementation: `ReauthRequired` middleware checks `session('reauth_verified_at')`; the SPA `useReauth` composable triggers a magic-link/OTP mini-flow; the API returns `403 REAUTH_REQUIRED` and the UI resolves it inline.

### 9.7 CSRF, cookies, headers

Sanctum SPA mode with `/sanctum/csrf-cookie`; `XSRF-TOKEN` double-submit; strict `SESSION_DOMAIN` per portal cluster (`.curis.ke` for merchant/patient portals; the Super Admin portal uses its own domain and session cookie — no shared cookie across authority boundaries). Security headers set at Nginx: HSTS (2y, preload), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, CSP (default-src 'self'; connect-src API origin; no inline scripts — Vite nonce-based).

---

## 10. Authorization, Roles, and Permissions Model

### 10.1 Model

Spatie Laravel Permission is used **with tenant teams disabled** in favor of first-party `staff_role_assignments` (per-branch role assignment is a Curis domain concept with lifecycle, HR attribution, and conflict rules Spatie doesn't model). Spatie provides the `roles`/`permissions`/`permission_role` catalog and `Gate::before` wiring; assignment resolution is Curis code. ADR-0004.

- **Roles** (platform-defined catalog, versioned, merchants cannot weaken): `super_admin`, `merchant_admin`, `branch`, `hr`, `audit`, `finance`, `front_office`, `triage`, `physician`, `pharmacy`, `laboratory`, `inventory`, `health_records`, `ward_management`, `optician`, `mental_health`, `nutrition`, `mch`, `dentistry`, `patient`.
- **Permissions** are dot-namespaced strings (`patients.register`, `payments.validate`, `pricing.publish`, `audit.export`, …). The full machine-readable matrix lives in `database/seeders/data/permission-matrix.php`, generated from Platform Scope §12; the seeder version-stamps it (`policy_versions`).
- **Role hierarchy** is intentionally flat (no inheritance): the Platform Scope's separation-of-duties model prohibits implicit privilege accumulation. Multi-role users hold multiple assignments and act in exactly one role context per session.

### 10.2 Session role context

- Login binds one `(branch, role)` context. Switching contexts calls `POST /api/v1/session/role-context`, which **regenerates the session**, terminating prior context privileges (Platform Scope §13.3.4).
- `EnforceRoleContext` middleware asserts the session role matches the portal and the route's required role surface; URL-hopping across portals yields 403.

### 10.3 Policy pattern (every tenant-owned model has a policy)

```php
final class InvoicePolicy
{
    public function before(User $user): ?bool
    {
        if ($user->isAuditRole()) {
            return request()->isMethodSafe() ? null : false;   // Audit is read-only, everywhere
        }
        return null;
    }

    public function validatePayment(StaffUser $user, PaymentDeclaration $d): bool
    {
        return $user->tenant_id === $d->tenant_id                       // ownership
            && $user->roleContext()->is('finance')                      // role surface
            && $user->hasPermission('payments.validate')                // permission
            && $d->state === 'pending_finance_validation'               // workflow state
            && $d->declared_by !== $user->id;                           // separation of duties
    }
}
```

Every authorization decision evaluates: identity → active status → tenant → branch → role context → permission → object ownership → workflow state (Platform Scope §11.3). Policies are registered explicitly; a CI architecture test fails if any `Domain/*/Models` class lacks a policy.

### 10.4 Ownership transfer, removal, invitations

- **Merchant Administrator transfer:** initiated by current Merchant Admin, requires Super Administrator co-approval; both actions audit-logged; the outgoing admin's sessions revoked at completion.
- **Staff removal:** HR deactivation runs the Staff Responsibility Check (open consultations, triage, prescriptions, results, unvalidated payments, reconciliation duties, report requests, admissions, inventory approvals — Platform Scope §15.4); blocking obligations must be reassigned via guided UI; deactivation then revokes sessions and assignments, all audited.
- **Invitations:** HR creates `staff_invitations` (email, role, branch, expires 7d, single-use token hash). Acceptance verifies email, creates the staff user in `invited → active` flow. Patient accounts self-register or are initiated by Front Office (unclaimed profile + invitation).
- **Permission changes** are only role-catalog version changes (platform-level, Super Admin) or assignment changes (HR); both audit-logged with before/after.

### 10.5 Role-conflict engine

`role_conflict_rules` seeds the platform matrix: `front_office+finance`, `finance+audit`, `physician+audit`, `hr+audit`, `pharmacy+finance`, `laboratory+finance` (Platform Scope §13.3). Enforcement points:

1. **Assignment time:** `AssignStaffRole` action consults `RoleConflictEngine::check($staff, $newRole)` across all active assignments (any branch); violation → `422 ROLE_CONFLICT`, attempt audit-logged.
2. **DB backstop:** trigger on `staff_role_assignments` re-checks the seeded matrix.
3. **Session time:** context binding re-verifies (protects against matrix version changes between assignment and login).
4. **Re-evaluation:** on assignment change, branch transfer, department enablement change — queued `ReevaluateRoleConflicts` job flags violations for HR resolution.

---

## 11. API Design

### 11.1 Principles

REST, versioned under `/api/v1`. Consistent envelopes. ULIDs only. Pagination everywhere. Idempotency on financial/clinical creates. Structured errors. Every route: authenticated → tenant-scoped → policy-authorized → validated → rate-limited.

### 11.2 Route groups (representative; full inventory maintained in `routes/api/v1/*.php` per module)

```php
// routes/api/v1/clinical.php  (staff guard, role-gated per route)
Route::prefix('v1')->middleware(['auth:staff', 'staff.context', 'tenant', 'throttle:api-standard'])->group(function () {

    // Front Office
    Route::post('patients', RegisterPatient::class)->middleware('can:patients.register');
    Route::get('patients', SearchPatients::class);                       // tenant-scoped, paginated
    Route::post('patients/{patient:ulid}/visits/check-in', CheckInVisit::class);
    Route::post('appointments', ScheduleAppointment::class);
    Route::get('queues/{queue}', GetQueueBoard::class);                   // triage|physician|specialist

    // Triage
    Route::post('visits/{visit:ulid}/triage', StartTriageSession::class);
    Route::put('triage-sessions/{session:ulid}/vitals', RecordVitals::class);
    Route::post('triage-sessions/{session:ulid}/complete', CompleteTriage::class);

    // Physician
    Route::post('visits/{visit:ulid}/consultations', StartConsultation::class);
    Route::put('consultations/{c:ulid}/notes', UpsertClinicalNotes::class);       // pre-finalization only
    Route::post('consultations/{c:ulid}/diagnoses', RecordDiagnosis::class);
    Route::post('consultations/{c:ulid}/prescriptions', CreatePrescription::class);
    Route::post('consultations/{c:ulid}/lab-orders', CreateLabOrder::class);
    Route::post('consultations/{c:ulid}/close', CloseConsultation::class);        // closure verification gate
    Route::post('clinical-records/{record:ulid}/amendments', CreateAmendment::class);

    // Pharmacy
    Route::get('prescriptions', ListDispensablePrescriptions::class);
    Route::post('prescriptions/{p:ulid}/dispense', DispensePrescription::class)
        ->middleware('idempotency');                                              // financial trigger
    Route::post('dispensing-records/{d:ulid}/returns', InitiateReturn::class);

    // Laboratory
    Route::post('lab-orders/{o:ulid}/specimens', RecordSpecimen::class);
    Route::post('lab-orders/{o:ulid}/results', EnterResults::class);
    Route::post('lab-results/{r:ulid}/finalize', FinalizeResult::class);
    Route::post('lab-results/{r:ulid}/release', ReleaseToPatient::class);
});

// routes/api/v1/billing.php
Route::post('payment-declarations', DeclarePayment::class)->middleware('idempotency');
Route::post('payment-declarations/{pd:ulid}/validate', ValidatePayment::class)
    ->middleware(['can:payments.validate', 'reauth', 'idempotency']);
Route::post('invoices/{i:ulid}/credit-notes', RequestCreditNote::class)->middleware('idempotency');
Route::get('receipts/{r:ulid}/download', DownloadReceipt::class);                 // signed-url issue
Route::post('financial-periods/{p:ulid}/close', ClosePeriod::class)->middleware('reauth');

// routes/api/v1/platform.php  (super_admin guard, platform portal only)
Route::post('tenants/{t:ulid}/activate', ActivateTenant::class);
Route::put('billing-tiers/{tier:ulid}', UpdateBillingTier::class);                // versioned config
Route::post('curis-settlements/{s:ulid}/validate', ValidateSettlement::class)->middleware('reauth');

// routes/api/v1/patient.php  (patient guard, curis.ke)
Route::get('me/visits', ListMyVisits::class);
Route::get('me/receipts', ListMyReceipts::class);
Route::post('me/report-requests', RequestHealthReport::class)->middleware('reauth');
Route::post('me/prescription-requests', RequestPrescription::class)->middleware('reauth');
Route::post('me/external-records', ShareExternalRecord::class)->middleware('reauth');
Route::delete('me/devices/{device:ulid}', RevokeDevice::class)->middleware('reauth');

// routes/webhooks.php  (no session auth; signature auth)
Route::post('webhooks/wallet', WalletWebhookController::class)
    ->middleware(['throttle:webhooks-wallet']);   // signature verified in controller before anything

// routes/api/integrations.php  (R&E service-account inbound verification/reconciliation)
Route::middleware('auth.integration:refer_earn')->group(function () {
    Route::post('integrations/refer-earn/verify', VerifyMerchantFacts::class);
    Route::post('integrations/refer-earn/reconciliation', ReconciliationDataset::class);
});
```

### 11.3 Request validation

Every mutating endpoint has a FormRequest: typed rules, tenant-scoped `exists` rules (`Rule::exists('patients','ulid')->where('tenant_id', ctx)`), enum casts, cross-field rules (e.g., declared amount ≤ invoice balance unless overpayment flag), and `authorize()` returning true (authorization lives in policies to keep one source of truth).

### 11.4 Response resources

`JsonResource` classes per model version (`InvoiceResource`); serialize `ulid` as `id`; never internal ids; money as `{amount_minor, currency, formatted}`; states as strings matching the state-machine constants; timestamps ISO-8601 UTC. Collections wrap in `{data, links, meta}` (Laravel paginator), default page size 25, max 100.

### 11.5 Filtering and sorting

Whitelist-based: `?filter[state]=issued&filter[branch]=01H…&sort=-issued_at`. `Spatie\QueryBuilder` with explicitly allowed filters/sorts per endpoint; unknown parameters → 400 `INVALID_QUERY_PARAMETER`.

### 11.6 Structured errors

```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You are not permitted to validate payments.",
    "details": [{"field": "amount_minor", "code": "EXCEEDS_BALANCE"}],
    "correlation_id": "9f1c2e2e-…"
  }
}
```

| HTTP | Codes (canonical set) |
| --- | --- |
| 400 | `INVALID_QUERY_PARAMETER`, `MALFORMED_REQUEST` |
| 401 | `UNAUTHENTICATED`, `SESSION_EXPIRED` |
| 403 | `PERMISSION_DENIED`, `ROLE_CONTEXT_MISMATCH`, `REAUTH_REQUIRED`, `BRANCH_SCOPE_DENIED`, `TENANT_SUSPENDED` |
| 404 | `NOT_FOUND` (includes foreign-tenant ULIDs) |
| 409 | `IDEMPOTENCY_CONFLICT`, `STATE_CONFLICT`, `OPTIMISTIC_LOCK` |
| 422 | `VALIDATION_FAILED`, `ROLE_CONFLICT`, `WORKFLOW_PRECONDITION_FAILED`, `CREDIT_NOTE_EXCEEDS_REVERSIBLE` |
| 429 | `RATE_LIMITED` (with `Retry-After`) |
| 500 | `INTERNAL_ERROR` (correlation ID only; no internals) |

### 11.7 API logging

Structured request logs (method, route, tenant, actor type/id, status, duration, correlation ID) — never bodies for auth/financial endpoints; error logs carry stack traces server-side only. OpenAPI spec generated (`scribe` or `l5-swagger`) and used to generate the frontend TS types; CI fails on spec drift.

---

## 12. UI/UX Design System

### 12.1 Token architecture

All colors, spacing, radii, and typography are CSS custom properties defined once in `resources/js/design/tokens.css` and consumed through Tailwind theme mapping (`@theme` in Tailwind v4). Components never hardcode hex values.

```css
:root {
  /* brand */
  --c-primary-600: #0f766e;  --c-primary-700: #115e59;
  /* semantic surface/ink (light defaults) */
  --surface-0: #ffffff; --surface-1: #f8fafc; --surface-2: #eef2f6;
  --ink-1: #0f172a; --ink-2: #475569; --ink-3: #64748b;
  --border-1: #e2e8f0; --focus-ring: #0f766e;
  /* status */
  --ok-600: #15803d; --warn-600: #b45309; --danger-600: #b91c1c; --info-600: #1d4ed8;
  /* clinical severity (queue priorities) */
  --triage-emergency: #b91c1c; --triage-urgent: #c2410c; --triage-standard: #0f766e;
  /* spacing scale 4px base; radius: 6/10/16; shadows: sm/md/lg elevation tokens */
}
[data-theme="dark"] {
  --surface-0: #0b1220; --surface-1: #101827; --surface-2: #1a2436;
  --ink-1: #e6edf6; --ink-2: #a8b3c4; --ink-3: #7c8798;
  --border-1: #263145; --focus-ring: #2dd4bf;
  /* status colors re-tuned for dark contrast (AA-verified values) */
}
```

Typography: Inter (variable), scale 12/14/16/18/22/28/36; body 16px/1.5; tabular numerals (`font-variant-numeric: tabular-nums`) on all monetary and vitals displays.

### 12.2 Component inventory (design/components, all Vue + TS, all themed, all keyboard-accessible)

| Component | Key requirements |
| --- | --- |
| `CButton` | variants primary/secondary/danger/ghost; loading state with spinner + disabled; min 44px touch target |
| `CInput`, `CTextarea`, `CSelect`, `CCombobox`, `CDatePicker` | label always rendered (never placeholder-as-label); described-by error wiring; required marker |
| `CForm` | section grouping, sticky action bar on long forms, dirty-guard on navigation |
| `CTable` | sortable headers (aria-sort), sticky header, row focus, empty state slot, pagination footer; responsive strategy per Section 13.4 |
| `CModal` | focus trap, `aria-modal`, ESC close, return-focus-on-close, scroll lock |
| `CToast` | polite live region; auto-dismiss with pause-on-hover; action slot |
| `CCard`, `CStatCard` | dashboard metrics with trend slots |
| `CQueueBoard` | live queue列 with priority color tokens, waiting-time chips, state tags |
| `CStateTag` | renders workflow states with a fixed state→color map (single source: generated from backend state constants) |
| `CEmptyState` | icon, message, role-appropriate CTA |
| `CBanner` | downtime safeguard, tenant-suspended, break-glass-active warnings |
| `CIdentity` | avatar + name + role/branch as one unit (Section 17) |
| `CMoney` | formats minor units; never does arithmetic |
| `CAiBadge` | mandatory visible "AI-assisted draft" marking (Platform Scope §31) |

### 12.3 Layout regions (all portals)

Header (portal name, branch context, global search where permitted, notifications bell, profile menu) — Sidebar (role-scoped navigation; collapsible; icons + labels) — Content (page header with title/breadcrumb/actions, then content) — optional right rail (contextual detail). These regions are structural HTML (`<header> <nav> <main> <aside>`); CSS must never hide or restructure them into misrepresentation.

### 12.4 Interaction standards

- Every async action: optimistic disable → spinner → toast on success → inline error on failure.
- Destructive/irreversible: typed-confirmation modal (`type the invoice number to cancel`).
- Financial and clinical finalization actions: summary review step before commit (what will become immutable).
- Focus states: 2px `--focus-ring` outline with 2px offset — visible in both themes, never removed.

---

## 13. Responsive Layout Strategy

### 13.1 Breakpoints (CSS media queries only; no JS layout state, no device detection)

```css
/* mobile-first defaults ≤767px */
@media (min-width: 768px) and (max-width: 1024px) { /* tablet */ }
@media (min-width: 1025px) { /* desktop */ }
```

Tailwind config maps `md: 768px`, `lg: 1025px` to match exactly. CI lint rejects any `navigator.userAgent`/`window.innerWidth`-driven layout branching (ESLint custom rule); resize adaptation is live because it is pure CSS.

### 13.2 Per-surface strategies

| Surface | Desktop ≥1025 | Tablet 768–1024 | Mobile ≤767 |
| --- | --- | --- | --- |
| Dashboard | 12-col grid, 3–4 stat cards/row, side-by-side charts | 2 cards/row, stacked charts | 1 card/row, vertically stacked, priority order (queues → money → alerts) |
| Sidebar | fixed 260px, always visible | collapsed to 72px icon rail, expandable overlay | hidden; hamburger opens full-screen sheet with focus trap |
| Header | full: search + context + bell + profile | search collapses to icon-expand | title + hamburger + profile only |
| Data tables | full columns | column-priority: low-priority columns hidden (CSS `display:none` by priority class) | card list: each row renders as a stacked definition card; horizontal scroll only for explicitly numeric ledgers with sticky first column |
| Forms | 2-col field grid, sticky action bar | 2-col where fields short, else 1-col | single column, full-width controls, sticky bottom action bar |
| Settings pages | left anchor nav + content | anchor nav becomes top tabs | top tabs, scrollable |
| Profile menu | anchored dropdown card | anchored dropdown | full-width sheet from header |
| Modals | centered, max-w 640px | centered, max-w 90vw | full-screen sheet |
| Queue boards | multi-column kanban by state | 2-column | single column with state filter chips |
| Billing screens | invoice detail two-pane (lines + payment panel) | stacked panes | stacked; payment actions in sticky footer |
| Team management | table + detail drawer | table (priority cols) + full-page detail | card list + full-page detail |

### 13.3 Global rules

No horizontal scroll on normal content (`overflow-x` audited per page in browser tests at 375px, 768px, 1280px widths); touch targets ≥ 44×44 on tablet/mobile; typography scales via `clamp()` for page titles; images `max-width:100%`; charts re-render on container resize (ResizeObserver — allowed: it adapts a canvas to its CSS-determined box, it does not decide layout).

---

## 14. Dark Mode Strategy

1. **Tokens:** dual palettes via `[data-theme="dark"]` (Section 12.1); components consume semantic tokens only, so dark mode is a token swap, never per-component overrides.
2. **Default:** light. Toggle in the profile menu (`CThemeToggle`, labeled, keyboard-operable).
3. **Persistence:** authenticated users → `PUT /api/v1/me/preferences {theme}` stored in `staff_profiles.preferences`/patient equivalent; also mirrored to `localStorage` for instant boot; unauthenticated screens honor `prefers-color-scheme`.
4. **Flash prevention:** inline `<head>` script (nonce'd, 3 lines) reads `localStorage.theme || matchMedia` and sets `data-theme` before first paint.
5. **Non-negotiables in dark:** AA contrast verified for ink/surface pairs (documented contrast table in `docs/design/contrast.md`); focus rings brightened (`--focus-ring` dark value); borders remain visible (`--border-1` dark ≥ 3:1 against surface); validation error red re-tuned (`#f87171` on dark surfaces); disabled states distinguishable from enabled.
6. **Testing:** component stories snapshot in both themes; axe contrast checks run against both; browser tests for the five core screens run twice (theme param).

---

## 15. Accessibility Strategy

1. **Keyboard:** every interactive element reachable and operable by keyboard; logical tab order; skip-to-content link; roving tabindex in menus/queue boards; documented shortcuts for high-frequency clinical actions (e.g., `/` search focus).
2. **Focus:** visible indicators (Section 12.4); modals trap and restore focus; route changes move focus to page `h1`.
3. **Contrast:** WCAG AA (4.5:1 body, 3:1 large text/UI) — both themes; tokens are the enforcement point.
4. **Forms:** programmatic labels (`<label for>`); placeholders never replace labels; errors linked via `aria-describedby` + `aria-invalid`; required fields marked visually and via `aria-required`; error summary at top of long forms with anchor links.
5. **Names:** icon-only buttons get `aria-label`; links describe destinations.
6. **Touch:** ≥ 44×44 targets.
7. **Zoom:** viewport meta is `width=device-width, initial-scale=1` — nothing else; layouts tested at 200% zoom.
8. **Motion:** all transitions respect `prefers-reduced-motion` (global CSS guard disables non-essential animation).
9. **Screen readers:** ARIA patterns — menus (`menu`/`menuitem`), modals (`dialog`), toasts (`role=status`), alerts (`role=alert` for urgent clinical flags), tables with proper `th scope`, live regions for queue updates (`aria-live=polite`).
10. **Verification:** `vitest-axe` on every design-system component; axe scan in Playwright for the 12 core pages; manual keyboard walkthrough checklist per portal at Phase 21; screen-reader smoke test (NVDA) on login, queue, consultation, payment validation, patient portal.

---

## 16. Forms and Input Behavior Strategy

1. **States:** empty/populated/focused/disabled/readonly/error/success all styled via tokens; CSS presents state, JS/backend decides state (Non-Negotiable 12).
2. **Validation display:** client-side pre-checks (required, format) for fast feedback, always re-validated server-side; server 422 maps field errors via `useForm` to inputs (`errors.fieldPath`), including nested arrays (`items.2.quantity`).
3. **Duplicate-submit prevention:** `useForm` locks submit on in-flight; financial/clinical POSTs also send idempotency keys (`useIdempotencyKey` generates per form instance, regenerates after success).
4. **Long forms:** sectioned with headings (triage vitals, consultation notes, registration); progress-preserving drafts where the workflow allows drafts (consultation notes autosave every 10s to the draft state — never after finalization).
5. **Sensitive fields:** patient identifiers and contact fields masked in list views; no browser autofill on staff clinical forms (`autocomplete="off"` where clinically risky, e.g. patient-search-then-select flows to avoid wrong-patient carryover).
6. **Required indicators:** asterisk + "required" in accessible label.
7. **Optimistic-lock conflicts:** 409 → non-destructive dialog offering reload-and-reapply.
8. **Wrong-patient guard:** every clinical form header pins patient identity (name, ULID short code, age/sex chip); switching patients mid-session is impossible by construction (session-bound context).

---

## 17. User Profile and Account UI Strategy

1. `CIdentity` renders avatar (initials fallback), display name, and current role + branch as one cohesive unit in the header; hover/focus elevates with token shadow; entire unit is one button (cursor pointer, focus ring).
2. Activation opens the profile preview card anchored to the control (popper-positioned, collision-aware, never clipped — flips within viewport): photo, name, email, role@branch, tenant name; links to Profile, Security (devices/sessions), Preferences (theme, notifications), and Sign out.
3. **Role/branch switcher** (users with multiple assignments): listed in the card; selection calls the role-context endpoint (Section 10.2), the SPA fully reloads state (stores reset) — privileges never blend.
4. Patient portal equivalent: identity unit + trusted devices management (list with device label, last seen, revoke button → step-up reauth), login-activity view, communication preferences.
5. CSS styles the card; open/close/positioning behavior is component logic; click-outside and ESC close; focus returns to trigger.

---

## 18. Billing and Plan Enforcement Strategy

Curis has two distinct "billing" surfaces. Neither processes money in this codebase.

### 18.1 Patient-side billing (facility revenue) — the deterministic engine

1. **Trigger registry:** `billing_triggers` rows are created only by domain events (consultation closed, dispensing confirmed, lab order approved/completed per config, report request, admission charge events, specialist session completed, approved administrative service). Each trigger stores type, source ULID, service/product refs, and chargeability determination.
2. **Invoice assembly:** `AssembleInvoiceFromTrigger` resolves the current published `pricing_version` for the branch, computes tax per `tax_rules` (inclusive/exclusive, class, effective date), applies approved discounts, snapshots everything into `pricing_snapshot`, and issues. Zero-price services record a non-chargeable event, no invoice line (Platform Scope §17.2.4).
3. **Enforcement:** there is no `POST /invoices` endpoint. Invoice creation is only reachable through trigger processing — the API surface makes manual invoicing impossible rather than merely forbidden.
4. **Payment loop:** declaration (Front Office/Patient) → Finance validation (separation-of-duties, step-up reauth, idempotent) → automatic immutable receipt → balanced ledger postings → patient visibility. Rejections notify the declarant with reason.
5. **Credit notes:** reason-category-mandatory, Finance-approved (Merchant Admin for exceptional), never exceeding remaining reversible amount (DB CHECK against computed reversible balance inside the transaction), posting additive reversal entries and proportional tax reversal.

### 18.2 Curis platform billing (plan enforcement analog)

1. **Configuration:** `billing_tiers`/`tier_versions` hold onboarding fee, performance-fee percentage, minimum monthly floor, payment terms, discounts, penalties — versioned with effective dates, Super-Admin-only writes. Illustrative launch values (Tier 1: KES 120–180k onboarding, 10% performance, 100k floor; Tier 2: 300k anchor, 8–10%, 200k; Tier 3: 500k anchor, 6–8%, 350k) are **seed data, not constants**.
2. **Accrual:** nightly `AccruePlatformFees` computes fees on *validated* revenue only (receipts issued), per tier version effective on the service date; accruals reference their source receipts (a Curis fee is always traceable to governed activity; a deleted invoice cannot accrue because invoices are never deleted).
3. **Period close:** per merchant cycle (weekly/14d/monthly, Finance-selected from permitted options) → `curis_invoices` issued with floor top-up where performance fees < floor, early-payment discount terms, prior balance, adjustments (credit-note-traceable only — no free-text amount edits; the API has no such field).
4. **Settlement:** merchant pays through Wallet rails (structured reference `CUR-PAY-…`) or submits manual evidence; Wallet webhooks update settlement state; Super Administrator validates (Section 18.3 flow); transparency ledger exposes basis, percentage, floor, adjustments, status to merchant Finance and Admin.
5. **Feature gating:** tenant `status` and activation checklist gate all operational endpoints (`TENANT_SUSPENDED` 403 on suspension, read-only grace mode configurable); department enablement gates role surfaces (Branch-controlled). There are no per-plan feature flags at launch — tiers price, they don't gate features (Platform Scope §23) — the checklist and department enablement are the gates.
6. **Patient invisibility:** no patient-guard endpoint serializes any platform-billing entity; an architecture test asserts patient Resources cannot reference `PlatformBilling` models.

---

## 19. File Upload and Storage Strategy

| Upload class | Types | Max size | Notes |
| --- | --- | --- | --- |
| Payment evidence | jpg, png, pdf | 10 MB | attached to declarations |
| Lab result documents | pdf | 20 MB | attached to results |
| External medical records | pdf, jpg, png | 25 MB | provenance-wrapped |
| Historical report imports | pdf, csv (bulk manifest) | 50 MB | Health Records only |
| Profile photos | jpg, png, webp | 2 MB | re-encoded server-side |
| Settlement evidence | pdf, jpg, png | 10 MB | Finance → Super Admin |

Pipeline (all uploads):

1. Authorize **before** issuing the upload ticket (policy: role + tenant + context object).
2. Direct-to-S3 via short-lived pre-signed PUT (5 min) to a **quarantine prefix** `tenants/{ulid}/quarantine/{uuid}`; client then POSTs completion.
3. `ScanUploadedFile` job: MIME sniff (server-side content detection, not extension trust), extension whitelist, size re-check, ClamAV scan (sidecar container), image re-encode (strip EXIF), PDF sanity parse. Pass → move to `tenants/{ulid}/{domain}/{uuid}`; fail → delete + `file_scan_results` fail row + notify uploader + security event.
4. Metadata in `uploaded_files` (tenant, uploader, context type/id, mime, size, checksum, scan state); files are never publicly readable (bucket policy: deny public).
5. Downloads only via `GET /api/v1/files/{ulid}/download` → policy check → 60-second signed URL; sensitive classes (clinical docs, reports) audit-log each issue.
6. Orphan cleanup: weekly job deletes quarantine >48h and unattached completed uploads >7d (never files referenced by finalized documents).
7. Abuse tests: oversized body, spoofed MIME (exe renamed pdf), EICAR test file, path-traversal filename, cross-tenant download attempt, expired signed URL replay — all in `tests/Feature/Files/`.

---

## 20. Queue, Jobs, Notifications, and Scheduled Task Strategy

### 20.1 Queues (Redis + Horizon)

| Queue | Workers | Contents |
| --- | --- | --- |
| `critical` | 4 | payment/receipt side-effects, audit chain writes, settlement webhook processing |
| `default` | 6 | domain event listeners, search indexing, report assembly triggers |
| `notifications` | 4 | mail/SMS/in-app fan-out |
| `outbox` | 2 | R&E event dispatch, retries |
| `exports` | 2 | report/export generation |
| `maintenance` | 1 | retention, cleanup, verification jobs |

Rules: every job touching tenant data uses `TenantAwareJob`; financial side-effect jobs are idempotent (natural keys / `idempotency_keys`); `failed_jobs` monitored with alert on threshold; Horizon dashboard behind super-admin auth on an internal hostname; long jobs report progress to `job_batches`.

### 20.2 Notifications

- Channels: database (in-app), mail, SMS (approved events only: OTPs, appointment reminders, urgent flags — cost-controlled).
- Template registry (`notification_templates`, versioned) covers the full Platform Scope §28.2 event list (invitation, magic link, new device, appointment confirm/remind, check-in, queue add, triage complete, urgent flag, lab request/complete, prescription issued, dispensing complete, payment awaiting/approved/rejected, receipt, report generated/requested/delivered, Curis invoice issued/overdue, credential expiry, suspicious activity, break-glass, suspension).
- Privacy rule enforced in the renderer: subject/preview lines never contain clinical content (test asserts template previews against a banned-token list).
- Delivery: queued, provider webhook status → `notification_deliveries`, retry with backoff, at-least-once with idempotent render; mandatory security notifications bypass user preference suppression.

### 20.3 Scheduler

Section 5.5 table is the authoritative schedule; `schedule:work` runs in a dedicated container; every scheduled job emits a heartbeat metric; a missing heartbeat alerts (dead-man switch).

---

## 21. Search Strategy

1. Engine: Meilisearch (managed or self-hosted container), chosen for typo-tolerant patient lookup at branch scale; ADR-0006 documents the Typesense alternative.
2. Indexes: `patients` (name, phone/email hashes for exact match, identifiers, tenant_id, branch registrations), `catalog` (services/products per tenant), `records` (report titles/metadata — never full clinical narrative text at launch).
3. **Isolation:** every document carries `tenant_id`; the backend proxies all search queries (`/api/v1/search/patients?q=…`) adding `filter: tenant_id = ctx` server-side; the SPA never holds a Meilisearch key; per-index tenant filter is also baked into a scoped search API key as a second layer.
4. Indexing via Scout-style observers → queued index jobs (outbox-backed for consistency); reindex command per tenant.
5. Performance target: P95 ≤ 1s tenant-scoped patient search (Platform Scope §33) — verified in Phase 26 load tests.
6. Duplicate detection uses targeted DB queries (normalized phone/email/name+DOB matching), not the search engine (deterministic, testable).

---

## 22. Observability and Audit Logging Strategy

### 22.1 Telemetry

| Concern | Tool | Notes |
| --- | --- | --- |
| Structured logs | JSON to stdout → Loki (or CloudWatch) | fields: level, message, correlation_id, tenant_id, actor, route, duration; redaction processor (Non-Negotiable 6) |
| Error tracking | Sentry (backend + frontend) | release-tagged; PII scrubbing on; correlation ID linked |
| APM/latency | Sentry performance or Prometheus + `laravel-exporter` | P95 per route; slow-query log (>200ms) shipped |
| Queue monitoring | Horizon + Prometheus metrics | depth, wait, failure alerts |
| Uptime | external probe on `/up` + synthetic login probe | 1-min interval |
| Dashboards | Grafana | API latency, queue depth, outbox lag, webhook failures, audit-chain verification status, notification failure rate |
| Alerts (page) | error-rate spike, `/up` failing, queue depth > threshold, outbox dead-letters, audit-chain mismatch, webhook signature failure burst, failed-job spike, disk/DB saturation | on-call rotation |

### 22.2 Audit events (what is audited — implement as the authoritative list)

All of: login success/failure/anomaly, magic-link/OTP issuance-verification, session/device revocation, role assignment changes, role-conflict attempts, department enablement, pricing publication, patient registration/update/merge, duplicate flags, triage completion, consultation start/close/amendment, prescription issue/cancel, dispensing/returns, lab order/result finalize/release/amend, report generate/finalize/deliver, external record share/validate/merge, invoice issue/state changes, declarations/validations/rejections, receipts, credit notes, refunds, period close/reopen, reconciliation snapshots, admission lifecycle, charge events, discharge, inventory movements/write-offs/backdating, Curis fee accrual/invoice/settlement validation, tier config changes, tenant lifecycle, break-glass grant/use/expiry, staff activation/suspension/deactivation, support requests, exports (who exported what), integration events in/out, notification of suspicious activity. Fields per Section 7.3 `audit_events`; before/after only when safe.

### 22.3 Audit access

Tenant Audit role: read-only queries + immutable exports (CSV/PDF, formula-injection-sanitized, watermark, export itself audited). Super Admin: platform-stream events + per-tenant governance events. Nobody updates or deletes audit rows (DB-enforced).

---

## 23. Performance and Scalability Plan

### 23.1 Targets (from Platform Scope §33, binding)

P95 API ≤ 500ms; P95 page-interactive ≤ 3s; queue board refresh ≤ 5s; patient search P95 ≤ 1s; standard reports ≤ 60s (background); availability ≥ 99.9%; 500 concurrent tenants / 5,000 concurrent clinical sessions without architectural ceiling.

### 23.2 Likely bottlenecks and mitigations (pre-identified; verify with load tests, don't guess)

| Bottleneck | Evidence trigger | Mitigation |
| --- | --- | --- |
| Queue-board polling storms | P95 rise on `/queues/*` at >200 concurrent staff | 5s cache per branch-queue (Redis, invalidated on state transitions); ETag/304 |
| Patient search | slow-query log | Meilisearch offload; DB trigram fallback indexed |
| Invoice assembly under dispensing bursts | queue latency on `critical` | trigger processing is queued, idempotent; per-branch fan-out |
| Ledger contention on period close | lock waits | period close batches postings; advisory lock per tenant-period; run off-peak |
| Audit hash chain serialization | insert latency | per-tenant chain (not global); chain append in-transaction is a single indexed lookup + insert |
| Dashboard aggregates | expensive counts | nightly `reconciliation_snapshots` + incremental counters (Redis) for today-view |
| Report/export generation | worker saturation | `exports` queue isolation, per-tenant concurrency cap |
| N+1s | Telescope/CI query assertions | `preventLazyLoading()` in non-prod; eager-load review per Resource |

### 23.3 Standing rules

Pagination everywhere (max 100); composite indexes lead `tenant_id`; counter caches instead of `COUNT(*)` on hot paths; Redis cache with explicit invalidation events (no TTL-only correctness); frontend route-level code splitting per portal (physician bundle ≠ patient bundle chunk), image lazy-loading, Brotli, CDN for static assets with content-hash filenames; `SELECT` projections on wide JSONB tables; monthly partitions on high-volume tables; read-replica option documented (not required at launch).

---

## 24. Security Threat Model

STRIDE-organized; every row maps to implemented controls and a verifying test.

| Threat | Vector | Controls | Verifying test |
| --- | --- | --- | --- |
| Spoofing | Magic-link interception/reuse | 10-min expiry, single-use atomic consumption, hashed at rest, HTTPS-only links, new-device notification | `MagicLinkReuseTest` |
| Spoofing | OTP brute force | 5 attempts/token, resend throttle, bot protection, lockout escalation | `OtpBruteForceTest` |
| Spoofing | Session fixation | session regeneration at login and role switch | `SessionFixationTest` |
| Tampering | Finalized record edit | DB triggers + policy denial + amendment-only path | `ImmutabilityTriggerTest` |
| Tampering | Audit trail modification | INSERT-only grants, hash chain, nightly verification | `AuditChainTest` |
| Tampering | Webhook forgery | signature verify (HMAC/asymmetric), timestamp skew ±5min, replay window, per-app secret | `WalletWebhookSignatureTest` |
| Tampering | Mass assignment | `$fillable` everywhere, PHPStan rule | `MassAssignmentAuditTest` |
| Repudiation | "I didn't validate that payment" | audit event with actor/session/IP/step-up timestamp | audit assertions in payment tests |
| Info disclosure | Cross-tenant read (IDOR) | Section 8 layers | isolation suite |
| Info disclosure | Sequential-ID enumeration | ULIDs only | `NoSequentialIdTest` |
| Info disclosure | Secrets/PHI in logs | redaction processor; banned-token log test | `LogRedactionTest` |
| Info disclosure | XSS | Vue escaping, `v-html` ban, CSP nonce, sanitized report preview | `XssRegressionTest` + CSP header test |
| Info disclosure | Notification preview leakage | template banned-token rule | `TemplatePrivacyTest` |
| DoS | Login/OTP flood | limiters (Section 9.4), bot protection | throttle tests |
| DoS | Export/report abuse | `api-heavy` limiter, queue isolation, per-tenant cap | `ExportThrottleTest` |
| Elevation | Role self-elevation / URL hopping | server-side role context, conflict engine, portal enforcement | `RoleContextTest`, `RoleConflictTest` |
| Elevation | Finance validating own declaration | policy separation check | `SelfValidationDeniedTest` |
| Elevation | SQL injection | bindings only, raw-SQL review gate | SQLi fuzz cases in API tests |
| Elevation | CSRF | Sanctum CSRF, SameSite | `CsrfTest` |
| Elevation | Unsafe redirects | no user-controlled redirect targets; allowlist helper | `RedirectAllowlistTest` |
| Supply chain | Dependency vulns | composer/npm audit + Dependabot, image scan (Trivy) | CI gates |
| File abuse | Malware/polyglot uploads | Section 19 pipeline | file abuse suite |
| Financial integrity | Duplicate payment application | idempotency store + state machine | `DuplicateDeclarationTest` |
| Financial integrity | Fee manipulation | no manual fee field exists; config versioned; accrual traceable | `FeeAdjustmentPathTest` |
| Privacy | PHI in integration payloads | outbox schema validator | `OutboxSchemaTest` |

---

## 25. Testing Strategy

### 25.1 Layers and tooling

| Layer | Tool | Runs |
| --- | --- | --- |
| Unit (domain logic, money, state machines, signers) | Pest (PHPUnit) | every push |
| Feature/API (HTTP through kernel, DB) | Pest + `RefreshDatabase` on Postgres service container | every push |
| Architecture (module boundaries, policy coverage, tenant columns, no-sequential-ids, fillable audit) | Pest arch plugin + custom introspection tests | every push |
| Frontend component | Vitest + Testing Library + vitest-axe | every push |
| Browser/E2E (critical flows) | Playwright against compose stack | nightly + pre-release |
| Security regression | dedicated suite tagged `@security` | every push |
| Load | k6 scripts (`deploy/k6/`) | Phase 26 + before major releases |

Coverage gates: Domain modules ≥ 85% line coverage; `Billing`, `Ledger`, `PlatformBilling`, `Identity` ≥ 90%. Coverage is a floor, not the goal — the acceptance criteria below are the goal.

### 25.2 Standing test fixtures

`TenantFixture` builds: two tenants (A, B), each with two branches, full role set, one user per role, seeded catalog + pricing versions, patients. Every isolation and permission test uses both tenants. Factories for every model; state-machine factories expose `->inState('issued')` helpers that pass through legal transitions (never raw column writes, so factories can't create illegal states).

### 25.3 Module test plans (pattern applied to every module; governing examples)

#### Billing (`tests/Feature/Billing/`)

| File | Purpose |
| --- | --- |
| `InvoiceAssemblyTest` | trigger → invoice with correct snapshot/tax/discount; zero-price → no invoice line, non-chargeable event recorded |
| `NoManualInvoiceTest` | asserts no route exists to create invoices directly (route inventory scan) |
| `PaymentDeclarationTest` | declare with evidence; duplicate declaration idempotent-rejected; over-balance routed to overpayment workflow |
| `PaymentValidationTest` | positive path per Platform Scope §37.1 (receipt, balance, ledger, audit, patient visibility); negatives: Front Office cannot validate; rejected declaration yields no receipt; validator ≠ declarant; reauth required |
| `CreditNoteTest` | reason mandatory; cannot exceed reversible amount (boundary: exact remaining, remaining+1); proportional tax reversal; paid invoice uneditable |
| `InvoiceImmutabilityTest` | direct UPDATE of issued invoice via SQL fails on trigger; API mutation attempts → 403/409 |
| `CrossTenantBillingTest` | tenant-B invoice ULIDs 404 for tenant-A finance; validation attempt cross-tenant denied |

#### Clinical chain (`tests/Feature/Clinical/`)

`QueueStateMachineTest` (every legal/illegal transition), `TriageSessionTest` (one active per user; lock on completion; edit-after-lock denied), `ConsultationClosureTest` (closure blocked with draft prescription / incomplete lab request / missing diagnosis; closure triggers billing + report + queue update atomically — asserted in one test with DB assertions), `AmendmentTest` (finalized note edit denied; amendment versions and preserves original), `PrescriptionLifecycleTest`, `WrongPatientGuardTest` (artifacts bind to session patient; mismatched patient ULID in payload → 422).

#### Pharmacy (`tests/Feature/Pharmacy/`)

Dispense against draft/expired/cancelled prescriptions denied; partial dispensing with remainder; duplicate dispensing of fully dispensed item denied; batch expiry blocking; return > dispensed denied; return → credit-note flow; stock deduction atomicity (kill-switch test: exception after deduction rolls back everything).

#### Identity/Auth (`tests/Feature/Identity/`)

Magic-link happy path, expiry, reuse, tampering; the 8 ordered eligibility checks each individually failing (8 tests); OTP flows; device trust; role-context switching regenerates session; role-conflict matrix (each seeded pair); deactivation-with-obligations blocked per obligation type (9 tests); break-glass requires reason/reauth, expires, audits, notifies.

#### Platform billing (`tests/Feature/PlatformBilling/`)

Accrual from validated revenue only (declared-but-unvalidated excluded); tier version effective-dating (fee change mid-period applies from effective date); floor top-up; cycle close idempotency (double close no-ops); settlement via Wallet webhook vs manual evidence; Super Admin validation finality; transparency ledger visibility (Finance sees; patient endpoints cannot serialize it — architecture test).

#### Integrations (`tests/Feature/Integrations/`)

Outbox atomicity (business rollback ⇒ no message); R&E envelope schema + signature headers; event idempotency (same event_id replay); `merchant_activity_qualification_decided` versioning/supersedes; attribution capture with central down (`pending_central_confirmation`, registration proceeds); attribution lock after tenant creation; Wallet webhook signature failure → 401 + security event; `UNKNOWN` settlement state never coerced; reconciliation endpoint auth + dataset correctness; **PHI leak test**: attempt to enqueue an R&E payload containing a patient field → validator exception.

### 25.4 Meta-tests (CI structural gates)

`RouteAuthorizationCoverageTest` (every `/api/v1` route appears in at least one test asserting a 401/403/404 denial), `TenantColumnTest`, `PolicyCoverageTest`, `NoSequentialIdTest`, `MassAssignmentAuditTest`, `MigrationImmutabilityTest` (immutable tables have triggers).

### 25.5 E2E critical flows (Playwright)

1. Full outpatient chain: register → check-in → triage → consult → prescribe + lab order → close → lab result → dispense → declare → validate → receipt visible in patient portal.
2. Health-report request (chargeable and zero-price variants).
3. Staff magic-link login incl. new-device notice; patient OTP login incl. step-up on report download.
4. HR staff lifecycle incl. conflict denial and deactivation block.
5. Admission: admit → charge events → discharge → consolidated bill.
6. Dark mode + responsive assertions on the five core screens (viewport sweeps 375/768/1280; no horizontal scroll assertion).

### 25.6 Tenant-isolation suite

Section 8.3's eight denied cases plus fuzzing: for every registered API resource route, execute as tenant-A user with tenant-B ULIDs and assert 404/403 — generated programmatically from the route table so new endpoints are covered automatically. **This suite failing blocks deployment** (CI required check).

---

## 26. Deployment and CI/CD Strategy

### 26.1 Docker

```text
docker/
├── php/Dockerfile            # multi-stage: composer install → php:8.3-fpm-alpine runtime,
│                             # opcache tuned, non-root user, healthcheck script
├── nginx/Dockerfile + conf   # SPA + /api proxy, security headers, gzip/brotli
├── node/Dockerfile           # build stage only (Vite build → static assets into nginx image)
├── worker/                   # same PHP image, entrypoint: horizon
├── scheduler/                # same PHP image, entrypoint: schedule:work
└── clamav/                   # scanning sidecar
docker-compose.yml            # local: app, nginx, postgres:16, redis:7, minio, meilisearch,
                              # mailpit, clamav, horizon
```

One immutable app image per release (tag = git SHA); `local` compose mounts source, production runs baked images. `.env` never in images; config via environment/secret manager (SOPS-encrypted env files or cloud secret store); `php artisan config:cache route:cache view:cache event:cache` at container start.

### 26.2 Pipeline (GitHub Actions)

```text
on: pull_request                          on: push to main                     on: tag v*
┌──────────────────┐   ┌─────────────────────────────┐   ┌─────────────────────────┐
│ lint: pint,      │   │ everything from PR checks    │   │ build & push images      │
│ phpstan lvl 8,   │   │ + build images               │   │ deploy staging           │
│ eslint, tsc      │   │ + Trivy image scan           │   │ smoke suite on staging   │
│ gitleaks         │   │ + deploy to staging          │   │ manual approval gate     │
│ composer/npm     │   │ + Playwright on staging      │   │ deploy production:       │
│   audit          │   └─────────────────────────────┘   │  1. maintenance-aware    │
│ tests: unit,     │                                     │     rolling restart      │
│  feature, arch,  │                                     │  2. migrate --force      │
│  isolation suite │                                     │     (expand-only)        │
│  (Postgres svc)  │                                     │  3. health gate /up      │
│ frontend: vitest │                                     │  4. horizon terminate    │
│  + axe           │                                     │     (graceful)           │
│ coverage gates   │                                     │  5. synthetic login probe │
└──────────────────┘                                     └─────────────────────────┘
```

### 26.3 Migration safety and rollback

Expand/contract discipline (Section 7.4): deploy N adds, deploy N+1 enforces/drops. Rollback = redeploy previous image tag (compatible with current schema by construction) + documented `down()` only for the rare destructive step, rehearsed in staging. Every deploy snapshots the DB (PITR base + WAL archiving; RPO ≤ 15 min per Platform Scope §33). Runbooks in `docs/runbooks/`: deploy, rollback, restore-from-backup (rehearsed at Phase 27), webhook replay, outbox drain, downtime-safeguard activation.

### 26.4 Production posture

HTTPS only (edge TLS + HSTS); `/up` health endpoint (DB, Redis, storage, queue heartbeat checks); uptime probes; queue workers under Horizon with supervisor restart; scheduler container with dead-man alert; daily encrypted backups + WAL; quarterly restore drills; log shipping; Sentry releases wired to CI; dependency scans scheduled weekly in addition to per-PR.

---

## 27. Step-by-Step Development Roadmap

Phases are strictly ordered; each lists Objective / Key tasks / Tests / Verification / Acceptance / Risks / Rollback. Files listed are indicative minimums. Every phase ends with: run the phase's suites, commit evidence to `docs/evidence/phase-NN/`, close the gate.

### Phase 0 — Inception and Requirements Trace

- **Objective:** repository, ADR baseline, requirement traceability matrix (RTM).
- **Tasks:** init repo, Makefile, `docs/adr/0001–0007` (monolith, tenancy, auth, permissions, outbox, search, polling), RTM `docs/rtm.csv` mapping Platform Scope sections → planned phases; validate assumptions A1–A10 and record outcomes.
- **Verification:** RTM covers all Platform Scope sections 1–44. **Acceptance:** ADRs merged; RTM complete. **Risk:** hidden requirement gaps → mitigated by RTM review against the Scope's section list. **Rollback:** n/a (docs only).

### Phase 1 — Docker and Environment Setup

- **Objective:** reproducible local stack.
- **Tasks:** compose stack (Section 26.1), `.env.example` (no secrets), Makefile targets (`make up test fresh`), Mailpit/MinIO/Meilisearch/ClamAV wired.
- **Commands:** `make up && make test-smoke`. **Acceptance:** clean clone → running stack in ≤ 10 min; healthchecks green. **Risks:** dev/prod drift → same base images for both. **Rollback:** compose down/volume reset.

### Phase 2 — Laravel Backend Skeleton

- **Objective:** Laravel 11 app with module skeleton, quality gates.
- **Tasks:** install Laravel, Pest, Pint, PHPStan (level 8), Horizon, Sanctum, Telescope (non-prod); `app/Domain` module scaffold + deptrac rules; `Support` kernel stubs (TenantContext, Money, ApiError, Ulid); CI pipeline (PR checks) live from this phase.
- **Tests:** architecture tests bootstrapped. **Acceptance:** CI green on empty skeleton; PHPStan level 8 passes. **Rollback:** git revert.

### Phase 3 — Frontend Skeleton

- **Objective:** Vue 3 + TS + Tailwind SPA shell with portal detection.
- **Tasks:** Vite setup, tokens.css, portal bootstrap, router/pinia skeleton, API client with CSRF + correlation ID + 401/419 interceptors, ESLint (incl. `v-html` ban, no-jquery, no-device-detection rules), Vitest + axe harness.
- **Acceptance:** `npm run build` clean; component test harness runs; bundle scan shows no jQuery. **Rollback:** git revert.

### Phase 4 — Core Data Model: Platform, Tenants, Branches

- **Objective:** tenants, branches, activation checklist, department enablement tables + models + state machines.
- **Tasks:** migrations per Section 7.3 (`tenants`, `branches`, `branch_departments`, checklists), `BelongsToTenant` trait + write guard, `TransitionService`, ULID support, seeders.
- **Tests:** `TenantScopeTest`, `TenantColumnTest`, tenant/branch state transitions (activate/suspend), department dependency rule (Triage requires clinical destination).
- **Verification:** psql evidence of constraints/indexes. **Acceptance:** isolation meta-test green. **Risk:** scope-bypass via `withoutGlobalScope` → arch test bans it outside whitelisted platform actions.

### Phase 5 — Identity and Staff Authentication

- **Objective:** staff users, magic-link auth, sessions, devices, portals.
- **Tasks:** Section 9.2 flow end-to-end; `ResolvePortalContext`, `EnsureActiveStaffContext` (8 ordered checks), session/device projection, new-device notification stub, limiters; Super Admin guard with TOTP.
- **Tests:** Identity suite (Section 25.3) — the 8 eligibility checks, reuse/expiry/tamper, fixation, throttles.
- **Acceptance:** staff login E2E on local stack; denial evidence recorded. **Risk:** email deliverability → Mailpit locally, provider webhooks later (Phase 19).

### Phase 6 — HR, Roles, Permissions, Conflict Engine

- **Objective:** role catalog, permission matrix seeder, per-branch assignments, HR lifecycle, conflict engine.
- **Tasks:** Spatie install (catalog only), `permission-matrix.php` generated from Platform Scope §12, `staff_role_assignments` + trigger, `RoleConflictEngine` + seeded matrix, invitations, deactivation safeguard skeleton (obligation checkers registered per later modules), role-context switching endpoint.
- **Tests:** conflict pairs, assignment lifecycle, invitation acceptance, context-switch session regeneration, `PolicyCoverageTest` baseline.
- **Acceptance:** HR can invite/assign/suspend within rules; every denial audited. **Risk:** matrix drift vs Scope → matrix file carries scope-section annotations reviewed in PR.

### Phase 7 — Patients and Patient Authentication

- **Objective:** patient registry, identifiers/contacts/consents, duplicate detection, patient auth (Section 9.3), trusted devices.
- **Tasks:** patient tables, normalized-identifier duplicate detector, `duplicate_candidates` + controlled merge skeleton, OTP + magic-link flows, risk engine v1 (new device/geo), step-up middleware, patient portal auth screens.
- **Tests:** registration + duplicate surfacing (never auto-merge), OTP brute force, device trust/revocation, patient isolation (patient sees only own records).
- **Acceptance:** patient can register, log in, see empty portal. **Risk:** SMS cost abuse → resend throttles + bot protection verified by test.

### Phase 8 — Audit Infrastructure

- **Objective:** append-only hash-chained audit events + recorder, before all business modules land.
- **Tasks:** partitioned `audit_events`, INSERT-only grants + triggers, `AuditRecorder`, chain verification job, `security_events`, correlation-ID plumbing.
- **Tests:** `AuditChainTest` (append, verify, detect tamper via direct SQL in test), immutability trigger test, redaction test.
- **Acceptance:** every Phase 5–7 action now emits audit events (retrofit assertions added). **Risk:** performance → per-tenant chains benchmarked here (k6 micro-test).

### Phase 9 — Tenant-Scoped API Foundation + Isolation Suite

- **Objective:** `/api/v1` conventions, error envelope, pagination, filtering, idempotency store, generated isolation suite.
- **Tasks:** ApiError, Resource conventions, QueryBuilder whitelists, `EnforceIdempotencyKey`, OpenAPI generation + TS type pipeline, route-table-driven isolation fuzz suite (Section 25.6) wired as required CI check.
- **Acceptance:** all Section 8.3 denied cases pass as tests; OpenAPI published. **Risk:** spec drift → CI diff gate.

### Phase 10 — UI Layout Foundation

- **Objective:** design system core + portal layout shells.
- **Tasks:** tokens, CButton/CInput/CTable/CModal/CToast/CForm/CAsyncBoundary/CIdentity/CStateTag, PortalLayout with header/sidebar/profile menu, navigation config per portal, axe tests.
- **Acceptance:** Storybook (or Histoire) renders all components both themes; axe clean. **Risk:** component sprawl → new components require design-review label.

### Phase 11 — Responsive + Dark Mode + Accessibility Foundation

- **Objective:** Section 13/14/15 foundations proven on the shell.
- **Tasks:** breakpoint implementation across layout, theme toggle + persistence + flash prevention, reduced-motion guard, zoom-meta lint, viewport sweep browser tests.
- **Acceptance:** shell passes 375/768/1280 sweeps, both themes, axe clean, no horizontal scroll. **Risk:** regressions later → sweeps run on every page added subsequently (Playwright fixture).

### Phase 12 — Catalog and Pricing

- **Objective:** services/products, versioned pricing, discounts, tax classes/rules, Branch pricing governance.
- **Tasks:** catalog tables, append-only `pricing_versions` with effective dates, publication workflow (+ Merchant Admin approval for high-risk), zero-price chargeability rule, Laboratory/Pharmacy price-request flow.
- **Tests:** effective-date resolution (boundary times), snapshot integrity (later price change doesn't alter view of issued data), publication audit, Branch cannot edit issued invoices (policy).
- **Acceptance:** Branch portal manages catalog end-to-end. **Risk:** tax complexity → tax rules table-driven with fixture-based truth tables.

### Phase 13 — Scheduling, Visits, Queues

- **Objective:** appointments, walk-ins, check-in, queue state machine.
- **Tasks:** Section 7.3 visit model + partial-unique duplicate-check-in constraint, queue transitions incl. exceptional states (no-show, cancelled, escalated, emergency, deferred, admission-initiated), priority flags, queue boards API + UI (polling), waiting-time metrics.
- **Tests:** `QueueStateMachineTest` full transition matrix (legal and illegal), duplicate check-in DB-level denial, branch attribution assertions.
- **Acceptance:** Front Office E2E: schedule → check-in → queue visible on triage board. **Risk:** race on concurrent check-in → DB constraint is the arbiter (tested with parallel transactions).

### Phase 14 — Triage

- **Objective:** triage sessions, vitals, priority, lock-on-complete.
- **Tasks:** one-active-session partial unique index, structured vitals validation (physiological ranges with hard/soft bounds — soft warns, hard rejects), allergy/chronic display, urgent flag → notification + queue reprioritization, completion lock + routing to compatible destination.
- **Tests:** parallel-session denial, lock immutability, edit-after-lock denial, urgent flag propagation.
- **Acceptance:** triage E2E within chain. **Risk:** vitals validation false-rejects → clinically reviewed bounds fixture, overridable soft warnings recorded.

### Phase 15 — Physician Consultation

- **Objective:** the clinical command surface: sessions, notes, diagnoses, treatment plans, closure verification, finalization, amendments.
- **Tasks:** one-active-per-physician and per-visit constraints, draft autosave, closure verification service (all six checks of Platform Scope §15.9), atomic closure side-effects (finalize → visit record → billing trigger → report workflow → queue update in one transaction), amendment/addendum flow, AI-assist stubs behind `CAiBadge` (draft summaries, missing-field hints; feature-flagged, human-finalized).
- **Tests:** `ConsultationClosureTest` (each unmet check blocks), atomic side-effect assertion with induced failure (transaction rollback leaves no partial state), amendment versioning, AI output never finalizes anything (test asserts finalize requires human actor).
- **Acceptance:** Platform Scope §37.2 criteria pass verbatim. **Risk:** closure side-effect breadth → all in-process (monolith), single transaction, kill-switch tested.

### Phase 16 — Prescriptions and Pharmacy

- **Objective:** prescription lifecycle, dispensing-to-billing, returns.
- **Tasks:** prescription states (draft→issued→partially/fully dispensed→closed; cancelled/expired), pharmacy validation gates (status, catalogue, pricing-or-nonchargeable, stock, visit context), batch/expiry selection, substitution with reason, immutable dispensing records + stock deduction + automatic billing trigger atomically, partial dispensing remainders, returns (≤ dispensed, non-resalable flag, Inventory verification, credit-note linkage).
- **Tests:** Pharmacy suite (Section 25.3); Platform Scope §37.3 verbatim; duplicate-dispense idempotency.
- **Acceptance:** dispense E2E generates invoice automatically; unbilled dispensing impossible (no code path). **Risk:** stock race → row-level locks on batch rows within transaction (tested concurrently).

### Phase 17 — Laboratory

- **Objective:** orders, specimens, results, finalization, patient release.
- **Tasks:** order states (Requested→…→Released; recollection loop; cancellation), specimen records, structured result values + document attachments (Section 19 pipeline), finalize immutability + amended-result process, physician notification, release gate (unreleased invisible to patient), billing trigger per config.
- **Tests:** state matrix, result-without-order denial (except permitted direct-test), amendment versioning, patient-release gating, cross-tenant order access denial.
- **Acceptance:** lab E2E inside the chain. **Risk:** result-entry data variety → typed value schema per service with unit validation fixtures.

### Phase 18 — Inventory

- **Objective:** batches, movements, write-offs, reconciliation.
- **Tasks:** append-only `stock_movements` (adjustments reference originals), receipt/transfer/deduction/expiry/damage/write-off types, backdating requires explicit authorization + audit, reorder thresholds + alerts, physical reconciliation workflow, pharmacy-return verification hook.
- **Tests:** append-only enforcement, backdate authorization, negative-stock prevention, deduction linkage to dispensing/lab consumption.
- **Acceptance:** stock truth reproducible from movement history (property-based test replays movements = current levels). **Risk:** drift → reconciliation workflow with variance approval.

### Phase 19 — Billing, Payments, Receipts, Credit Notes, Ledger

- **Objective:** the financial core (Sections 18.1, 7.3 financial tables).
- **Tasks:** billing trigger processor, invoice assembly + eTIMS-ready metadata, invoice lock states, payment declaration (Front Office + patient) with evidence upload, Finance validation (separation, reauth, idempotency), automatic receipts (immutable, patient-visible, required disclaimer text), credit notes with reversible-amount bound, insurance/sponsor payer splits + claim records (record-only, no adjudication), double-entry ledger + chart seeder + posting rules, financial periods + close/reopen, daily reconciliation snapshots, notification wiring (email provider live), Finance dashboard.
- **Tests:** full Billing suite (Section 25.3) + ledger balance property test (every entry balances; period totals reproducible) + Platform Scope §37.1 verbatim.
- **Acceptance:** end-to-end money truth: chain E2E produces invoice→declaration→validation→receipt→postings with audit chain intact. **Risks:** partial financial writes → single-transaction actions + kill-switch tests; evidence upload abuse → Phase 19 runs file abuse suite against payment evidence.

### Phase 20 — Health Records and Reports

- **Objective:** post-visit report workflow, report requests, external records, provenance.
- **Tasks:** AI-assisted draft generation from same-day structured data (marked, human-validated), Health Records review/finalize (immutable, versioned, active-report designation, template per Medical Health Report Template with MEDICAL IN CONFIDENCE marking), request workflow (chargeability → invoice → validation → fulfilment; zero-price direct route), delivery (PDF via portal + verified email; print routing to Front Office), external record share (patient step-up) → provenance wrap → validation → controlled merge (never silent overwrite), historical import (bulk, external-source-marked).
- **Tests:** report immutability/versioning, provenance preservation, merge audit, delivery logs, chargeable vs zero-price paths, patient step-up on download.
- **Acceptance:** report E2E both trigger paths. **Risk:** PDF rendering fidelity → golden-file snapshot tests of rendered reports.

### Phase 21 — Patient Portal Completion + Accessibility Audit

- **Objective:** full patient-facing surface; first formal a11y audit.
- **Tasks:** visits/records/prescriptions/results (released only)/invoices/receipts views, report + prescription requests, external sharing, security self-service (devices, activity, preferences), notification preferences; manual keyboard + NVDA walkthrough; axe sweep all patient pages.
- **Acceptance:** patient restrictions matrix (Platform Scope §15.16) fully test-covered; a11y findings resolved or ticketed as blockers. **Risk:** clinical release leaks → release-gate tests re-run against patient serializers.

### Phase 22 — Admissions and Ward Management

- **Objective:** admissions, wards/beds, charge events, discharge, consolidated billing.
- **Tasks:** admission states, bed assignment + occupancy, external-ward context, admission-linked consultations (Phase 15 extension), event-driven charge accumulation (each event snapshot-priced at occurrence), discharge authorization gate, final bill from accumulated events (never reconstructed), Ward dashboard.
- **Tests:** charge-event immutability, discharge gate, bill = Σ events (property test), admission-linked consultation binding.
- **Acceptance:** admission E2E (Section 25.5 #5). **Risk:** long-running admission edge cases (tier change mid-admission) → pricing snapshots per event make this a non-issue; test proves it.

### Phase 23 — Specialist Departments

- **Objective:** Optician, Mental Health, Nutrition, MCH, Dentistry as governed session surfaces.
- **Tasks:** shared `specialist_sessions` engine + per-domain typed assessment schemas (refraction, MSE, anthropometrics, antenatal/growth, dental charting) as versioned JSONB schemas with server-side validation, domain billing triggers, referral rules to/from Triage/Physician/Lab/Pharmacy, prescription authority per licensed configuration, portal shells (reusing consultation UI components).
- **Tests:** per-domain session lifecycle, schema validation, restriction matrix (no pricing/validation/invoice-alteration), draft-record domain privacy.
- **Acceptance:** each department E2E behind Branch enablement. **Risk:** schema churn → versioned schemas with migration path.

### Phase 24 — Wallet by Citrus Integration + Curis Platform Billing

- **Objective:** the Curis fee engine and Wallet settlement rails (Section 18.2; Wallet Spec governing).
- **Tasks:** tier config surfaces (Super Admin), accrual job, period close + Curis invoices, transparency ledger UI (Finance/Merchant Admin), Wallet OAuth client credentials per environment, product registration data (code/slug/reference prefix `CUR-PAY-`), payment/refund API client with idempotency keys, webhook endpoint (signature verify → integration_events → settlement state update), manual evidence path, Super Admin settlement validation (reauth), Wallet-state semantics (`UNKNOWN` handling), Super Admin dashboard.
- **Tests:** PlatformBilling suite (Section 25.3), webhook signature/replay suite, sandbox contract test against Wallet sandbox (recorded), Platform Scope §37.5 verbatim.
- **Acceptance:** full Curis billing cycle in sandbox: accrue → close → invoice → Wallet-confirmed settlement → validation → ledger update. **Risk:** A5 (sandbox availability) — manual-evidence path ships regardless; contract tests stubbed against spec fixtures until sandbox opens. **Rollback:** feature flag `platform_billing.wallet_rail` reverts to evidence-only.

### Phase 25 — Refer & Earn Integration

- **Objective:** attribution capture + signed event emission (R&E Spec governing).
- **Tasks:** registration-flow referral capture (prefill/replaceable/lock-at-creation), evidence bundle submission, `referral_attributions` (minimum fields only), outbox destination `refer_earn` with `CitrusEventSigner` (X-Citrus-* headers), full event catalog emission wired to domain events (registration, verification, setup, tier selection, Curis invoice issued/paid-in-full/partial/reversed/refunded/chargeback, suspension, reactivation, deactivation, plan change, branch created, identity updated, duplicate detected), active-use rule engine (versioned; e.g., ≥ N completed visits + ≥ M validated invoices + ≥ K staff logins per service month — final rule registered with R&E before campaigns) emitting `merchant_activity_qualification_decided` with decision versioning, verification + reconciliation endpoints for the R&E service account, central-outage behavior.
- **Tests:** Integrations suite (Section 25.3) incl. PHI-leak validator, paid-event strictness (fully settled only), decision supersedes chain, outage flow.
- **Acceptance:** R&E sandbox validates event stream; attribution E2E from referred registration to locked attribution. **Risk:** A6 — outbox queues events durably until sandbox/production availability.

### Phase 26 — Search, Reporting, Dashboards, Notifications Completion, Performance

- **Objective:** Meilisearch, role-authorized reports/exports, remaining dashboards, SMS provider, load verification.
- **Tasks:** tenant-filtered indexes + proxy API, report catalog (Platform Scope §29.1) with permission gates + background generation + export sanitization/watermarking, Merchant Admin/Branch dashboards, SMS provider + cost controls, k6 load tests against staging (targets Section 23.1), remediation of found bottlenecks (evidence-driven only).
- **Acceptance:** performance targets met with recorded k6 output; search isolation test green. **Risk:** premature optimization → only remediate measured misses.

### Phase 27 — Launch Hardening and Production Readiness

- **Objective:** every launch-readiness control live and drilled.
- **Tasks:** break-glass (grant flow, time-box, review queue), downtime safeguard mode (read-only degradation, write queueing, status banner, duplicate-submit protection on recovery, ordering preservation) + drill, immutable audit export UI, duplicate-patient merge completion, tenant activation checklist gate UI (Super Admin + Merchant Admin visibility), support email workflow (HR-initiated structured form → support email), backup/restore drill, security review against Section 24 (external review recommended), accessibility final audit, Section 26 pipeline production cutover, Section 31 checklist execution, merchant onboarding dry run.
- **Acceptance:** all Section 31 items checked with evidence; first merchant activatable through the checklist. **Risk:** drill failures → gate stays open until re-drilled green.

---

## 28. IDE Agent Execution Instructions

For **every** implementation step in Section 27:

1. **Inspect first.** Read the target files and related tests before editing (`Read`/search — never assume file contents).
2. **Cite the requirement.** State the Platform Scope / Wallet Spec / R&E Spec / this-plan section that mandates the change.
3. **Prove the gap.** Show the failing test, missing route, absent column, or reproduced defect. If you cannot prove it, stop and record the question in `docs/evidence/open-questions.md` — do not guess.
4. **Smallest correct change.** Implement only what the requirement needs. No drive-by refactors, no unrelated formatting.
5. **Preserve behavior.** Run the module's existing suite before and after; unexpected diffs are defects to investigate, not to accept.
6. **Add/update tests** per Section 25's module plan, including negative, cross-tenant, permission-denial, and validation-failure cases.
7. **Run the tests** (`make test-module M=Billing`, `make test-isolation`, etc.) and paste results into the phase evidence file.
8. **Demonstrate behavior**: example request/response (success + denial), relevant DB query output, screenshot for UI work.
9. **Document remaining risks** in the phase evidence file.
10. **Never** commit secrets, skip a failing gate, weaken a trigger/policy to make a test pass, or mark a phase closed without evidence.

### Bug Fix Protocol (mandatory format for every defect)

```markdown
- Observed problem:
- Evidence: (failing test output / request log / query result)
- Affected files:
- Root cause:
- Why this is the root cause (not a symptom):
- Correct fix:
- Files changed:
- Tests added or updated:
- Test command:
- Test result:
- Proof of resolution:
- Remaining risk:
```

---

## 29. Acceptance Criteria

The application is acceptable for production only when all of the following are demonstrated with evidence:

1. **Multi-tenancy:** two seeded tenants operate concurrently; the generated isolation suite (Section 25.6) passes; all eight denied cases (Section 8.3) pass; no API response anywhere contains a sequential internal ID.
2. **Authentication:** staff magic-link and patient magic-link/OTP flows pass positive and negative suites; the eight staff eligibility checks each individually deny; sessions regenerate on login and role switch; throttles verified by test.
3. **Authorization:** every `/api/v1` route has a passing denial test (meta-test green); role-conflict matrix blocks all seeded pairs; Audit role cannot mutate anything; Finance cannot validate own declarations; frontend-bypassed raw HTTP requests are denied server-side.
4. **Clinical integrity:** full outpatient chain E2E passes; closure verification blocks each unmet requirement; finalized records reject direct SQL updates (trigger evidence); amendments version and preserve originals.
5. **Financial integrity:** no manual invoice route exists; receipts only follow Finance validation; duplicate declarations are idempotent-rejected; credit notes bounded; ledger entries balance (property test); paid invoices immutable; Platform Scope §37.1–37.3, §37.5 acceptance criteria pass verbatim.
6. **Platform billing:** fee accrual traces to validated receipts; tier config versioned and Super-Admin-only; settlement via Wallet webhook and manual evidence both validated by Super Admin; transparency ledger visible to merchant Finance; no patient-facing surface can serialize platform-billing data (architecture test).
7. **Integrations:** Wallet webhook signature verification enforced (failure → 401 + security event); Curis contains no payment-provider SDK or callback (dependency scan + route inventory evidence); R&E events signed, idempotent, PHI-free (validator test); attribution locks at tenant creation; central-outage flows pass.
8. **UI:** responsive sweeps (375/768/1280) pass on all portal core screens with no horizontal scroll; light/dark themes pass axe contrast; keyboard-only walkthrough completes core flows; zoom to 200% remains usable.
9. **Operations:** CI runs lint, static analysis, security scans, full test suites; deploy → staging → production pipeline executed with health gates; restore-from-backup drill completed within RTO ≤ 4h, RPO ≤ 15min evidence; downtime-safeguard drill completed; Horizon, scheduler heartbeats, alerting live.
10. **Observability:** audit chain verification green in production; log redaction verified; Sentry receiving tagged releases; dashboards show the Section 22.1 panels.
11. **Performance:** k6 evidence meets Section 23.1 targets at the specified concurrency.
12. **Launch controls:** activation checklist gate, break-glass, audit export, duplicate merge, reconciliation snapshots, staff responsibility check — all demonstrated.

---

## 30. Risk Register with Mitigation Steps

| # | Risk | Likelihood | Impact | Mitigation | Trigger to escalate |
| --- | --- | --- | --- | --- | --- |
| R1 | Cross-tenant data exposure | Low (layered controls) | Severe | Section 8 layers; generated isolation suite as deploy gate; quarterly manual pen-test of new endpoints | any isolation test failure |
| R2 | Workflow bypass (unbilled dispensing, invalid prescriptions) | Medium without enforcement | High | state-machine-only transitions; no manual invoice route; DB constraints | audit anomaly report |
| R3 | Payment-validation fraud/collusion | Medium | High | separation of duties, declarant≠validator, step-up reauth, evidence capture, anomaly flags | fraud flag volume |
| R4 | Immutability defeated via ops access | Low | Severe | DB triggers + revoked grants + hash chain + nightly verification + restricted prod DB access | chain mismatch alert |
| R5 | Wallet sandbox/production readiness slips (A5) | Medium | Medium | manual-evidence settlement path ships independently; contract tests from spec fixtures | Phase 24 gate date |
| R6 | R&E readiness slips (A6) | Medium | Low-Medium | durable outbox queues events; attribution captured locally; replay on availability | outbox age alert |
| R7 | Clinical staff adoption resistance | Medium | High | fast structured forms, autosave, keyboard shortcuts, onboarding playbooks, usage dashboards | visit-entry latency metrics |
| R8 | Vitals/result validation false-rejects | Medium | Medium (safety) | clinically reviewed bounds; soft-warn vs hard-reject split; override with reason audited | override rate |
| R9 | Notification provider failures | Medium | Medium (auth depends on email/SMS) | multi-provider failover for auth-critical messages; queue+retry; delivery dashboards | delivery failure rate |
| R10 | Performance misses at scale | Medium | Medium | Section 23.2 pre-identified mitigations; k6 gates; partitioning | k6 regression |
| R11 | Migration data loss | Low | Severe | expand/contract, PITR backups, staging rehearsal, restore drills | failed migration |
| R12 | Dependency vulnerability | Medium | Medium-High | CI scans, Dependabot, weekly scheduled scans, image scanning | critical CVE alert |
| R13 | Scope creep vs governing specs | Medium | Medium | precedence rules in header; RTM; ADR discipline; open-questions log instead of guessing | RTM drift in review |
| R14 | AI feature overreach | Low | Severe (clinical safety) | Section 31 scope: draft-only, marked, human-finalized; finalize-requires-human test | any autonomous output |
| R15 | Support saturation post-launch | High | Medium | FAQ deflection, severity triage, support-volume dashboards, V2 tooling plan | ticket volume |
| R16 | Key personnel / bus factor | Medium | Medium | ADRs, runbooks, this plan as source of truth, pairing on financial core | review coverage |
| R17 | eTIMS spec uncertainty (A7) | Medium | Low (MVP is eTIMS-ready only) | metadata modeled from published guidance; flagged fields; V2 live integration isolated | KRA spec publication |
| R18 | Regulatory/data-protection change | Low-Medium | Medium | configurable retention, consent records, legal review cadence, DPA-aligned controls | legal review finding |

---

## 31. Final Verification Checklist

Executed at Phase 27; every line requires linked evidence in `docs/evidence/phase-27/`. All must be ✅ before first production tenant activation.

**Isolation & Access**
- [ ] Generated tenant-isolation suite green in CI and against staging
- [ ] All Section 8.3 denied cases demonstrated with raw HTTP evidence
- [ ] Route-authorization coverage meta-test green (zero uncovered routes)
- [ ] Role-conflict matrix denials demonstrated per pair
- [ ] Audit role mutation attempts denied across modules
- [ ] Break-glass: reason-mandatory, time-boxed, audited, notified, reviewed — demonstrated

**Authentication**
- [ ] Staff eligibility checks (8) individually verified
- [ ] Magic-link expiry/reuse/tamper denials verified
- [ ] Patient OTP throttle/lockout verified; device revocation works
- [ ] Session regeneration at login and role-switch verified
- [ ] Super Admin TOTP + IP allowlist verified

**Clinical & Financial Integrity**
- [ ] Outpatient chain E2E recording (registration → receipt → fee accrual)
- [ ] Immutability triggers proven by direct-SQL rejection on: finalized notes, issued invoices, receipts, journal lines, dispensing records, audit events
- [ ] Closure-verification blocks each unmet requirement
- [ ] Credit-note bounds and proportional tax reversal verified
- [ ] Ledger balance property test green; period close/reopen controls verified
- [ ] Admission consolidated bill = Σ charge events verified

**Platform Billing & Integrations**
- [ ] Fee accrual traceable to receipts; floor logic verified
- [ ] Curis invoice cycle executed in sandbox with Wallet-confirmed settlement
- [ ] Manual settlement-evidence path verified
- [ ] Wallet webhook signature-failure → 401 + security event verified
- [ ] Zero payment-provider SDKs/callbacks in codebase (scan evidence)
- [ ] R&E event stream validated against sandbox; PHI-leak validator test green
- [ ] Attribution lock and outage flows verified

**UI/UX/A11y**
- [ ] Responsive sweeps pass all portals' core screens (375/768/1280)
- [ ] Dark and light themes AA-verified; flash-free theme boot
- [ ] axe clean on design system + 12 core pages; keyboard walkthrough complete; NVDA smoke complete
- [ ] Zoom 200% usable; viewport meta compliant

**Operations**
- [ ] CI/CD pipeline runs end-to-end with all gates
- [ ] Production deploy + rollback rehearsed
- [ ] Restore-from-backup drill: RPO ≤ 15 min, RTO ≤ 4 h evidence
- [ ] Downtime-safeguard drill evidence
- [ ] Alerting live: error spike, queue depth, outbox dead-letter, audit-chain mismatch, webhook failures, uptime
- [ ] Log redaction verified in production logs
- [ ] Secrets scan clean; dependency scan clean; image scan clean
- [ ] k6 performance evidence meets Section 23.1

**Launch**
- [ ] Tenant activation checklist gate demonstrated (Super Admin + Merchant Admin views)
- [ ] Merchant onboarding dry run completed
- [ ] Support email workflow verified
- [ ] Notification catalog delivering (email + approved SMS) with privacy-safe previews
- [ ] RTM final review: every Platform Scope section mapped to shipped code and tests

---

*End of plan. This document, the Platform Scope, the Wallet Spec, and the R&E Spec together constitute the complete implementation contract for Curis by Citrus. Where the Agent finds ambiguity not resolved by these documents, it must record the question and halt that task rather than guess.*



