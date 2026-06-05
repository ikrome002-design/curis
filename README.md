# Curis by Citrus

**Governed Healthcare. Executed Right.**

Curis by Citrus is a governed multi-tenant SaaS healthcare operating system for clinics, diagnostic centers, outpatient facilities, and pharmacy-enabled healthcare institutions. It standardizes clinical execution, patient flow, billing validation, pharmacy and laboratory workflows, role-based operations, and audit-ready governance inside one controlled platform.

Curis is designed for institutional discipline: every clinical action, financial event, user action, and patient-facing artifact should be attributable, traceable, governed, and defensible.

---

## Repository Status

**Product:** Curis by Citrus  
**Owner:** Citrus Labs Limited  
**Repository Type:** Private SaaS application repository  
**License:** Proprietary / All Rights Reserved  
**Target Stage:** MVP Lite  
**Primary Market Context:** Kenyan healthcare SMEs and emerging/mid-scale healthcare institutions  

This repository must remain private unless Citrus Labs Limited explicitly approves otherwise.

---

## Product Summary

Curis by Citrus is not a hospital ERP, not a standalone EMR, not a billing-only system, not a payment processor, not an insurance platform, and not a medical marketplace.

It is a governed healthcare execution environment that enables healthcare facilities to:

- Register and manage patients.
- Coordinate front-office patient flow.
- Capture triage assessments.
- Run physician consultations.
- Maintain electronic medical records.
- Generate prescriptions and lab requests.
- Validate pharmacy and laboratory execution.
- Generate patient invoices from governed service events.
- Validate payments without processing funds directly.
- Issue immutable receipts.
- Maintain branch-level and tenant-level operational visibility.
- Enforce role separation across clinical, operational, financial, and audit users.
- Compute and enforce Curis platform billing for merchants.
- Preserve audit-ready logs and reporting trails.

The platform’s operating principle is simple:

> Clinical and financial activity must be executed, validated, and governed inside a controlled system.

---

## MVP Lite Scope

Curis by Citrus must remain focused on essential launch functionality. The MVP Lite version should validate the platform concept, support early adoption, and deliver operational value without unnecessary complexity.

### Included in MVP Lite

| Domain | MVP Lite Capability |
|---|---|
| Multi-tenancy | Isolated healthcare merchant tenants with branch attribution |
| RBAC | Strict role-based access across merchant, branch, clinical, finance, audit, HR, pharmacy, lab, and patient accounts |
| Patient Management | Patient registration, profile management, visit history, receipts, and basic record access |
| Front Office | Registration, appointments, queue coordination, billing initiation, patient communication triggers |
| Triage | Vitals capture, presenting complaint, risk flags, priority classification, triage notes |
| Physician | Patient queue, session-based consultation, SOAP notes, diagnoses, prescriptions, lab requests, visit closure |
| Health Records | Health report generation, report requests, report delivery, historical report registration, patient data integrity control |
| Billing | Service pricing, invoice generation, payment declaration, finance validation, receipt generation, Curis fee computation |
| Pharmacy | Prescription validation, dispensing workflow, stock/batch/expiry tracking, billing trigger linkage |
| Laboratory | Lab service/product setup, lab request handling, result upload, patient record linkage |
| Dashboards | Real-time operational, clinical, financial, department, branch, and audit-facing visibility |
| Audit | User activity logs, immutable event trails, audit-ready reporting |
| Help & Support | Email-only support request flow restricted to HR users |
| Patient Authentication | Passwordless login using magic link + OTP, device binding, adaptive OTP for sensitive actions |

### Explicitly Excluded from MVP Lite

The following should not be built into the first deployable version unless the product owner explicitly moves them into scope:

- Full hospital ERP functionality.
- National EMR replacement workflows.
- Direct payment processing or custody of funds.
- Insurance underwriting or full claims adjudication.
- Medical marketplace functionality.
- Logistics, medical device, or broad supply-chain management.
- Full autonomous AI diagnosis.
- Full AI longitudinal risk modeling.
- Advanced predictive follow-up engines.
- Complex support ticketing, escalation dashboards, or live chat.
- Large-scale enterprise reporting suites beyond audit-ready MVP reporting.
- Non-essential UI personalization or decorative animations.

---

## System Boundaries

Curis validates and governs healthcare operations. It does not directly process money or assume the legal role of a medical provider, insurer, or payment processor.

### Curis Does

- Validate payment evidence.
- Generate system-derived invoices.
- Generate immutable receipts after finance validation.
- Attribute all financial and clinical events to tenant, branch, role, user, timestamp, and source workflow.
- Enforce platform billing logic for merchants.
- Maintain controlled access to patient records.
- Preserve audit logs.

### Curis Does Not

- Hold patient funds.
- Process card, M-Pesa, bank, or insurance payments directly as a payment processor.
- Underwrite insurance.
- Replace national health record mandates.
- Act as an autonomous medical decision maker.
- Expose Curis platform fees to patients.

---

## User and Authority Model

Curis uses a hierarchical healthcare governance model.

### 1. Curis Platform Layer

Owned and governed by **Citrus Labs Limited**.

Primary account:

- **Super Administrator**

Responsibilities:

- Platform governance.
- Global billing and enforcement rules.
- Merchant lifecycle control.
- Security and compliance oversight.
- Audit integrity.
- Platform billing enforcement.

### 2. Merchant Tenant Layer

Each healthcare facility operates as an isolated tenant.

Each tenant has:

- Its own clinical records.
- Its own financial records.
- Its own staff.
- Its own branches.
- Its own patient interactions.

Tenant data must not cross tenant boundaries.

### 3. Branch Layer

Branches are operational units inside a merchant tenant.

Branch-attributed entities include:

- Patient visits.
- Billing events.
- Inventory events.
- Staff activity.
- Pharmacy and laboratory availability.
- Departmental reporting.

### 4. Role Layer

Curis uses explicit, non-overlapping roles. No user should have unilateral control across clinical, billing, finance, and audit workflows.

| Role | Primary Responsibility |
|---|---|
| Super Administrator | Platform-wide governance, merchant lifecycle, billing enforcement |
| Merchant Administrator | Tenant-level governance, oversight, compliance, permissions |
| Branch Account | Branch structure, services, pricing, pharmacy/lab enablement |
| Front Office / Reception | Registration, appointments, queue coordination, billing initiation |
| Triage | Vitals, complaint structuring, priority classification, risk flags |
| Physician | Consultation, diagnosis, prescriptions, lab requests, visit closure |
| Pharmacy | Prescription validation, medication dispensing, pharmacy stock workflow |
| Laboratory | Lab request processing, service/product setup, result uploads |
| Inventory | Stock monitoring, batch/expiry control, inventory integrity |
| Finance | Payment validation, reconciliation, receipt locking, revenue control |
| Health Records | Health report generation, validation, archival integrity, external record merge |
| HR | Staff management and email-based support requests |
| Audit | Read-only visibility into logs, exports, billing trails, operational events |
| Patient | Record access, visit history, receipts, report/prescription requests |

---

## Core Functional Domains

### 1. Clinical Operations Engine

The clinical engine manages patient-facing medical workflows.

MVP capabilities:

- Electronic Medical Records.
- Consultation documentation.
- SOAP notes.
- Diagnosis capture.
- Treatment plans.
- Prescription creation.
- Lab request creation.
- Visit records.
- Longitudinal patient history.
- AI-assisted clinical summary generation during physician workflow.

Clinical artifacts should be session-bound wherever applicable. Prescriptions, lab requests, visit notes, summaries, and billing triggers should originate from controlled clinical or service execution contexts.

### 2. Front Office and Patient Flow

The front office domain manages patient movement before and after clinical execution.

MVP capabilities:

- Digital patient registration.
- Appointment scheduling.
- Queue creation and status tracking.
- Visit coordination.
- Billing initiation without price authority.
- Patient-facing notifications.
- Health report request initiation on behalf of a patient.
- Prescription request initiation on behalf of a patient.

Front Office users should not control pricing, validate final payments, modify clinical execution, or alter locked receipts.

### 3. Triage

The triage account is the clinical intake and risk-detection gateway.

MVP capabilities:

- Patient queue view.
- Start triage session.
- Vitals capture:
  - Blood pressure.
  - Pulse rate.
  - Temperature.
  - Respiratory rate.
  - Oxygen saturation.
  - Weight.
  - Height.
  - BMI auto-calculation.
- Presenting complaint structuring.
- Risk and red flag detection.
- Priority classification:
  - Routine.
  - Priority.
  - Urgent.
  - Emergency.
- Triage notes.
- Push structured data to physician consultation.
- Activity logging.

Triage users must not diagnose, prescribe, discharge, modify physician notes, or access billing dashboards.

### 4. Physician Consultation

The physician account is structured around active consultation sessions.

MVP capabilities:

- Patient queue.
- Start consultation.
- Active consultation workspace.
- Patient demographics and triage context.
- Structured SOAP notes.
- Diagnosis entry.
- Treatment plan.
- Prescription modal/workflow.
- Lab request modal/workflow.
- Patient history panel.
- Recent prescriptions and lab results.
- AI-assisted summary generation.
- End Session closure workflow.
- Immutable visit record creation.

Physicians must not modify pricing, access finance dashboards, edit invoices, or manipulate payment records.

### 5. Health Records

The Health Records account is the archival authority for patient-facing medical truth.

MVP capabilities:

- Automatic health report generation after completed doctor visits.
- Health report review and state tracking.
- Health report requests from patient account or front office.
- Softcopy delivery through patient account and email.
- Printed copy fulfillment through Front Office.
- Historical health report upload and registration.
- Provenance metadata for externally sourced reports.
- External medical data ingestion and validation.
- Patient record merge and duplicate resolution, when implemented.

Health reports must be timestamped, branch-attributed, role-controlled, and immutable once finalized.

### 6. Billing, Revenue, and Finance

Curis billing is event-driven. Billing starts from clinical or service execution, not from arbitrary finance entry.

MVP capabilities:

- Branch service pricing.
- Chargeability control.
- Zero-price items treated as non-chargeable.
- Automated patient invoice generation.
- Payment declaration by Front Office.
- Payment validation by Finance.
- Receipt generation after validation.
- Invoice locking.
- Revenue reconciliation.
- Curis service fee computation.
- Merchant-facing Curis billing ledger.
- Billing cycles:
  - Weekly.
  - Bi-weekly.
  - Monthly.
- Early payment discount logic.
- Late fee and penalty logic.

Curis does not process payments directly. It validates payment evidence and records financial truth.

### 7. Pharmacy

The pharmacy domain governs prescription fulfillment and medication-related billing triggers.

MVP capabilities:

- Electronic prescription validation.
- Prescription status tracking.
- Drug/product catalog management.
- Batch and expiry tracking.
- Stock availability verification.
- Medication dispensing.
- Dispensing record lock after confirmation.
- Automatic pharmacy invoice generation after dispensing.
- Linkage to patient record, invoice, receipt, and audit trail.

Pharmacy users must not edit pricing, override invoice totals, or validate final payments.

### 8. Laboratory

The laboratory domain manages diagnostic service setup and result publication.

MVP capabilities:

- Lab service/product creation.
- Purchase price capture.
- Request pricing from Branch Account.
- Lab request intake.
- Lab test status tracking.
- Result upload.
- Result linkage to patient records.
- Physician notification when results are available.

Laboratory users should not directly define final patient pricing unless authorized by branch pricing workflow.

### 9. Management, Analytics, and Oversight

MVP dashboards should provide enough visibility for operational control without becoming a complex BI suite.

MVP capabilities:

- Operational dashboards.
- Clinical KPIs.
- Financial KPIs.
- Department-level metrics.
- Branch-level metrics.
- User activity logs.
- Audit-ready reports.
- Daily branch reconciliation snapshot, when implemented.

### 10. Help and Support

MVP support is deliberately lean.

Capabilities:

- Basic FAQs.
- HR-only support request form.
- Merchant context capture.
- Affected merchant email capture.
- Description field.
- Pre-filled email generation to platform support.

Excluded:

- Ticketing system.
- Escalation workflows.
- Support dashboards.
- Live chat.

---

## Billing Execution Model

Curis billing follows a governed chain:

```text
Clinical / Service Event
    -> Cart Aggregation
    -> Invoice Generation
    -> Payment Declaration
    -> Finance Validation
    -> Receipt Generation
    -> Curis Fee Computation
    -> Merchant Settlement
    -> Audit Trail
```

### Billing Rules

- No invoice without a source clinical or service trigger.
- No price without branch pricing configuration.
- No payment without validation.
- No receipt without finance confirmation.
- No Curis commission without paid or partially paid revenue.
- No silent VAT duplication.
- No post-lock invoice editing.
- No patient visibility into Curis platform fees.

### Patient-Merchant Billing

Patient-facing billing should include:

- Facility name.
- Branch.
- Patient identity.
- Service line items.
- Unit prices.
- Discounts.
- Tax breakdown where applicable.
- Total payable amount.
- Invoice status.
- Receipt ID after payment validation.

### Merchant-Curis Billing

Merchant-facing Curis billing should include:

- Revenue processed through Curis.
- Tier percentage applied.
- Platform floor enforcement.
- Early payment discount eligibility.
- Penalties where applicable.
- Billing cycle state.
- Read-only billing ledger.

---

## Authentication and Security Model

### Patient Authentication

Curis Patient Accounts should use passwordless authentication.

MVP model:

- Email or phone identifier.
- Magic login link.
- One-time verification code.
- SMS or email delivery preference.
- Magic link expiry.
- OTP expiry.
- Device trust registration.
- Adaptive OTP for sensitive actions.

Sensitive actions requiring stronger verification may include:

- Downloading health reports.
- Viewing invoices or receipts.
- Sharing records externally.
- Requesting prescriptions.
- Changing email or phone number.

Patient login must not allow:

- Password-only login.
- SMS-only enforced login.
- Social login.
- Role mixing with merchant/staff accounts.
- Email or phone change without re-verification.

### Merchant and Staff Authentication

Merchant and staff accounts should use stronger operational security than patient accounts.

Recommended baseline:

- Email + password or enterprise-controlled login.
- Mandatory MFA for privileged roles.
- Device/IP logging.
- Session timeout.
- Role-specific route protection.
- Audit logging for authentication and sensitive actions.

Privileged roles requiring stricter controls:

- Super Administrator.
- Merchant Administrator.
- Branch Account.
- Finance.
- Health Records.
- Audit.
- HR.

---

## Security and Compliance Rules

Curis handles sensitive healthcare and financial data. The repository must never contain live secrets, patient records, tenant exports, payment evidence, production logs, or audit exports.

### Non-Negotiable Security Rules

- Do not commit `.env` files.
- Do not commit patient data.
- Do not commit production database dumps.
- Do not commit receipts, health reports, invoices, or audit exports.
- Do not commit private keys, certificates, tokens, or credentials.
- Do not log raw OTP codes.
- Do not expose Curis platform fees to patients.
- Do not allow cross-tenant data access.
- Do not allow role escalation outside RBAC policy.
- Do not allow silent edits to finalized clinical or financial records.
- Do not allow direct database edits in production except controlled migrations and audited maintenance workflows.

### Protected Data Classes

| Data Class | Protection Requirement |
|---|---|
| Patient demographics | Tenant-isolated, role-restricted |
| Clinical notes | Timestamped, attributed, immutable after finalization where applicable |
| Health reports | Role-controlled, provenance-tracked, immutable once finalized |
| Prescriptions | Session-bound, pharmacy-visible only when authorized |
| Lab results | Linked to patient record and physician workflow |
| Invoices | Generated from source events, locked after validation |
| Receipts | Immutable after finance validation |
| Audit logs | Append-only and export-controlled |
| Payment evidence | Restricted to finance and authorized audit users |
| Curis fee ledger | Merchant/Admin visible only, never patient-visible |

---

## Recommended Technical Stack

The source specification references Laravel implementation difficulty for patient authentication. The following stack is the recommended baseline for this repository unless the engineering team has already approved a different architecture.

### Backend

- PHP 8.3+
- Laravel 11 or newer
- Laravel Sanctum or Passport, depending on API strategy
- Laravel Queues
- Laravel Scheduler
- Laravel Policies / Gates for RBAC enforcement
- Laravel Events and Listeners for workflow state transitions

### Frontend

- Blade + Livewire, or
- Vue / React with Inertia, or
- Vite-powered frontend assets

### Database

Recommended options:

- PostgreSQL for stronger relational integrity and healthcare-grade auditability, or
- MySQL/MariaDB where operational familiarity is prioritized.

Recommended supporting services:

- Redis for queues, cache, rate limiting, and session acceleration.
- Object storage for reports, attachments, receipts, and private files.
- Mail service for notifications, OTP delivery, support requests, and patient report delivery.
- SMS provider for OTP and patient notifications.

### Infrastructure

Recommended baseline:

- Linux server or containerized deployment.
- Nginx or Caddy reverse proxy.
- PHP-FPM.
- Supervisor for queue workers.
- Cron for Laravel Scheduler.
- Encrypted backups.
- Private object storage.
- Centralized log monitoring.
- Database snapshots with strict access control.

---

## Suggested Repository Structure

Actual structure may differ based on the chosen Laravel/frontend implementation.

```text
curis-by-citrus/
├── app/
│   ├── Actions/
│   ├── Console/
│   ├── Domains/
│   │   ├── Audit/
│   │   ├── Billing/
│   │   ├── Branches/
│   │   ├── Clinical/
│   │   ├── Finance/
│   │   ├── FrontOffice/
│   │   ├── HealthRecords/
│   │   ├── Inventory/
│   │   ├── Laboratory/
│   │   ├── Notifications/
│   │   ├── Patients/
│   │   ├── Pharmacy/
│   │   ├── Platform/
│   │   ├── Support/
│   │   ├── Tenancy/
│   │   └── Triage/
│   ├── Http/
│   ├── Jobs/
│   ├── Mail/
│   ├── Models/
│   ├── Notifications/
│   ├── Policies/
│   ├── Providers/
│   └── Services/
├── bootstrap/
├── config/
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
├── docs/
│   ├── architecture/
│   ├── billing/
│   ├── compliance/
│   ├── deployment/
│   ├── product/
│   └── security/
├── public/
├── resources/
│   ├── css/
│   ├── js/
│   └── views/
├── routes/
│   ├── api.php
│   ├── auth.php
│   ├── console.php
│   ├── patient.php
│   ├── platform.php
│   ├── tenant.php
│   └── web.php
├── storage/
├── tests/
│   ├── Feature/
│   ├── Unit/
│   └── Security/
├── .env.example
├── .gitignore
├── composer.json
├── package.json
├── README.md
└── vite.config.js
```

---

## Environment Variables

Create a sanitized `.env.example`. Never commit real secrets.

```env
APP_NAME="Curis by Citrus"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

APP_TIMEZONE=Africa/Nairobi
APP_LOCALE=en

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=curis_local
DB_USERNAME=curis
DB_PASSWORD=

CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=30

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

FILESYSTEM_DISK=local
PRIVATE_FILES_DISK=local
REPORTS_DISK=local
RECEIPTS_DISK=local
AUDIT_EXPORTS_DISK=local

MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@curis.ke
MAIL_FROM_NAME="Curis by Citrus"

SMS_PROVIDER=
SMS_API_KEY=
SMS_SENDER_ID=CURIS

OTP_EXPIRY_MINUTES=5
MAGIC_LINK_EXPIRY_MINUTES=10
PATIENT_SESSION_IDLE_TIMEOUT_MINUTES=30

CURIS_PLATFORM_URL=https://curis.citruslabs.limited
CURIS_PATIENT_URL=https://curis.ke
CURIS_SUPPORT_EMAIL=support@citruslabs.limited

TENANCY_MODE=single_database_or_multi_database
TENANT_IDENTIFICATION=strategy_placeholder

BILLING_DEFAULT_CURRENCY=KES
CURIS_BILLING_VAT_ENABLED=true
CURIS_BILLING_DEFAULT_VAT_RATE=16

PAYMENT_VALIDATION_MODE=evidence_only
MPESA_VALIDATION_ENABLED=false
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=

AI_SUMMARY_ENABLED=false
AI_PROVIDER=
AI_API_KEY=
```

---

## Local Development Setup

These commands assume a Laravel + Node/Vite implementation.

### 1. Clone the repository

```bash
git clone git@github.com:<organization>/curis-by-citrus.git
cd curis-by-citrus
```

### 2. Install backend dependencies

```bash
composer install
```

### 3. Install frontend dependencies

```bash
npm install
```

### 4. Create environment file

```bash
cp .env.example .env
php artisan key:generate
```

### 5. Configure database

Update the following in `.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=curis_local
DB_USERNAME=curis
DB_PASSWORD=your_local_password
```

### 6. Run migrations and seeders

```bash
php artisan migrate --seed
```

Recommended seeders:

- Platform roles.
- Merchant roles.
- Default permissions.
- Sample tenant.
- Sample branch.
- Default service categories.
- Default billing cycles.
- Default audit event types.

### 7. Link storage

```bash
php artisan storage:link
```

Only public-safe files should ever be exposed through public storage. Patient reports, receipts, payment evidence, audit exports, and clinical attachments must remain private.

### 8. Start development server

```bash
php artisan serve
```

### 9. Start frontend dev server

```bash
npm run dev
```

### 10. Start queue worker

```bash
php artisan queue:work
```

### 11. Run scheduler locally

```bash
php artisan schedule:work
```

---

## Testing

Run backend tests:

```bash
php artisan test
```

Run frontend build validation:

```bash
npm run build
```

Recommended test suites:

```text
tests/
├── Feature/
│   ├── Auth/
│   ├── Billing/
│   ├── Clinical/
│   ├── Finance/
│   ├── HealthRecords/
│   ├── Pharmacy/
│   ├── Laboratory/
│   ├── Tenancy/
│   └── Triage/
├── Security/
│   ├── RbacTest.php
│   ├── TenantIsolationTest.php
│   ├── PatientRecordAccessTest.php
│   ├── ReceiptImmutabilityTest.php
│   └── AuditLogIntegrityTest.php
└── Unit/
```

Minimum critical tests before deployment:

- Tenant isolation cannot be bypassed.
- Role conflict rules work.
- Patients cannot see Curis platform fees.
- Front Office cannot validate payments.
- Pharmacy cannot edit pricing.
- Physician cannot edit invoices.
- Finance cannot alter clinical notes.
- Audit users are read-only.
- Receipts are immutable after validation.
- Health reports preserve provenance and finalization state.
- Invoice generation fails when pricing is missing.
- Billing events remain branch-attributed.
- OTP expiry and throttling work.

---

## Deployment Checklist

Before production deployment:

### Repository

- [ ] Repository is private.
- [ ] Proprietary license file exists.
- [ ] `.gitignore` excludes secrets, PHI, exports, logs, reports, receipts, and production artifacts.
- [ ] `.env` is not committed.
- [ ] `.env.example` is sanitized.
- [ ] No patient data exists in seeders, fixtures, tests, screenshots, or documentation.
- [ ] No production credentials exist in commit history.

### Application

- [ ] `APP_ENV=production`.
- [ ] `APP_DEBUG=false`.
- [ ] Secure `APP_KEY` generated.
- [ ] HTTPS enforced.
- [ ] Secure cookies enabled.
- [ ] Session timeout configured.
- [ ] Queue worker supervised.
- [ ] Scheduler active.
- [ ] Rate limiting enabled.
- [ ] OTP throttling enabled.
- [ ] Patient passwordless login configured.
- [ ] Staff privileged MFA configured.

### Database

- [ ] Production database isolated.
- [ ] Backups encrypted.
- [ ] Backup restore tested.
- [ ] Least-privilege DB user configured.
- [ ] Migration execution process controlled.
- [ ] Audit tables protected from destructive operations.

### Storage

- [ ] Private disks configured for clinical reports.
- [ ] Private disks configured for receipts.
- [ ] Private disks configured for payment evidence.
- [ ] Private disks configured for audit exports.
- [ ] Public storage limited to safe assets only.

### Security

- [ ] RBAC permissions seeded and reviewed.
- [ ] Tenant isolation tested.
- [ ] Cross-role access tests passing.
- [ ] Sensitive downloads require authorization.
- [ ] Sensitive actions logged.
- [ ] Audit exports restricted.
- [ ] Error pages do not leak stack traces.
- [ ] Logs do not include OTPs, tokens, patient data, or payment evidence.

### Billing

- [ ] Branch pricing configured.
- [ ] Curis billing tiers configured.
- [ ] Billing cycles configured.
- [ ] Invoice generation tested.
- [ ] Payment validation tested.
- [ ] Receipt locking tested.
- [ ] Curis fee computation tested.
- [ ] Patient fee visibility restrictions tested.

### Operational Readiness

- [ ] Super Administrator account created.
- [ ] Merchant activation checklist implemented.
- [ ] At least one branch configured.
- [ ] Finance account configured.
- [ ] HR account configured.
- [ ] At least one clinical user configured.
- [ ] Pharmacy/lab enablement decision configured per branch.
- [ ] Basic support email flow tested.

---

## GitHub Push Checklist

Before pushing to GitHub:

```bash
git status
```

Verify no sensitive files are staged:

```bash
git diff --cached --name-only
```

Add safe files:

```bash
git add README.md .gitignore .env.example LICENSE
```

Commit:

```bash
git commit -m "Initialize Curis by Citrus repository documentation"
```

Push:

```bash
git branch -M main
git remote add origin git@github.com:<organization>/curis-by-citrus.git
git push -u origin main
```

When sensitive files were accidentally committed, do not rely on deleting them in a later commit. Rotate exposed credentials and rewrite history using an approved secret-removal process before making the repository available to collaborators.

---

## Branching Strategy

Recommended branch model:

```text
main                 Production-ready code only
develop              Integration branch
feature/<scope>      New MVP features
fix/<scope>          Bug fixes
security/<scope>     Security patches
release/<version>    Release preparation
hotfix/<scope>       Urgent production fixes
```

Examples:

```text
feature/patient-passwordless-login
feature/branch-pricing-management
feature/finance-payment-validation
feature/health-report-requests
security/rbac-tenant-isolation
fix/invoice-locking
```

---

## Commit Message Convention

Recommended format:

```text
<type>(<scope>): <summary>
```

Types:

- `feat`
- `fix`
- `docs`
- `security`
- `refactor`
- `test`
- `chore`
- `deploy`

Examples:

```text
feat(billing): add payment validation workflow
feat(triage): add vitals capture session
security(rbac): enforce finance-only receipt validation
fix(pharmacy): prevent dispensing against expired prescriptions
docs(readme): document MVP Lite scope
```

---

## Coding Standards

Recommended standards:

- Follow PSR-12 for PHP.
- Use strict typing where practical.
- Keep domain logic out of controllers.
- Use policies/gates for authorization.
- Use form requests for validation.
- Use service/action classes for workflows.
- Use database transactions for clinical-financial state changes.
- Use events for cross-domain workflow propagation.
- Use queues for notifications, report generation, and heavy non-blocking tasks.
- Keep patient-facing language clear, calm, and non-technical.
- Keep operational screens precise and role-specific.

---

## Domain Workflow Rules

### Clinical Rules

- No prescription outside a valid clinical/session context unless explicitly supported by a governed prescription request workflow.
- No lab request outside a valid clinical/session context unless explicitly supported by a governed request workflow.
- No silent overwrite of finalized clinical records.
- Health Records controls patient-facing health report integrity.
- Triage users cannot diagnose.
- AI output is advisory, not authoritative.

### Billing Rules

- Billing originates from service or clinical execution.
- Prices come from branch configuration.
- Finance validates payments.
- Receipts are generated only after validation.
- Receipts are immutable.
- Patients do not see Curis platform fees.
- Curis fee computation is merchant-facing only.
- Invoice reversals after payment require credit-note or governed adjustment workflow.

### Audit Rules

- Sensitive events must be logged.
- Logs must include actor, role, branch, tenant, timestamp, and event type where applicable.
- Audit users are read-only.
- Audit exports must be controlled and logged.
- No silent data extraction.

---

## Brand and UI Direction

Curis should feel institutional, precise, calm, and controlled.

### Tone

- Calm.
- Precise.
- Controlled.
- Institutional.
- Declarative.

Avoid:

- Playful language.
- Casual copy.
- Exaggerated marketing claims.
- “Magic” or “revolutionary” positioning.
- Leading with AI.

### Visual Identity

Primary colors:

- Curis Blue: `#0B5ED7`
- Curis Green: `#22C55E`

Secondary/structural colors:

- Deep Navy: `#0F172A`
- Slate Grey: `#334155`
- Pure White: `#FFFFFF`

State colors:

- Teal Glow: `#14B8A6`
- Amber: `#F59E0B`
- Red: `#DC2626`

Typography:

- Preferred: Inter
- Acceptable: Source Sans 3
- Numbers should be monospaced where possible.

Patient-facing screens should use more white space, larger typography, and minimal data density. Audit, finance, and reports should feel structured, timestamped, restrained, and court-defensible.

---

## Documentation to Maintain

Recommended documentation files:

```text
docs/
├── architecture/
│   ├── tenancy.md
│   ├── rbac.md
│   ├── domains.md
│   └── workflow-events.md
├── billing/
│   ├── billing-engine.md
│   ├── invoice-generation.md
│   ├── payment-validation.md
│   └── curis-fee-ledger.md
├── clinical/
│   ├── triage.md
│   ├── physician-consultation.md
│   ├── prescriptions.md
│   ├── lab-requests.md
│   └── health-records.md
├── security/
│   ├── authentication.md
│   ├── authorization.md
│   ├── audit-logging.md
│   └── data-protection.md
├── deployment/
│   ├── production-checklist.md
│   ├── backup-restore.md
│   └── queue-workers.md
└── product/
    ├── mvp-lite-scope.md
    ├── non-mvp-backlog.md
    └── brand-guidelines.md
```

---

## Known Implementation Priorities

Recommended build sequence:

1. Platform foundation.
2. Tenant and branch model.
3. RBAC and permissions.
4. Patient registration and patient account authentication.
5. Front Office patient flow.
6. Triage session workflow.
7. Physician consultation session workflow.
8. Health Records and report generation.
9. Branch service/pricing management.
10. Billing engine and invoice generation.
11. Finance payment validation and receipts.
12. Pharmacy prescription validation and dispensing.
13. Laboratory request/result workflow.
14. Audit logs and dashboards.
15. Curis billing ledger and merchant settlement workflow.
16. Deployment hardening.

---

## License

This project is proprietary software owned by **Citrus Labs Limited**.

All rights are reserved. No part of this software may be copied, modified, distributed, sublicensed, hosted, reverse engineered, or used without prior written authorization from Citrus Labs Limited.

A separate `LICENSE` file should be included in the repository.

---

## Maintainers

**Citrus Labs Limited**  
Product: **Curis by Citrus**  
Tagline: **Governed Healthcare. Executed Right.**

---

## Final Repository Warning

This codebase is expected to handle protected healthcare records, sensitive billing data, tenant-isolated institutional records, and audit-relevant operational events.

Treat every commit as production-sensitive.

Do not push secrets.  
Do not push patient data.  
Do not push tenant exports.  
Do not push generated receipts.  
Do not push audit exports.  
Do not weaken RBAC for convenience.

Nothing happens outside the system.
