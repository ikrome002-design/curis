# Curis by Citrus

## Platform Project Scope

**Product:** Curis by Citrus — Multi-Tenant Healthcare Operating System
**Owner:** Citrus Labs Limited
**Document type:** Platform Project Scope (implementation blueprint)
**Structural baseline:** Product Technical Details v.2
**Governing integrations:** Wallet by Citrus Platform Project Scope; Citrus Refer & Earn Platform Specification
**Precedence rule:** Where any requirement in this document conflicts with the Wallet by Citrus Platform Project Scope or the Refer & Earn Project Scope, the Wallet by Citrus and Refer & Earn specifications shall prevail for the functionality they govern.

---

# 1. Executive Summary

Curis by Citrus is a multi-tenant healthcare SaaS web platform created, owned, and operated by Citrus Labs Limited. It is a governed healthcare operating system that connects patient intake, triage, clinical consultation, prescriptions, diagnostics, pharmacy dispensing, health records, inventory, billing, payment validation, patient access, merchant oversight, and Curis platform billing within one role-separated and audit-defensible execution environment.

Curis serves healthcare institutions operating across outpatient, diagnostic, pharmaceutical, specialist, and controlled inpatient contexts. Each participating healthcare institution operates as an independently governed merchant tenant with its own branches, staff, patients, clinical activity, inventory, invoices, receipts, audit trail, and platform-billing obligations.

The central operating principle of Curis is:

> **All clinical, operational, and financial activity must be executed, attributed, validated, and governed inside a controlled, role-separated system.**

The platform enforces this principle through:

1. Strict healthcare-isolated multi-tenancy with tenant-ID enforcement on every tenant-owned record.
2. Branch attribution of every operational event.
3. A role-based access-control model with server-side enforcement and a role-conflict engine.
4. A clinical execution chain in which no clinical artifact exists outside a valid patient, visit, branch, and session context.
5. System-derived billing in which no invoice exists without a valid clinical, pharmaceutical, diagnostic, records, admission, or approved administrative service trigger.
6. An off-platform payment boundary in which Curis records and validates payments but never holds or processes patient funds.
7. Immutable receipts, finalized clinical records, audit events, and financial postings.
8. A separate, Super-Administrator-governed Curis platform-billing layer with tiered onboarding fees, performance-based fees, and minimum monthly floors.
9. Integration with Wallet by Citrus for all Citrus-side money movement and with Citrus Refer & Earn for merchant-acquisition attribution.

This document is the complete execution blueprint for product design, UX and UI design, software architecture, database design, API design, backend implementation, frontend implementation, security implementation, DevOps implementation, quality assurance, user-acceptance testing, merchant onboarding, clinical workflow validation, production deployment, and product launch.

The launch scope defined in this document (MVP Lite) includes the full outpatient clinical chain, Pharmacy, Laboratory, Inventory, Health Records, Finance, Audit, HR, Front Office, Triage, Physician, Admissions and Ward Management, the five specialist department accounts (Optician, Mental Health, Nutrition, Maternal and Child Health, Dentistry), the Curis Patient Account, Curis platform billing, and an eTIMS-ready invoice structure. Live eTIMS submission is deferred to Version 2.

---

# 2. Product Purpose

The purpose of Curis is to provide a controlled healthcare execution environment that:

1. Preserves longitudinal patient medical records.
2. Improves clinical data completeness and integrity.
3. Prevents untraceable clinical actions.
4. Ensures clinical actions occur within valid patient and visit contexts.
5. Connects clinical activity to deterministic billing events.
6. Separates clinical authority from financial authority.
7. Prevents unauthorized price manipulation.
8. Reduces unbilled services and medication dispensing.
9. Validates payments without processing or holding patient funds.
10. Provides patients with secure access to approved records, invoices, receipts, prescriptions, and health reports.
11. Provides healthcare facilities with branch-attributed clinical, operational, and financial oversight.
12. Provides Citrus Labs Limited with a technically enforceable platform-billing and merchant-governance layer.
13. Produces immutable, attributable, and legally defensible audit records.
14. Supports healthcare institutions without attempting to replace national health infrastructure or professional clinical judgment.

---

# 3. Product Vision

Curis shall become the clinical, administrative, financial, records-management, and governance backbone of each participating healthcare institution. The vision is a healthcare execution layer in which:

1. Every patient interaction has a valid context.
2. Every clinical action has an accountable actor.
3. Every finalized clinical record is preserved.
4. Every charge originates from an approved service or healthcare event.
5. Every payment is validated before receipt issuance.
6. Every branch remains operationally attributable.
7. Every staff user remains role-bound.
8. Every Curis fee remains traceable to governed merchant activity.
9. Every critical action remains audit-ready.
10. Every patient sees only approved patient-facing information.
11. No operational role has unilateral control over the complete clinical-to-financial chain.

Target healthcare facilities include: solo medical practitioners; small and medium-sized outpatient clinics; multi-branch clinics; specialist medical centres; diagnostic centres; medical laboratories; clinic-operated pharmacies; dental practices; optician and eye-care practices; mental-health practices; nutrition and wellness clinics; maternal and child health facilities; multi-department private healthcare facilities; and other appropriately licensed healthcare institutions.

---

# 4. Business Objectives

1. Standardize how healthcare facilities register and identify patients, schedule appointments, manage queues, conduct triage and consultations, capture structured clinical notes, record diagnoses and treatment plans, issue prescriptions, order and receive laboratory tests, dispense medication, manage health records, generate patient health reports, track inventory, generate system-derived invoices, record and validate off-platform payments, issue immutable receipts, and reconcile facility revenue.
2. Establish a defensible, recurring Curis platform-revenue stream through tiered onboarding fees, performance-based fees on revenue processed through Curis, and minimum monthly platform floors, all configured and enforced exclusively by the Super Administrator.
3. Reduce merchant revenue leakage by eliminating unbilled services, unbilled dispensing, untraceable price changes, and unvalidated payments.
4. Create a healthcare data asset of longitudinal, provenance-preserving patient records under strict tenant isolation and privacy controls.
5. Enable merchant acquisition through the Citrus Refer & Earn platform by emitting trusted, signed merchant-lifecycle and billing events.
6. Route all Citrus-side money movement — onboarding fees, platform-fee settlements, and Curis-fee refunds — through Wallet by Citrus rather than product-local payment logic.
7. Support scale from a single solo practice to multi-branch, multi-department healthcare institutions without architectural rework.

---

# 5. Healthcare Problems Addressed

1. **Fragmented patient records.** Paper files, unstructured notes, and disconnected systems fragment the patient's longitudinal history. Curis binds every clinical artifact to a patient, visit, branch, actor, and timestamp.
2. **Untraceable clinical actions.** Actions performed outside a controlled system cannot be attributed or defended. Curis prohibits clinical artifacts outside valid sessions.
3. **Revenue leakage.** Services rendered without invoices, medication dispensed without billing, and prices altered without trace erode facility revenue. Curis derives invoices from system events and locks pricing snapshots.
4. **Unverified payments.** Cash and mobile-money payments declared but never verified create reconciliation gaps. Curis routes every payment declaration through Finance validation before any receipt exists.
5. **Role concentration.** One person controlling intake, clinical work, pricing, and payment validation invites error and fraud. Curis enforces separation of duties with a role-conflict engine.
6. **Branch opacity.** Multi-branch facilities lose visibility of where events occurred. Curis attributes every operational event to a branch.
7. **Unaccountable inventory.** Medication and consumable stock disappears without batch-level movement records. Curis maintains immutable stock-movement histories.
8. **Inaccessible patient information.** Patients cannot obtain their own records, receipts, or reports. Curis provides a secure patient portal with approved patient-facing information.
9. **Audit indefensibility.** Facilities cannot produce timestamped, attributable evidence of who did what. Curis produces immutable, exportable audit records.
10. **Platform-fee opacity.** SaaS platform fees calculated outside governed data invite disputes. Curis derives platform fees from validated merchant revenue through a transparency ledger.

---

# 6. Platform Positioning

Curis by Citrus **is**:

1. A healthcare operating system.
2. A governed clinical execution environment.
3. A patient-flow management platform.
4. A clinical records platform.
5. A healthcare billing and payment-validation platform.
6. A branch and department governance platform.
7. A healthcare audit and oversight platform.
8. A Curis platform-fee enforcement system.

Curis by Citrus **is not**:

1. A direct payment processor.
2. A wallet or funds-custody platform.
3. A bank.
4. An insurance underwriter.
5. An insurance claims adjudicator.
6. A national EMR replacement.
7. A public medical marketplace.
8. A medical-device management system.
9. A logistics or distribution-management platform.
10. A complete hospital ERP.
11. A replacement for professional medical judgment.
12. An autonomous diagnosis or prescribing system.
13. A tax-advisory or tax-filing service.

Curis shall not be described as a salon management system, generic ERP, appointment-only platform, billing-only system, standalone EMR, insurance platform, payment processor, medical marketplace, or autonomous clinical decision-making system.

Curis may record insurance information, payer responsibility, co-payments, sponsor amounts, claim references, settlement statuses, and rejected claim adjustments. It shall not independently determine insurance coverage or adjudicate claims on behalf of insurers.

**Final positioning statement:**

> **Curis by Citrus is a governed healthcare operating system that connects patient intake, triage, clinical consultation, prescriptions, diagnostics, pharmacy dispensing, health records, inventory, billing, payment validation, patient access, merchant oversight, and Curis platform billing within one role-separated and audit-defensible execution environment.**

---

# 7. Product Boundaries and Exclusions

## 7.1 Payment Boundary

Patient and third-party payments shall be made **off-platform**. Curis shall:

1. Record payment declarations.
2. Record payment methods.
3. Capture payment references.
4. Capture supporting evidence where required.
5. Route payment declarations to the Finance Account.
6. Validate or reject payment declarations.
7. Reconcile validated payments against invoices.
8. Generate receipts only after successful validation.
9. Record insurance or sponsor receivables.
10. Record Curis billing settlements.
11. Maintain immutable payment-validation records.

Curis shall not:

1. Hold patient funds.
2. Maintain patient wallet balances.
3. Execute peer-to-peer money transfers.
4. Act as a bank.
5. Independently debit a patient's account.
6. Independently settle insurance claims.
7. Treat a declared payment as validated without Finance authorization.

Supported recorded payment methods shall include: cash; M-Pesa or other mobile-money payment; bank transfer; card payment processed externally; insurance; employer or corporate sponsor; government programme or approved third-party payer; and hybrid patient-and-insurance payment.

Where an external payment gateway is used, Curis shall treat it as an integration channel and shall not represent itself as the underlying payment processor. All Citrus-owned collection and disbursement rails shall be operated exclusively through Wallet by Citrus (Section 34).

## 7.2 Clinical Boundary

1. The platform shall never diagnose a patient independently, prescribe medication autonomously, sign a health report, finalize clinical notes without an authorized human, or override a licensed clinician.
2. AI assistance shall be bounded as defined in Section 31.
3. Emergency-care pathways shall never be replaced by platform logic.

## 7.3 Tax Boundary

> **Curis records, derives, validates, and preserves healthcare billing activity. It does not replace the merchant's accountant, tax adviser, insurer, or statutory filing responsibility.**

Tax handling boundaries are defined in Section 25.

## 7.4 Capability Exclusion Table

| Capability | MVP Decision | Reason |
| --- | ---: | --- |
| Direct patient-payment processing or custody | Exclude | Curis validates payments but does not hold funds |
| Insurance underwriting | Exclude | Outside Curis authority |
| Automated insurance adjudication | Exclude | Payer decision must remain external |
| Autonomous diagnosis | Exclude | Unsafe and outside platform authority |
| Autonomous prescribing | Exclude | Requires licensed clinician authority |
| Full hospital ERP | Exclude | Excessive scope and conflicts with Curis positioning |
| Public medical marketplace | Exclude | Outside Curis operating model |
| Full procurement and logistics network | Exclude | Curis inventory scope is operational, not logistics infrastructure |
| Medical-device fleet management | Defer | Separate integration domain |
| Advanced predictive clinical AI | Defer | Non-MVP clinical-risk and validation burden |
| Live eTIMS submission | Defer | MVP ships eTIMS-ready invoice structure; live integration is Version 2 |
| Uncontrolled cross-tenant record search | Prohibit | Violates tenant isolation |
| Editable finalized clinical records | Prohibit | Violates medical-record integrity |
| Editable paid invoices | Prohibit | Violates financial integrity |
| Manual receipt creation | Prohibit | Receipt must follow Finance validation |
| Staff role self-elevation | Prohibit | Violates RBAC |
| Silent pricing changes | Prohibit | Violates billing traceability |
| Unlogged emergency access | Prohibit | Violates healthcare audit requirements |
| Complete tax-advisory and tax-return filing | Exclude | Curis records billing and compliance metadata but is not a tax adviser |

---

# 8. Multi-Tenant Architecture

## 8.1 Tenancy Model

Curis shall implement a healthcare-isolated multi-tenant architecture on a shared application and database infrastructure with row-level tenant scoping.

Each healthcare institution shall operate as an independently governed merchant tenant containing:

1. Its own patient records.
2. Its own branches.
3. Its own healthcare staff.
4. Its own services and products.
5. Its own clinical activity.
6. Its own appointments and queues.
7. Its own prescriptions.
8. Its own laboratory orders and results.
9. Its own pharmacy dispensing records.
10. Its own health reports.
11. Its own invoices and receipts.
12. Its own inventory.
13. Its own audit trail.
14. Its own platform-billing obligations.

## 8.2 Isolation Requirements

1. Every tenant-owned database record shall carry a `tenant_id` ownership key, enforced by database constraint and by a global query scope applied at the ORM layer.
2. The platform shall permit no automatic cross-tenant patient-record exposure.
3. The platform shall permit no cross-tenant staff access.
4. The platform shall permit no cross-tenant reporting for merchant users.
5. The platform shall return no cross-tenant search results.
6. The platform shall share no branch data between unrelated healthcare institutions.
7. Object storage shall be tenant-aware, with tenant-prefixed keys and signed, tenant-authorized download URLs.
8. Background jobs shall carry and enforce tenant context.
9. Notifications shall carry and enforce tenant context.
10. Caches shall be tenant-keyed.
11. Exports shall be tenant-scoped.
12. API authorization shall verify both user permission and tenant ownership on every tenant-owned resource.
13. API identifiers shall be ULIDs or equivalent public-safe identifiers; sequential identifiers that permit cross-tenant enumeration shall not be exposed.
14. Super Administrator access to tenant data shall occur only through a controlled, logged platform-governance workflow and shall avoid unnecessary access to patient-identifiable clinical information.
15. Automated tenant-isolation tests shall run in continuous integration; a failing isolation test shall block deployment.

## 8.3 Patient-Authorized External Data Sharing

Patient-authorized external medical-data sharing shall not be treated as unrestricted cross-tenant access. Any external medical record shared by a patient shall:

1. Retain its originating healthcare facility.
2. Retain its original source.
3. Retain its upload timestamp.
4. Retain its provenance metadata.
5. Be clearly labelled as externally sourced.
6. Be visible only to authorized clinical or health-record roles.
7. Require explicit validation before being merged into the Curis longitudinal record.
8. Never silently overwrite a Curis-generated clinical record.

---

# 9. Tenant, Branch, Role, Patient, and Data-Isolation Models

## 9.1 Structural Layers

```text
Curis Platform Layer (Citrus Labs Limited)
└── Merchant Tenant Layer (healthcare institution)
    └── Branch Layer (physical or logical facility location)
        └── Role Layer (enabled department and operational accounts)
            └── Session Layer (authenticated user acting in one role context)
Patient Layer (platform-level patient identity, tenant-scoped clinical relationships)
```

## 9.2 Branch Architecture

Each merchant tenant may operate one or multiple healthcare branches. Every operational event shall be attributed to a specific branch, including:

1. Patient registration.
2. Appointments.
3. Check-in.
4. Triage.
5. Consultation.
6. Diagnosis.
7. Prescription.
8. Laboratory request.
9. Laboratory result.
10. Dispensing.
11. Inventory movement.
12. Health-report generation.
13. Invoice generation.
14. Payment declaration.
15. Payment validation.
16. Receipt issuance.
17. Refund or credit-note activity.
18. Admission.
19. Discharge.
20. Staff action.
21. Curis platform-fee accrual.

Branch records shall not be silently merged into a global operational record. Tenant-wide administrators may receive consolidated reporting, but the underlying events shall remain branch-attributed.

## 9.3 Role Model

1. Roles shall be defined per tenant from a platform-controlled role catalogue (Section 15).
2. A role shall be operable at a branch only after the Branch Account has enabled the corresponding department or function.
3. A staff user shall hold one or more role assignments, each bound to a branch.
4. Every authenticated session shall operate in exactly one role context; a user with multiple permitted roles shall switch contexts explicitly, and privileges shall never combine within one session.

## 9.4 Patient Model

1. A patient shall have one verified Curis Patient identity (email or phone anchored).
2. A patient's clinical relationship with each merchant tenant shall be tenant-scoped: Facility A shall not see Facility B's records for the same patient unless the patient explicitly shares them through the external-record sharing workflow (Section 8.3).
3. Patient accounts shall remain logically separate from all staff accounts.
4. Duplicate patient records within a tenant shall be resolved only through the controlled merge workflow (Section 36.5).

## 9.5 Data-Isolation Enforcement Points

| Layer | Enforcement |
| --- | --- |
| Database | `tenant_id` on every tenant-owned table; composite indexes leading with `tenant_id`; foreign keys constrained within tenant |
| ORM | Global tenant scope; write guards rejecting cross-tenant references |
| Authorization | Policies verifying user permission plus tenant plus branch plus workflow-state |
| API | Tenant-scoped route model binding; ULID public identifiers |
| Storage | Tenant-prefixed object keys; signed URLs with tenant claims |
| Jobs and queues | Serialized tenant context; job-level tenant assertion |
| Cache | Tenant-prefixed cache keys |
| Search | Tenant-filtered indexes |
| Exports | Tenant-scoped generation and delivery |
| Webhooks and events | Tenant and product context in every envelope |

---

# 10. User-Account Hierarchy

## 10.1 Account Types

Curis shall contain the following accounts:

| # | Account | Portal | Layer |
| --- | --- | --- | --- |
| 1 | Super Administrator Account | `curis.citruslabs.limited` | Platform |
| 2 | Merchant Administrator Account | `merchant.curis.ke` | Tenant |
| 3 | Merchant Branch Account | `branch.curis.ke` | Branch |
| 4 | Merchant Human Resource Account | `hr.curis.ke` | Tenant/Branch |
| 5 | Merchant Audit Account | `audit.curis.ke` | Tenant |
| 6 | Merchant Finance Account | `finance.curis.ke` | Tenant/Branch |
| 7 | Merchant Front Office Account | `reception.curis.ke` | Branch |
| 8 | Merchant Triage Account | `triage.curis.ke` | Branch |
| 9 | Merchant Physician Account | `doctor.curis.ke` | Branch |
| 10 | Merchant Pharmacy Account | `pharmacy.curis.ke` | Branch |
| 11 | Merchant Laboratory Account | `lab.curis.ke` | Branch |
| 12 | Merchant Inventory Account | `inventory.curis.ke` | Branch |
| 13 | Merchant Health Records Account | `records.curis.ke` | Branch |
| 14 | Merchant Ward Management Account | `ward.curis.ke` | Branch (where admissions enabled) |
| 15 | Merchant Optician Account | `optician.curis.ke` | Branch (where enabled) |
| 16 | Merchant Mental Health Account | `mindcare.curis.ke` | Branch (where enabled) |
| 17 | Merchant Nutrition Account | `nutrition.curis.ke` | Branch (where enabled) |
| 18 | Merchant Maternal and Child Health Account | `mch.curis.ke` | Branch (where enabled) |
| 19 | Merchant Dentistry Account | `dentistry.curis.ke` | Branch (where enabled) |
| 20 | Curis Patient Account | `https://curis.ke/` | Platform (tenant-scoped clinical relationships) |

No additional role shall be added merely to create a dashboard. Any future account type shall define its authority, responsibilities, access boundaries, creation flow, and interaction with the core Curis architecture before implementation.

## 10.2 Account Creation and Activation Hierarchy

### 10.2.1 Super Administrator

1. Exists at the Curis platform level.
2. Is owned and controlled by Citrus Labs Limited.
3. Is predefined and securely provisioned at platform level; it is never created through merchant workflows.
4. Controls merchant-tenant onboarding, activation, suspension, and deletion.
5. Does not act as a merchant staff creator.
6. Defines global platform policies and billing rules.

### 10.2.2 Merchant Administrator

1. Represents the governing authority of the healthcare institution.
2. Is created during healthcare-facility onboarding.
3. Becomes operational only after Super Administrator activation and completion of the tenant activation checklist (Section 36.1).
4. Creates or authorizes branches.
5. Creates or authorizes the initial HR authority.
6. Does not create Super Administrator users.

### 10.2.3 Merchant Branch Account

1. Is created or activated under Merchant Administrator authority.
2. Controls branch-level healthcare-service composition.
3. Enables or disables supported department account types.
4. Configures branch pricing and service availability.
5. Does not directly create human staff identities.

### 10.2.4 Merchant Human Resource Account

1. The initial HR authority is created or authorized by the Merchant Administrator.
2. Additional HR users may be created by an authorized HR user subject to policy, separation-of-duties, and audit requirements.
3. Creates, invites, activates, suspends, and deactivates Merchant Staff users.
4. Assigns staff to enabled account types and branches.
5. Maintains employment and credential records.
6. Cannot create a staff user for a department that the Branch Account has not enabled.
7. Cannot assign prohibited role combinations.

### 10.2.5 Merchant Staff Accounts

Merchant Staff accounts include all merchant-side operational roles except the Merchant Administrator Account. Merchant Staff accounts:

1. Are created by an authorized HR user.
2. Are assigned to enabled branch-level roles.
3. Operate only within their assigned permissions.
4. Cannot create or elevate their own roles.
5. Cannot transfer themselves between branches.
6. Cannot silently reactivate a suspended account.

### 10.2.6 Patient Account

1. May be self-registered and verified.
2. May be initiated through Front Office patient registration.
3. Must be linked to a verified patient identity.
4. Shall remain logically separate from all staff accounts.

---

# 11. Authentication and Authorization Model

## 11.1 Staff Authentication (Passwordless Magic Link)

All Merchant Administrator and Merchant Staff accounts shall use passwordless authentication. Merchant account login shall use:

1. Verified email address.
2. Secure magic link.
3. Single-use authentication token, stored hashed.
4. Time-limited token (recommended expiry: 10 minutes).
5. Secure session cookie (HttpOnly, Secure, SameSite).
6. Device and session logging.
7. Login-attempt rate limiting.
8. Suspicious-login monitoring.
9. Forced reauthentication for sensitive actions.

Before a Merchant Staff user can authenticate, the platform shall verify, in order:

1. The appropriate branch or department account type is enabled.
2. The user was created or assigned by an authorized Merchant Human Resource Account user.
3. The user's email address is verified.
4. The staff account is active.
5. The staff member has an active branch assignment.
6. The staff member has an active role assignment.
7. The merchant tenant is active.
8. The assigned branch is active.

An active Merchant Staff user shall only access:

1. Their assigned merchant tenant.
2. Their assigned branch or approved branches.
3. Their assigned role portal.
4. Data permitted by their role.
5. Records permitted by the current workflow state.

A user shall not authenticate into another role merely by changing a URL. Role authorization shall be enforced server-side on every request.

## 11.2 Patient Authentication

The Curis Patient Account shall use:

> **Passwordless Magic Link plus One-Time Verification Code, Device Trust, and Adaptive Reauthentication.**

Patient login shall support:

1. Email address or phone number as an identifier.
2. Delivery through verified email or verified mobile number.
3. Patient-selected delivery preference, changeable in Account → Security → Login Preferences.
4. Magic link.
5. One-time verification code.
6. Trusted-device registration.
7. Risk-based authentication.
8. Sensitive-action reauthentication.

Required controls:

1. Magic-link expiry: 10 minutes.
2. OTP expiry: 5 minutes.
3. Short-lived access tokens.
4. Rotating refresh tokens.
5. Secure HttpOnly cookies.
6. Automatic logout after prolonged inactivity.
7. Rate limiting.
8. OTP resend throttling.
9. Bot protection.
10. Device anomaly detection.
11. Login notification for new devices.

Fresh verification shall be required for sensitive actions, including:

1. Downloading a health report.
2. Downloading clinical records.
3. Sharing medical data externally.
4. Requesting a prescription.
5. Requesting a health report.
6. Changing verified contact details.
7. Removing a trusted device.

Patient accounts shall not support:

1. Password-only login.
2. Unverified email or telephone access.
3. Social-login role mixing.
4. Shared sessions with merchant staff.
5. Unverified email or telephone changes.
6. Access to internal Curis platform-fee information.
7. Access to merchant-only audit logs.
8. Access to another patient's records.

## 11.3 Authorization Model

1. Authorization shall be implemented through server-side policies covering every controller action, API endpoint, form submission, background job, export endpoint, and download endpoint.
2. Every authorization decision shall evaluate: user identity → active status → tenant → branch → role context → permission → object ownership → workflow state.
3. Frontend permission checks may improve UX but shall never be treated as security controls.
4. Object-level authorization shall be enforced for every tenant-owned resource; insecure direct object references shall be prevented by tenant-scoped model binding.
5. Sensitive-action step-up reauthentication shall apply to: payment validation, credit-note approval, price-version publication, staff deactivation, break-glass access, period close and reopen, settlement validation, and record merges.

---

# 12. Role-Based Access-Control Matrix

Legend: **C** create, **R** read, **U** update (pre-finalization), **V** validate/approve, **—** no access. "Fin." means finalize. All access is tenant- and branch-scoped and workflow-state-gated.

| Capability | Super Admin | Merchant Admin | Branch | HR | Audit | Finance | Front Office | Triage | Physician | Pharmacy | Laboratory | Inventory | Health Records | Ward Mgmt | Specialist Depts | Patient |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tenant activation/suspension | C/V | R | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Curis billing configuration | C/U/V | R | — | — | R | R | — | — | — | — | — | — | — | — | — | — |
| Branch creation/activation | V | C/V | R | — | R | — | — | — | — | — | — | — | — | — | — | — |
| Department enable/disable | — | R | C/U | — | R | — | — | — | — | — | — | — | — | — | — | — |
| Service/product pricing versions | — | V (high-risk) | C/U | — | R | R | — | — | — | — | — | — | — | — | — | — |
| Staff account lifecycle | — | V (initial HR) | — | C/U | R | — | — | — | — | — | — | — | — | — | — | — |
| Patient registration | — | — | — | — | R | — | C/U | R | R | R | R | — | R | R | R | C (self) |
| Appointments and check-in | — | R | R | — | R | — | C/U | R | R | — | — | — | — | R | R | R (own) |
| Triage session | — | — | — | — | R | — | — | C/U/Fin. | R | — | — | — | R | R | R | — |
| Consultation, diagnosis, treatment plan | — | — | — | — | R | — | — | — | C/U/Fin. | — | — | — | R | R | C/U/Fin. (own domain) | R (approved, own) |
| Prescriptions | — | — | — | — | R | — | R (status) | — | C/Fin. | R/V (dispense) | — | — | R | R | C/Fin. (where licensed) | R (own) |
| Laboratory orders and results | — | — | — | — | R | — | R (status) | — | C (order), R | — | C/U/Fin. (results) | — | R | R | C (order, domain) | R (released, own) |
| Dispensing records | — | — | — | — | R | R (billing) | — | — | R | C/Fin. | — | R (deductions) | R | R | — | R (own) |
| Inventory movements | — | R | R | — | R | R (financial) | — | — | — | R | R | C/U | — | R | — | — |
| Health reports | — | — | — | — | R | — | R (deliver print) | — | Trigger | — | — | — | C/V/Fin. | R | Trigger | R (own, approved) |
| Invoices (system-derived) | — | R | R | — | R | R | Initiate via service selection | — | Trigger | Trigger | Trigger | — | Trigger | Trigger | Trigger | R (own) |
| Payment declarations | — | R | R | — | R | V | C | — | — | — | — | — | — | — | — | C (own) |
| Receipts | — | R | R | — | R | Auto-issue on V | R (confirmation) | — | — | — | — | — | — | — | — | R (own) |
| Credit notes and refunds | — | V (exceptional) | R | — | R | C/V | — | — | — | Initiate (returns) | — | — | — | — | — | R (own) |
| Ledger and period close | — | R | R | — | R | C/V | — | — | — | — | — | — | — | — | — | — |
| Curis settlement evidence | V | R | — | — | R | C | — | — | — | — | — | — | — | — | — | — |
| Admissions and ward state | — | R | R | — | R | R (billing) | R | R | C (clinical orders) | — | — | — | R | C/U | R | R (own, approved) |
| Audit events and exports | R (platform) | R (summary) | R (branch) | R (staff events) | R/Export | R (financial) | — | — | — | — | — | — | — | — | — | — |
| Break-glass access | R (platform review) | Notified | — | — | R (review) | — | — | Grant per policy | Grant per policy | — | — | — | R (review) | Grant per policy | Grant per policy | — |
| Support requests | R (receive) | R | — | C | R | — | — | — | — | — | — | — | — | — | — | FAQs only |

The authoritative, machine-readable permission matrix shall be maintained as versioned configuration; this table is the governing summary. Any conflict shall be resolved in favor of the more restrictive interpretation.

---

# 13. Separation-of-Duties Rules

## 13.1 Principle

No single operational role shall have unilateral control over an entire clinical-to-financial transaction.

## 13.2 Mandatory Separations

The system shall separate:

1. Front Office from Finance payment validation.
2. Physician from pricing configuration.
3. Pharmacy from price modification.
4. Laboratory from price approval.
5. Clinical roles from invoice alteration.
6. Finance from clinical-record alteration.
7. Audit from operational editing.
8. HR from self-approval of unauthorized roles.
9. Branch pricing configuration from unlogged retroactive invoice changes.
10. Patient actions from merchant approval actions.

## 13.3 Role-Conflict Engine

The system shall detect and block prohibited role combinations at assignment time and at session time, including:

1. Front Office plus Finance.
2. Finance plus Audit.
3. Physician plus Audit.
4. HR plus Audit where independent oversight is required.
5. Pharmacy plus Finance (same user could dispense and validate payment).
6. Laboratory plus Finance (same user could complete a service and validate payment).

Rules:

1. The conflict matrix shall be platform-defined and versioned; merchants shall not weaken it.
2. HR shall be technically prevented from saving a prohibited assignment; the attempt shall be logged.
3. Where a compatible multi-role assignment is expressly permitted, the system shall require separate role contexts and shall never combine privileges within one session.
4. A role-context switch shall terminate the prior context's session privileges before establishing the new context.
5. The conflict engine shall re-evaluate on every role assignment change, branch transfer, and department enablement change.

---

# 14. Functional Modules

| Module | Description | Primary Accounts |
| --- | --- | --- |
| Tenant Governance | Merchant onboarding, activation checklist, suspension, lifecycle | Super Administrator, Merchant Administrator |
| Branch Governance | Branch profiles, operating hours, department enablement, dependencies | Branch |
| Service and Pricing | Service/product catalogues, versioned pricing, discounts, chargeability | Branch, Merchant Administrator |
| Identity and Access | Staff lifecycle, credentials, branch/role assignment, role-conflict engine | HR |
| Patient Registration and Identity | Registration, duplicate detection, controlled merge | Front Office, Patient |
| Scheduling and Queues | Appointments, walk-ins, check-in, queue states, priorities | Front Office, Triage, Physician |
| Triage | Vital signs, structured intake, priority, record lock | Triage |
| Consultation | Sessions, structured notes, diagnoses, treatment plans, closure | Physician, Specialist Departments |
| Prescriptions | Creation, status lifecycle, copy/refill requests | Physician, Pharmacy, Front Office, Patient |
| Laboratory | Catalogue, orders, specimens, results, release | Laboratory, Physician |
| Pharmacy | Prescription validation, dispensing, returns, substitutions | Pharmacy |
| Inventory | Batches, expiry, movements, write-offs, reconciliation | Inventory |
| Health Records and Reports | Report generation, validation, delivery, external records, provenance | Health Records, Patient, Front Office |
| Admissions and Ward Management | Admission records, beds, transfers, admission-linked charge events, discharge | Ward Management, Physician |
| Patient Billing | System-derived invoices, pricing snapshots, invoice lock states | Finance, triggering roles |
| Payment Validation | Declarations, evidence, validation, receipts | Front Office, Patient, Finance |
| Credit Notes and Refunds | Controlled reversals, pharmacy returns, insurance adjustments | Finance |
| Financial Subledger | Double-entry postings, period close, reconciliation snapshots | Finance, Audit |
| Curis Platform Billing | Tiers, fee accrual, Curis invoices, settlement, transparency ledger | Super Administrator, Finance |
| Audit and Compliance | Immutable events, exports, break-glass review | Audit |
| Notifications | In-app, email, approved SMS | All |
| Reporting and Analytics | Role-authorized dashboards and exports | All governing roles |
| Help and Support | HR-initiated structured email support workflow | HR |
| Integrations | Wallet by Citrus, Refer & Earn, eTIMS-ready structure, communications providers | Platform |

---

# 15. Detailed Functional Requirements by Account Type

## 15.1 Super Administrator Account

**Portal:** `curis.citruslabs.limited`

### Purpose

Acts as the global Curis governance, security, billing, enforcement, and merchant-lifecycle authority.

### Functional Requirements

1. The platform shall allow the Super Administrator to review and activate merchant tenants against the tenant activation checklist.
2. The platform shall allow the Super Administrator to suspend or terminate merchant access, with reason capture and audit logging.
3. The platform shall allow the Super Administrator to define tenant activation requirements.
4. The platform shall allow the Super Administrator to define Curis billing tiers, onboarding fees, performance-based fee percentages, and minimum monthly billing floors, all versioned with effective dates.
5. The platform shall allow the Super Administrator to configure Curis billing cycles, payment terms, discounts, and penalties.
6. The platform shall allow the Super Administrator to validate merchant-to-Curis settlements, including settlements confirmed through Wallet by Citrus webhooks.
7. The platform shall allow the Super Administrator to monitor platform-wide security and audit integrity.
8. The platform shall allow the Super Administrator to review cross-tenant aggregate metrics without exposing one tenant's clinical data to another tenant.
9. The platform shall allow the Super Administrator to manage global service classifications and global tax and eTIMS rules where applicable.
10. The platform shall allow the Super Administrator to manage platform versions and policy versions.
11. The platform shall allow the Super Administrator to review platform-level fraud and revenue-integrity alerts and control system-wide suspension rules.
12. The platform shall provide the Super Administrator merchant-lifecycle and Curis billing reports.

### Restrictions

The Super Administrator shall not:

1. Modify physician clinical notes.
2. Issue prescriptions.
3. Change diagnoses.
4. Dispense medicine.
5. Upload laboratory results as a clinical user.
6. Alter finalized patient records.
7. Act as merchant Finance.
8. Create merchant staff users in the ordinary HR workflow.
9. Expose one merchant's identifiable patient data to another merchant.

### Creation

Predefined and securely provisioned at platform level by Citrus Labs Limited.

## 15.2 Merchant Administrator Account

**Portal:** `merchant.curis.ke`

### Purpose

Acts as the governing authority for a healthcare institution operating as a Curis tenant.

### Functional Requirements

1. The platform shall allow the Merchant Administrator to maintain merchant legal and operational details.
2. The platform shall allow the Merchant Administrator to create or request branch creation and to activate or suspend branch operations subject to platform rules.
3. The platform shall allow the Merchant Administrator to appoint the initial Human Resource authority.
4. The platform shall provide consolidated clinical, financial, and operational dashboards with branch-attributed underlying events.
5. The platform shall route high-risk pricing or policy changes to the Merchant Administrator for approval where required.
6. The platform shall allow review of branch service composition, staff distribution, Curis billing obligations, platform-fee statements, audit and compliance summaries, and fraud or abnormal-activity alerts.
7. The platform shall allow the Merchant Administrator to approve exceptional financial corrections where required, through the controlled credit-note or adjustment workflows only.
8. The platform shall allow the Merchant Administrator to enforce organizational governance policies.

### Restrictions

The Merchant Administrator shall not:

1. Edit completed clinical records.
2. Override clinical findings.
3. Alter issued prescriptions.
4. Upload laboratory results unless separately assigned to a permitted clinical role.
5. Validate their own unauthorized financial adjustments.
6. Change immutable audit logs.
7. Directly change the amount on an issued invoice.

### Creation

Created through the healthcare-facility onboarding process and activated by the Super Administrator after the facility satisfies the Curis tenant activation checklist.

## 15.3 Merchant Branch Account

**Portal:** `branch.curis.ke`

### Purpose

Acts as the branch-level governance, configuration, pricing, department-activation, and operational-oversight authority.

### Functional Requirements

1. The platform shall allow the Branch Account to maintain the branch profile, operating details, and operating hours.
2. The platform shall allow the Branch Account to configure branch services, service availability, service prices, products, product prices, approved discounts, and service chargeability.
3. The platform shall treat a zero price as non-chargeable and shall record the zero-price rule on any resulting request.
4. The platform shall allow the Branch Account to enable or disable: Pharmacy; Laboratory; Ward Management; Optician services; Mental Health services; Nutrition services; Maternal and Child Health services; Dentistry services.
5. The platform shall enforce department dependencies and shall prevent Triage activation when no compatible clinical destination exists.
6. The platform shall provide branch patient-flow performance, billing activity, inventory and department activity, and reconciliation summaries.
7. The platform shall support submission of pricing changes for approval where required and shall version every published price with an effective date.
8. The platform shall allow branch-specific workflow settings within platform-controlled limits.

### Pricing Governance

The Branch Account may configure prices but shall not:

1. Edit an issued invoice.
2. Retroactively change the price snapshot of a completed service.
3. Modify a receipt.
4. Change Finance payment-validation records.
5. Conceal pricing changes from Audit.
6. Price a service after the related invoice has already been finalized.

### Creation

Created or authorized by the Merchant Administrator. Human users assigned to operate the Branch Account are provisioned by HR.

## 15.4 Merchant Human Resource Account

**Portal:** `hr.curis.ke`

### Purpose

Acts as the merchant's staff identity, employment-record, credential, branch-assignment, and access-management authority.

### Functional Requirements

1. The platform shall allow HR to create Merchant Staff accounts and invite users by verified email.
2. The platform shall allow HR to assign users to branches and to enabled roles only.
3. The platform shall allow HR to activate and suspend staff accounts.
4. The platform shall allow HR to record employment status, professional credentials, credential expiry dates, and department assignments.
5. The platform shall enforce role-based access and the role-conflict engine on every assignment HR attempts.
6. The platform shall support auditable staff transfer between branches.
7. The platform shall allow HR to review login and device information where authorized.
8. The platform shall allow HR to initiate Help and Support requests (Section 15.21).
9. The platform shall allow creation of additional HR users under controlled rules.

### Staff-Deactivation Safeguard

Before deactivating a staff account, the platform shall check for:

1. Active consultations.
2. Incomplete triage sessions.
3. Pending prescriptions.
4. Pending laboratory results.
5. Unvalidated payments.
6. Open reconciliation duties.
7. Unfulfilled health-report requests.
8. Active admissions or ward responsibilities.
9. Pending inventory approvals.

The user shall not be deactivated until active obligations are reassigned or formally resolved.

### Restrictions

HR shall not:

1. Enable a branch department.
2. Modify clinical records.
3. Configure service prices.
4. Validate patient payments.
5. Modify audit records.
6. Grant a role prohibited by the role-conflict engine.
7. Create Super Administrator users.

### Creation

The initial HR authority is created or authorized by the Merchant Administrator. Subsequent HR users may be created by an authorized HR user subject to separation-of-duties and audit controls.

## 15.5 Merchant Audit Account

**Portal:** `audit.curis.ke`

### Purpose

Provides independent, read-only oversight of clinical, operational, security, inventory, and financial activity.

### Functional Requirements

1. The platform shall provide Audit read-only access to: immutable audit events; clinical event timelines; invoice creation and payment-validation chains; pricing-history records; dispensing and inventory events; laboratory workflow events; health-report generation and delivery records; login and access events; user activation and suspension events; credit notes and reversals.
2. The platform shall allow Audit to generate timestamped audit exports (Section 36.4).
3. The platform shall allow Audit to generate branch and tenant compliance reports.
4. The platform shall allow Audit to review break-glass access, record merges, and suspicious-activity flags.

### Restrictions

Audit shall be read-only. The Audit Account shall not:

1. Create, modify, approve, reject, or delete operational records.
2. Validate payments.
3. Configure pricing.
4. Issue prescriptions.
5. Dispense medication.
6. Upload laboratory results.
7. Create staff accounts.
8. Alter audit events.

### Creation

Created by HR after the relevant audit role has been authorized.

## 15.6 Merchant Finance Account

**Portal:** `finance.curis.ke`

### Purpose

Acts as the payment-validation, financial reconciliation, billing-control, credit-note, ledger, insurance-receivable, and Curis-billing settlement authority.

### Functional Requirements

1. The platform shall route every payment declaration to Finance and shall allow Finance to verify payment evidence and approve or reject the declaration.
2. The platform shall support validation of cash, mobile-money, bank, card, insurance, and sponsor payments.
3. The platform shall generate an immutable receipt automatically upon validation; Finance shall not create receipts manually.
4. The platform shall support invoice/receipt reconciliation, outstanding patient balances, insurer or sponsor receivables, approved partial payments, and approved overpayments.
5. The platform shall allow Finance to initiate credit-note workflows and approve pharmacy return billing adjustments.
6. The platform shall allow Finance to reconcile inventory-related financial events and review branch revenue-integrity snapshots.
7. The platform shall provide Finance the Curis billing transparency ledger (Section 23.6), permitted Curis billing-cycle selection, and submission of evidence of merchant-to-Curis payment.
8. The platform shall support period close, with reopening only through controlled approval, and review of system-generated accounting entries.

### Restrictions

Finance shall not:

1. Create diagnoses.
2. Issue prescriptions.
3. Edit clinical notes.
4. Change laboratory results.
5. Set or silently alter branch service prices.
6. Manually edit a locked invoice total.
7. Delete a financial transaction.
8. Generate a receipt without validated payment.
9. Directly edit ledger postings.
10. Alter a paid invoice without a credit note or approved adjustment.

### Creation

Created by HR for an active branch or tenant after Finance authority has been enabled.

## 15.7 Merchant Front Office Account

**Portal:** `reception.curis.ke`

### Purpose

Acts as the patient-facing intake, registration, scheduling, queue, service-request, invoice-initiation, and payment-declaration interface.

### Functional Requirements

1. The platform shall allow Front Office to register patients, search for existing patients, and detect possible duplicate patients at registration time.
2. The platform shall allow Front Office to update permitted demographic information and verify patient contact details.
3. The platform shall allow Front Office to schedule appointments, check patients in, manage appointment status, add patients to triage or physician queues, manage walk-in visits, and record referral details.
4. The platform shall allow Front Office to initiate approved service requests, request health reports on behalf of patients, and request prescriptions on behalf of patients where allowed.
5. The platform shall allow Front Office to select approved services for billing and view system-generated invoice totals; totals shall be read-only to Front Office.
6. The platform shall allow Front Office to record declared payment method, upload payment evidence, and submit the declaration for Finance validation.
7. The platform shall notify Front Office after receipt generation.
8. The platform shall allow Front Office to download finalized printed health reports where requested and communicate approved patient notifications.

### Restrictions

Front Office shall not:

1. Set prices.
2. Change invoice totals.
3. Validate payment.
4. Create receipts.
5. View Curis platform fees.
6. Edit triage data.
7. Create diagnoses.
8. Issue prescriptions.
9. View confidential external medical records merely because Front Office facilitated their submission.
10. Modify finalized clinical records.

### Creation

Created by HR for an active branch.

## 15.8 Merchant Triage Account

**Portal:** `triage.curis.ke`

### Purpose

Acts as the clinical intake, vital-sign capture, symptom-structuring, risk-detection, prioritization, and consultation-readiness authority.

### Functional Requirements

1. The platform shall show Triage users the patients awaiting triage in their branch.
2. The platform shall permit one active triage session per Triage user at a time.
3. The platform shall capture structured vital signs, presenting complaint, symptom duration, pain score, and relevant observations.
4. The platform shall display known allergies and chronic conditions during triage.
5. The platform shall allow assignment of triage priority, flagging of urgent or emergency conditions, and generation of clinical alerts.
6. The platform shall lock completed triage records; completed records shall be read-only.
7. The platform shall route completed triage data to the Physician Account (or enabled specialist clinical destination).
8. The platform shall allow read-only viewing of permitted longitudinal patient information and, where patient authorization exists, external medical records.

### Restrictions

Triage users shall not:

1. Make a final diagnosis.
2. Prescribe medication.
3. Discharge a patient.
4. Edit physician notes.
5. Change prices.
6. Access Finance functions.
7. Alter completed triage records.
8. Continue multiple parallel triage sessions.

### Creation

Created by HR only where Triage has been enabled by the Branch Account and an appropriate clinical destination is active.

## 15.9 Merchant Physician Account

**Portal:** `doctor.curis.ke`

### Purpose

Acts as the controlled clinical consultation and clinical-decision execution environment.

### Core Principle

> **No physician-generated clinical artifact shall exist outside a valid consultation session.**

Prescriptions, diagnoses, treatment plans, laboratory requests, clinical notes, and visit summaries shall be bound to: a patient; a visit; a branch; a physician; an active consultation session; and a timestamp.

### Functional Requirements

1. The platform shall show the physician their assigned patient queue with triage summaries.
2. The platform shall allow review of permitted patient history before and during consultation.
3. The platform shall permit one active consultation per physician at a time and one active consultation per visit.
4. The platform shall capture structured clinical notes, diagnosis, and treatment plan.
5. The platform shall allow creation of prescriptions and laboratory requests inside the active consultation only.
6. The platform shall allow review of laboratory results and recording of follow-up requirements.
7. The platform shall support approved online consultations under the same session, attribution, and closure rules.
8. The platform shall support AI-assisted summaries under the Section 31 constraints.
9. The platform shall allow the physician to close the consultation and finalize the clinical record.
10. Consultation closure shall trigger billing events, the health-report workflow, and queue-status updates.
11. Historical records shall be viewable read-only.

### Session Closure Verification

Before a consultation may be closed, the system shall verify:

1. Required notes are complete.
2. Required diagnosis information is present.
3. No prescription remains in an invalid draft state.
4. No laboratory request remains incomplete.
5. Required treatment-plan information is present.
6. Required follow-up instructions are addressed.

After consultation closure:

1. Finalized notes shall become immutable.
2. The visit record shall be created.
3. Billing events shall be triggered.
4. The health-report workflow shall be triggered.
5. The patient queue status shall be updated.
6. The final summary shall be attached to the visit.

Corrections after finalization shall use an attributable addendum or controlled amendment process. Silent overwriting shall be prohibited.

### Restrictions

Physicians shall not:

1. Configure prices.
2. Modify invoices.
3. Validate payments.
4. Alter receipts.
5. Edit inventory financial records.
6. View Curis platform-fee calculations unless separately authorized for a governing role.
7. Create clinical artifacts outside a valid visit or admission-linked consultation.

### Creation

Created by HR after verification of the relevant professional and branch assignment requirements.

## 15.10 Merchant Pharmacy Account

**Portal:** `pharmacy.curis.ke`

### Purpose

Acts as the prescription-validation, dispensing, medication-stock, and dispensing-to-billing execution authority.

### Functional Requirements

1. The platform shall show Pharmacy valid prescriptions with status, prescribing physician, and medication instructions.
2. The platform shall require prescription validation before dispensing: prescription exists in Curis; status is Approved/Active; items exist in the pharmacy product catalogue; pricing exists or the item is explicitly non-chargeable; stock availability is verified; patient visit context is active or linked.
3. The platform shall support medication selection from the approved catalogue with batch and expiry confirmation and quantity confirmation.
4. The platform shall support permitted substitution with reason capture.
5. Completion of dispensing shall create an immutable dispensing record, deduct stock at batch level, and automatically trigger a pharmacy billing event. The Pharmacy Account shall not manually create an unrelated invoice.
6. The platform shall support partial dispensing with recorded unfulfilled quantities and pending-remainder tracking.
7. The platform shall support return requests, non-resalable returns, and return-linked credit-note initiation.
8. The platform shall provide dispensing history, pricing requests to the Branch Account, stock and expiry alerts, and linkage of dispensing activity to patient records.

### Restrictions

Pharmacy shall not:

1. Change product prices.
2. Validate payment.
3. Modify invoice totals.
4. Dispense against an expired, cancelled, or draft prescription.
5. Dispense unavailable stock without an approved exception.
6. Reinsert returned medication into stock without validation.
7. Delete a completed dispensing record.

### Creation

The Branch Account enables Pharmacy. HR then assigns authorized Pharmacy staff.

## 15.11 Merchant Laboratory Account

**Portal:** `lab.curis.ke`

### Purpose

Acts as the diagnostic-service catalogue, specimen, test-processing, result-entry, and laboratory-to-patient-record authority.

### Functional Requirements

1. The platform shall allow Laboratory to create laboratory service and product records with descriptions, images, and purchase cost where applicable.
2. The platform shall route Laboratory pricing requests to the Branch Account; Laboratory shall not approve its own prices.
3. The platform shall deliver physician-generated laboratory orders to Laboratory.
4. The platform shall record sample collection, track test status, and record rejection or recollection requirements.
5. The platform shall support structured result upload with attached approved result documents.
6. The platform shall support result finalization; finalized results shall be immutable and corrected only through the controlled amended-result process.
7. The platform shall notify the requesting physician on completion and link results to the patient's visit and longitudinal record.
8. The platform shall trigger approved laboratory billing events and maintain laboratory activity logs.

### Restrictions

Laboratory shall not:

1. Approve its own prices.
2. Change invoice totals.
3. Validate patient payments.
4. Create unrelated diagnoses.
5. Edit physician notes.
6. Modify a finalized result without an attributable correction process.
7. Delete completed diagnostic records.

### Creation

The Branch Account enables Laboratory. HR then assigns authorized Laboratory staff.

## 15.12 Merchant Inventory Account

**Portal:** `inventory.curis.ke`

### Purpose

Acts as the branch-level healthcare inventory, batch, expiry, stock-movement, and loss-accountability authority.

### Functional Requirements

1. The platform shall record stock receipts with batch, expiry, and purchase cost.
2. The platform shall record stock transfers, dispensing deductions, laboratory-consumption deductions, expiry, damage, and approved write-offs.
3. The platform shall require Inventory verification of pharmacy returns before stock restoration.
4. The platform shall monitor reorder thresholds and generate stock-movement reports.
5. The platform shall support reconciliation of physical and system stock with immutable adjustment histories.

### Restrictions

Inventory shall not:

1. Issue prescriptions.
2. Dispense medicine unless separately authorized under a compatible workflow.
3. Set patient prices.
4. Validate payment.
5. Edit completed clinical records.
6. Backdate stock movements without explicit authorization and audit logging.
7. Delete stock-loss events.

### Creation

Created by HR after Inventory functionality has been enabled for the branch.

## 15.13 Merchant Health Records Account

**Portal:** `records.curis.ke`

### Purpose

Acts as the archival, patient-health-report, external-record validation, record-provenance, and patient-facing medical-truth authority.

### Functional Requirements

1. The platform shall notify Health Records automatically after health-report generation.
2. The platform shall present AI-assisted draft health reports for review; Health Records shall validate and finalize every released report.
3. The platform shall support full longitudinal reports, date-range reports, and fulfilment of patient report requests.
4. The platform shall deliver approved PDF reports and prepare reports for physical printing via Front Office.
5. The platform shall support upload of historical health reports and permitted bulk historical imports, marked by external source.
6. The platform shall present patient-submitted external medical records for validation and controlled merge into the longitudinal record.
7. The platform shall maintain report versions, provenance, and record-delivery logs.
8. The platform shall designate the latest approved report as the active report.
9. The platform shall support controlled amendments without silent overwriting.

### Health-Report Rules

1. A report shall be generated after every completed physician visit where required.
2. The report shall use same-day Triage and Physician data.
3. Finalized reports shall be immutable.
4. Historical reports shall retain external-source status.
5. The latest approved report shall be designated as the active report.
6. Every report shall be branch-attributed and timestamped.
7. Report structure shall follow the approved medical health-report template, including: patient reference and demographics; presenting history; physical examination; investigations with structured result values; diagnosis; treatment plan and medication; follow-up recommendation; authoring and validating clinician attribution; facility and branch identification; and a MEDICAL IN CONFIDENCE marking.

### Restrictions

Health Records shall not:

1. Invent clinical findings.
2. Change a physician's finalized diagnosis without an authorized clinical amendment.
3. Remove provenance.
4. Conceal external origin.
5. Release an unapproved report.
6. Alter billing or payment validation.

### Creation

Created by HR after Health Records functionality is enabled.

## 15.14 Merchant Ward Management Account

**Portal:** `ward.curis.ke`

### Purpose

Acts as the administrative and operational authority for Curis-controlled admission records, bed allocation, ward-state tracking, and admission-linked care coordination.

### Functional Requirements

1. The platform shall allow Ward Management to create or manage approved admission records.
2. The platform shall support ward and bed assignment, admission-status tracking, bed-occupancy tracking, and transfer recording.
3. The platform shall track admission-linked services and coordinate physician ward consultations.
4. The platform shall track discharge readiness and maintain ward operational timelines.
5. The platform shall support event-driven admission billing (Section 22).
6. The platform shall record external-ward context where the patient is admitted outside a Curis-operated ward but managed through a Curis admission record.

### Restrictions

Ward Management shall not:

1. Make diagnoses.
2. Prescribe medication.
3. Modify physician records.
4. Set unapproved prices.
5. Validate patient payments.
6. Delete admission-linked billing events.
7. Close an admission without required discharge authorization.

### Creation

The Branch Account enables Ward Management. HR assigns authorized Ward Management users.

## 15.15 Specialist Department Accounts

Separate branch-controlled clinical execution surfaces:

| Account | Portal | Clinical Domain |
| --- | --- | --- |
| Merchant Optician Account | `optician.curis.ke` | Vision assessment, refraction, optical prescriptions, eye-care services |
| Merchant Mental Health Account | `mindcare.curis.ke` | Mental-health assessment, therapy sessions, psychiatric care coordination |
| Merchant Nutrition Account | `nutrition.curis.ke` | Nutritional assessment, dietary plans, wellness monitoring |
| Merchant Maternal and Child Health Account | `mch.curis.ke` | Antenatal, postnatal, immunization, growth monitoring |
| Merchant Dentistry Account | `dentistry.curis.ke` | Dental assessment, dental procedures, oral-health plans |

These shall be treated as separate clinical execution surfaces, not as unstructured modules inside the Physician Account. For each specialist account, the platform shall define and enforce:

1. A defined clinical purpose.
2. A defined patient-session model equivalent to the consultation session: one active session per user; session bound to patient, visit, branch, clinician, and timestamp; controlled closure and finalization.
3. A defined structured assessment appropriate to the domain (for example refraction values for Optician; structured mental-state examination for Mental Health; anthropometric and dietary measures for Nutrition; antenatal profile and growth-monitoring measures for MCH; dental charting for Dentistry).
4. A defined clinical-record output that finalizes into the longitudinal record under Section 17 integrity rules.
5. Defined billing triggers: completed specialist session, approved domain procedures, and domain products dispensed or issued through the governed catalogues.
6. Defined referral rules to and from Triage, Physician, Laboratory, and Pharmacy.
7. Defined access permissions restricted to the specialist's own domain records plus permitted longitudinal context.
8. Defined professional restrictions: no pricing configuration; no payment validation; no invoice alteration; prescription authority only where the professional class is licensed to prescribe and the platform role is so configured; no access to another domain's draft records.
9. Defined interaction with Triage, Physician, Pharmacy, Laboratory, Health Records, Finance, and Patient Accounts through the standard queue, order, dispensing, reporting, and billing workflows.

The Branch Account shall determine which specialist departments are active. HR shall assign staff only after the department has been enabled.

## 15.16 Curis Patient Account

**Portal:** `https://curis.ke/`

### Purpose

Provides patients with secure access to approved personal healthcare information and patient-facing Curis services.

### Functional Requirements

Patients shall be able to:

1. Register and verify their account.
2. View personal profile information.
3. View appointment history and visit history.
4. View approved clinical records.
5. View prescriptions.
6. View laboratory results approved for patient release.
7. View invoices, view validated receipts, and download receipts.
8. Request a health report and select softcopy or printed delivery.
9. Request an approved prescription service.
10. Receive notifications.
11. Share external medical records.
12. Review trusted devices, revoke device access, and review login activity.
13. Manage verified communication preferences.

### Restrictions

Patients shall not:

1. Edit clinical records.
2. Change diagnoses.
3. Modify prescriptions.
4. Upload content directly into finalized Curis clinical records.
5. Change invoice totals.
6. Validate their own payments.
7. View Curis platform fees.
8. View internal merchant notes.
9. View another patient's records.
10. View internal fraud flags.
11. View merchant audit logs.

### Creation

Patient accounts may be self-created or initiated during Front Office registration. Account access requires verification through the approved passwordless patient-authentication flow.

## 15.17 Merchant Dashboards

### Merchant Administrator Dashboard

Shall include: active branches; branch operating status; patient volumes; appointment volumes; completed visits; department activity; revenue by branch; outstanding patient balances; insurance receivables; validated payment totals; Curis fees accrued; Curis fees paid; outstanding Curis balance; staff-account status; audit alerts; suspicious-activity alerts; service and pricing changes; tenant activation and compliance status.

### Branch Dashboard

Shall include: current patient queue; triage waiting time; physician waiting time; active consultations; daily visits; department activity; daily invoice value; validated collections; outstanding payment declarations; pharmacy stock alerts; laboratory pending results; health-report requests; admission occupancy where enabled; daily revenue-integrity snapshot.

### Finance Dashboard

Shall include: pending payment validations; rejected payment declarations; unpaid invoices; partially paid invoices; insurance receivables; sponsor receivables; refund and credit-note requests; daily reconciliation; branch collections; Curis platform-fee liability; Curis invoices; Curis payment status; period-close status.

### Clinical Dashboards

Shall include role-specific and safety-focused information only. Clinical dashboards shall not expose unauthorized financial or Curis fee information.

## 15.18 Super Administrator Dashboard

Shall include: total merchant tenants; active merchants; suspended merchants; pending tenant activations; total branches; active users; patient-visit volume; invoice volume; gross healthcare invoice value; validated merchant revenue; Curis fees accrued; Curis fees invoiced; Curis fees collected; outstanding Curis balances; onboarding fees collected; overdue merchants; merchant billing tiers; platform-floor enforcement; platform-wide security alerts; tenant isolation alerts; failed integrations; audit-export status; eTIMS integration status where enabled; Curis billing disputes; high-risk fraud flags.

Super Administrator aggregate dashboards shall avoid unnecessary access to patient-identifiable clinical information.

## 15.19 Help and Support

Curis MVP Lite support shall use a controlled email-based process.

1. Only authorized HR users shall initiate merchant support requests.
2. The support form shall capture: affected merchant tenant; affected branch; affected account or role; affected user where applicable; contact email; issue category; description; severity; relevant record reference; and confirmation of whether patient-identifiable information is included.
3. The system shall generate a structured email to the Curis support team with all details included.
4. Other users may view FAQs and approved support documentation but shall not initiate unrestricted support requests unless explicitly authorized.
5. A complete ticketing and escalation platform shall not be built for MVP Lite.

---

# 16. Clinical Workflow State Machines

## 16.1 Core Clinical Execution Chain

The platform shall enforce the following default outpatient chain:

```text
Patient registration
→ Appointment or walk-in check-in
→ Patient queue
→ Triage session
→ Triage completion and record lock
→ Physician consultation session
→ Diagnosis and treatment plan
→ Prescription and/or laboratory request
→ Consultation closure
→ Clinical record finalization
→ Health-report generation
→ System-derived billing event
→ Patient payment declaration
→ Finance validation
→ Receipt generation
→ Curis platform-fee accrual
→ Audit and reporting
```

No step shall silently bypass required predecessor states. In particular:

1. A physician consultation shall not start without a valid patient visit.
2. Dispensing shall not occur against an invalid prescription.
3. A receipt shall not exist without validated payment.
4. A finalized result shall not exist without a laboratory order or permitted direct-test workflow.
5. A Curis performance fee shall not accrue from a deleted or nonexistent invoice.
6. A finalized clinical record shall not be silently edited.

## 16.2 Patient Queue and Visit States

Primary queue progression:

```text
Scheduled
→ Checked In
→ Awaiting Triage
→ In Triage
→ Triage Completed
→ Waiting for Physician
→ In Consultation
→ Completed
```

Terminal or exceptional states: Cancelled; No Show; Returned to Front Office; Escalated; Emergency Transfer; Deferred; Admission Initiated.

Queue rules:

1. Appointment states, walk-in visit states, and check-in states shall be explicitly modelled and branch-attributed.
2. Priority and emergency flags shall reorder queues visibly and auditably.
3. No-show and cancelled-visit handling shall release queue positions and record the terminal reason.
4. Reopened visits shall require authorization and shall be audit-logged.
5. Waiting-time monitoring shall be continuous and dashboard-visible.
6. Queue transfers between clinical destinations shall preserve visit context.
7. One active session per clinical user and one active consultation per visit shall be enforced.
8. Duplicate check-in for the same visit shall be prevented.

## 16.3 Triage Session States

```text
Awaiting Triage → In Triage → Triage Completed (locked)
```

1. A triage session shall bind to a checked-in visit, a branch, and one Triage user.
2. Completion shall lock the record; corrections shall use the amendment process.
3. Completion shall route the patient to a compatible, active clinical destination.

## 16.4 Consultation Session States

```text
Queued → In Consultation → Closure Verification → Finalized
```

Exceptional: Escalated; Admission Initiated; Cancelled (with reason, before clinical content finalization).

Closure verification requirements are defined in Section 15.9.

## 16.5 Clinical Record Integrity States

All finalized clinical records shall be: patient-linked; visit-linked; branch-linked; user-attributed; role-attributed; timestamped; version-controlled; immutable after finalization; and included in the audit trail.

The platform shall distinguish record states:

```text
Draft → In Progress → Finalized → Amended (versioned) / Superseded
```

Additional states: Cancelled (where clinically appropriate); Externally Sourced.

Corrections shall use: addenda; versioned amendments; explicit correction reasons; approver identity where required; original-value preservation; and timestamped audit events.

Hard deletion of finalized clinical records shall be prohibited.

---

# 17. Billing Workflow State Machines

## 17.1 System-Derived Billing Principle

> **No healthcare invoice shall exist without a valid clinical, pharmaceutical, diagnostic, records, admission, or approved administrative service trigger.**

Valid billing triggers include:

1. Completed physician consultation.
2. Approved laboratory test order.
3. Completed laboratory service.
4. Confirmed medication dispensing.
5. Patient health-report request.
6. Prescription-copy or prescription-request service where chargeable.
7. Approved procedure.
8. Admission fee.
9. Bed occupancy.
10. Ward consultation.
11. Medication administered to an admitted patient.
12. Laboratory service provided during admission.
13. Approved branch-configured administrative healthcare service.
14. Completed specialist department session or approved domain procedure.

Manual invoice creation outside an approved service or event context shall be prohibited. Invoice pricing shall be pulled from a versioned branch-pricing record. Issued invoices shall retain their original pricing snapshot even after later price changes.

## 17.2 Invoice States (Invoice Lock Safeguard)

```text
Draft (system-assembled, bounded draft period)
→ Issued
→ Locked
→ Payment Pending
→ Partially Paid
→ Paid
```

Exceptional: Cancelled Before Payment (with reason and audit event). After payment, correction shall occur only through credit notes; a paid invoice shall never be edited or deleted.

Invoice rules:

1. Draft assembly shall be system-controlled; line items derive solely from valid triggers.
2. Issue shall snapshot: prices, pricing version, tax treatment, discounts, service/product identifiers, branch, and trigger references.
3. Locking shall occur at issue or within a bounded, configured draft window.
4. Zero-priced services shall be recorded as non-chargeable events without invoice lines, preserving the zero-price rule reference.

## 17.3 Payment Declaration and Validation States

```text
Declared (Front Office or Patient)
→ Pending Finance Validation
→ Validated → Receipt Generated
   or
→ Rejected (reason recorded, declarant notified)
```

Rules:

1. Every declaration shall record: invoice reference; declared amount; payment method; payment reference where applicable; evidence attachments where required; declarant; branch; timestamp.
2. Validation and rejection shall be Finance-exclusive, idempotent, and audit-logged.
3. A declaration shall not be applied twice; idempotency keys shall guard duplicate submission.
4. Approved amounts shall not exceed the permitted invoice balance without the controlled overpayment workflow.
5. Partial payments shall update invoice balance and state deterministically.

## 17.4 Receipt Rules

After Finance validates payment:

1. A receipt shall be generated automatically.
2. The receipt shall become immutable.
3. The receipt shall be visible to the Patient Account.
4. Front Office shall receive confirmation.
5. Finance shall retain full validation details.
6. Audit shall receive read-only access.

The patient receipt shall contain: facility name; branch; patient reference; invoice reference; services or products; amount paid; payment method; payment reference where applicable; timestamp; receipt identifier; and validation status.

The patient receipt shall not contain: Curis platform fees; merchant-to-Curis balances; internal commission logic; internal fraud flags; or staff-only notes.

Required receipt statement:

> **This receipt reflects payment information recorded and validated by the healthcare facility. Curis does not hold or process patient funds. Tax registration, statutory filing, and remittance obligations remain the responsibility of the applicable healthcare facility and legally responsible parties.**

## 17.5 Credit-Note States

```text
Requested (with mandatory reason category)
→ Approved (Finance; Merchant Administrator where exceptional)
→ Posted (additive reversal entries; invoice balance and tax adjusted proportionally)
```

A credit note shall be required for: service not rendered; duplicate invoice; overcharge; approved partial reversal; pharmacy return; insurance rejection requiring invoice adjustment; regulatory correction; approved refund; incorrect service quantity.

Credit notes shall never exceed the remaining reversible amount.

---

# 18. Pharmacy Workflow State Machines

## 18.1 Dispensing-to-Billing Workflow

```text
Valid prescription
→ Pharmacy validation
→ Medication and batch selection
→ Quantity confirmation
→ Stock verification
→ Dispensing confirmation
→ Immutable dispensing record
→ Stock deduction
→ Pharmacy invoice generation
→ Payment declaration
→ Finance validation
→ Receipt generation
```

## 18.2 Prescription States

```text
Draft (inside consultation)
→ Issued/Active
→ Partially Dispensed
→ Fully Dispensed
→ Closed
```

Exceptional: Cancelled (physician, pre-dispensing); Expired.

## 18.3 Supported Behaviors

The platform shall support:

1. Full dispensing.
2. Partial dispensing with pending remainder.
3. Permitted substitution with reason capture.
4. Dispensing reversal before payment.
5. Return requests and credit notes after payment.
6. Non-resalable returns.
7. Batch-level stock restoration where permitted, only after Inventory validation.
8. Insurance and co-pay splits on pharmacy invoices.

## 18.4 Prohibited Behaviors

The platform shall prevent:

1. Dispensing without a valid prescription.
2. Unbilled dispensing.
3. Price modification by Pharmacy.
4. Silent stock changes.
5. Duplicate dispensing against the same prescription item.
6. Return quantities greater than dispensed quantities.

---

# 19. Laboratory Workflow State Machines

## 19.1 Laboratory Workflow

```text
Physician laboratory request or permitted direct-test request
→ Chargeability and price validation
→ Laboratory order
→ Sample collection
→ Test in progress
→ Result entry
→ Result validation
→ Result finalization
→ Physician notification
→ Patient-release decision
→ Patient record update
```

## 19.2 Laboratory Order States

```text
Requested
→ Awaiting Sample
→ Sample Collected
→ In Progress
→ Completed
→ Validated
→ Released
```

Exceptional: Recollection Required (loops to Awaiting Sample with reason); Cancelled (with reason, before completion).

## 19.3 Rules

1. Finalized results shall be immutable and corrected only through a controlled amended-result process that versions the result and preserves the original.
2. Specimen records shall capture collection time, collector, specimen type, and rejection reasons where applicable.
3. Patient release shall be a distinct authorization step; unreleased results shall not appear in the Patient Account.
4. Laboratory billing events shall trigger per the approved configuration (on approved order or completed service) and shall never be manually invoiced by Laboratory.

---

# 20. Health-Record and Health-Report Workflows

## 20.1 Automatic Post-Visit Report Workflow

```text
Consultation closure
→ AI-assisted draft report from same-day Triage and Physician structured data
→ Health Records notification
→ Health Records review and validation
→ Report finalization (immutable, versioned, branch-attributed)
→ Designation as active report
→ Approved delivery
```

## 20.2 Health-Report Request Workflow

Both Front Office and Patient Account users shall be able to initiate a patient health-report request:

```text
Health-report request
→ Patient identity linkage
→ Delivery format selection
→ Chargeability determination
→ Invoice generation where chargeable
→ Payment declaration
→ Finance validation
→ Receipt generation
→ Health Records notification
→ Report review and finalization
→ Delivery
```

Delivery options:

1. Softcopy PDF through Patient Account and verified email.
2. Printed copy routed to Front Office for physical issuance.

Where the report is non-chargeable: no payment shall be required; the zero-price rule shall be recorded; the request shall proceed directly to Health Records.

## 20.3 External Medical Record Workflow

```text
Patient shares external record (sensitive action, reauthentication required)
→ Stored with provenance (origin facility, source, upload timestamp, metadata)
→ Labelled Externally Sourced
→ Visible only to authorized clinical or health-record roles
→ Health Records validation
→ Controlled merge into longitudinal record (never silent overwrite)
```

## 20.4 Prescription Request Workflow

Both Front Office and Patient Account users may initiate an approved prescription-related request where permitted by facility policy. The workflow shall distinguish between:

1. A request for an existing approved prescription copy.
2. A refill request.
3. A request requiring physician reassessment.
4. A request that cannot legally or clinically be fulfilled without consultation.

The system shall never allow a Front Office or Patient Account user to generate a new prescription independently.

Where a chargeable prescription service exists:

```text
Request
→ Patient and prior-prescription linkage
→ Clinical eligibility validation
→ Invoice generation
→ Payment validation
→ Pharmacy or Physician fulfilment workflow
→ Patient delivery
```

---

# 21. Patient-Facing Workflows

1. **Registration and verification:** self-registration or Front Office initiation → identity verification via email or phone → passwordless authentication setup → trusted-device registration on first login.
2. **Appointment visibility:** patients shall view upcoming and historical appointments with status and branch.
3. **Records access:** patients shall view approved clinical records, prescriptions, released laboratory results, invoices, and validated receipts; downloads of reports and records shall require fresh verification.
4. **Health-report request:** per Section 20.2, initiated in the Patient Account.
5. **Prescription request:** per Section 20.4, initiated in the Patient Account.
6. **Payment declaration:** a patient may declare a payment against their own invoice with method, reference, and evidence; the declaration shall follow the Section 17.3 validation flow.
7. **External record sharing:** per Section 20.3.
8. **Security self-service:** trusted-device review and revocation; login-activity review; verified communication-preference management; login-delivery preference in Account → Security → Login Preferences.

---

# 22. Admissions and Admission-Linked Billing

## 22.1 Unified Admission Record

Curis shall maintain a unified admission record whether the patient is physically admitted:

1. In a Curis-managed ward.
2. In an external ward while being clinically managed through Curis.

## 22.2 Admission States

```text
Admission Initiated
→ Active (ward/bed assigned or external-ward context recorded)
→ Transfer (ward/bed change, recorded)
→ Discharge Ready
→ Discharged (authorized)
→ Closed (final admission bill generated)
```

## 22.3 Rules

1. Every admitted-patient consultation shall remain consultation-based and shall be linked to the active admission.
2. Admission billing shall be event-driven. Billable events may include: admission fee; bed occupancy; ward consultation; procedure; medication; laboratory service; diagnostic service; consumable; nursing or approved ward service; discharge service.
3. Each admission charge event shall be recorded at occurrence with pricing snapshot, actor, branch, and timestamp.
4. The final admission bill shall be generated from accumulated admission-linked events, not manually reconstructed at discharge.
5. An admission shall not close without required discharge authorization.
6. Admission-linked billing events shall never be deleted; corrections use credit notes.

---

# 23. Curis Platform-Billing Workflows

## 23.1 Separation Principle

Curis platform billing shall be separate from patient billing. Patients shall never see: Curis performance fees; merchant onboarding fees; Curis minimum monthly floors; Curis commission calculations; Curis merchant arrears; internal merchant-to-Curis invoices.

## 23.2 Billing Components

Curis billing may contain: onboarding fee; performance-based service fee; minimum monthly platform floor; applicable tax on Curis services; early-payment discount; late-payment fee; prior balance; credit adjustment; payment status; billing cycle.

The Super Administrator shall exclusively control the final Curis billing rules. All percentages, floors, charges, dates, and penalties shall be configured and versioned by the Super Administrator with effective dates.

## 23.3 Illustrative Commercial Configuration

The following figures are configurable commercial examples, not hard-coded product constants.

| Tier | Profile | Onboarding fee (first 90 days, monthly) | Recommended anchor | Post-onboarding performance fee | Minimum monthly floor |
| --- | --- | --- | --- | --- | --- |
| Tier 1 | Small clinics / solo practitioners | KES 120,000–180,000 | KES 150,000 | 10% of applicable revenue processed through Curis | KES 100,000 |
| Tier 2 | Mid-sized clinics / specialist centres | KES 250,000–350,000 | KES 300,000 | 8–10% | KES 200,000 |
| Tier 3 | Large private clinics / multi-department facilities | KES 400,000–600,000 | KES 500,000 | 6–8% | KES 350,000 |

Illustrative payment terms:

1. Payment due within 30 days of invoice issue.
2. Two-percent early-payment discount for full settlement within 10 days; applies only to full settlements; cannot be combined with other incentives; not applicable retroactively.
3. Standard late-payment charge of 1.5% per month on the outstanding balance, accruing from the due date.
4. Configurable high-value overdue-invoice fee (illustrative: flat KES 15,000 for invoices exceeding KES 1,000,000, applied in place of percentage penalties).

Supported Curis invoice cycles, selectable by Merchant Finance from permitted options: weekly; every 14 days; monthly. Once selected, the cycle applies consistently unless modified by authorized administrative action.

## 23.4 Curis Billing Execution Flow

```text
Patient receives healthcare service
→ System generates patient invoice
→ Patient pays healthcare facility off-platform
→ Front Office or Patient records payment declaration
→ Finance validates payment
→ Receipt is generated
→ Validated revenue becomes eligible for Curis fee calculation
→ Curis fee accrues according to merchant tier and billing rules
→ Curis billing period closes
→ Merchant Finance receives Curis invoice
→ Merchant settles Curis externally (Wallet by Citrus rails where configured)
→ Settlement evidence is submitted or confirmed by Wallet webhook
→ Super Administrator validates settlement
→ Curis billing ledger is updated
```

## 23.5 Fee-Adjustment Controls

Curis platform fees shall not be editable through an unrestricted manual amount field. Adjustments shall be traceable to:

1. Credit notes.
2. Invoice reversals.
3. Approved disputes.
4. Pricing corrections.
5. Configuration changes effective from a defined date.

## 23.6 Curis Billing Transparency Ledger

Authorized merchant users (Finance; Merchant Administrator) shall see: revenue basis; fee percentage; minimum floor; adjustments; billing period; Curis invoice; payment status; and outstanding balance.

---

# 24. Invoice, Payment-Validation, Receipt, Credit-Note, and Reconciliation Logic

## 24.1 Financial Subledger

Curis shall maintain a transaction-level healthcare financial subledger. The subledger shall not be represented as a complete replacement for the merchant's external accounting system.

It shall support: patient receivables; insurance receivables; sponsor receivables; validated cash receipts; mobile-money receipts; bank receipts; card receipts; service revenue; pharmacy revenue; laboratory revenue; inventory cost mapping; refund liabilities; Curis platform-fee expense; Curis platform-fee payable; applicable tax liabilities; credit-note reversals; and period close.

## 24.2 Posting Rules

Every posted financial event shall:

1. Have a source document.
2. Have a unique source reference.
3. Be branch-attributed.
4. Be timestamped.
5. Be balanced where double-entry accounting is used.
6. Be immutable after posting.
7. Be corrected through additive reversal entries.
8. Remain reproducible for historical reporting.

Issued or paid invoices shall not be deleted.

## 24.3 Insurance and Sponsor Attribution

1. Invoices shall support payer splits: patient portion, insurance portion, sponsor portion, hybrid combinations.
2. Insurance records shall capture: insurance profile, coverage reference, claim reference, claimed amount, settlement status, rejected amounts, and required adjustments.
3. Rejected claims shall adjust invoices only through credit notes or the controlled adjustment workflow.
4. Curis shall not adjudicate claims; payer decisions are recorded facts.

## 24.4 Daily Branch Reconciliation Snapshot

The platform shall generate a daily snapshot per branch showing: invoices issued; payments declared; payments validated; payments rejected; receipts generated; outstanding balances; credit notes; department revenue; Curis fee accrual; and reconciliation exceptions.

## 24.5 Period Close

1. Finance shall close financial periods per branch or tenant.
2. Closed periods shall reject new postings dated within them; late corrections post into the open period with cross-reference.
3. Reopening shall require controlled approval and shall be audit-logged.

---

# 25. Tax and eTIMS-Readiness Boundaries

## 25.1 Position

> **Curis records, derives, validates, and preserves healthcare billing activity. It does not replace the merchant's accountant, tax adviser, insurer, or statutory filing responsibility.**

Curis shall not assume that healthcare billing is automatically tax-free.

## 25.2 Configurable Tax Support

The system shall support configurable: merchant legal identity; tax-registration identifiers; branch tax settings; service tax classification; product tax classification; tax-inclusive or tax-exclusive pricing; applicable tax rate; tax amount; exemption or zero-rating reason; effective date; pricing version; eTIMS metadata; seller and branch identifiers; and invoice fiscal status where applicable.

Tax logic shall be:

1. Version-controlled.
2. Effective-date controlled.
3. Branch-aware.
4. Service-aware.
5. Product-aware.
6. Preserved in the invoice snapshot.
7. Reversed proportionally through credit notes.
8. Visible only to authorized roles.

## 25.3 Tax Prohibitions

Curis shall not:

1. Provide personalized tax advice.
2. Guarantee a merchant's tax compliance.
3. Submit unrelated tax returns.
4. Calculate a merchant's full income-tax liability.
5. Replace the merchant's statutory advisers.
6. Silently change historical tax treatment.

## 25.4 eTIMS Scope Decision

MVP Lite shall implement an **eTIMS-ready invoice structure**: every invoice shall carry the complete eTIMS metadata fields, fiscal-status placeholders, and seller/branch identifiers required for compliant submission. Live eTIMS submission integration is deferred to Version 2 and, when implemented, shall be a controlled billing integration that does not alter Curis role separation or invoice immutability.

---

# 26. Data Entities and Relationships

## 26.1 Core Entities

The platform shall define, at minimum: Platform; Merchant Tenant; Branch; User; Role; Permission; Staff Profile; Professional Credential; Patient; Patient Identifier; Patient Contact; Patient Consent; Trusted Device; Appointment; Visit; Queue Entry; Triage Session; Vital Sign; Triage Note; Consultation Session; Clinical Note; Diagnosis; Treatment Plan; Prescription; Prescription Item; Medication; Pharmacy Product; Dispensing Record; Dispensing Item; Laboratory Service; Laboratory Order; Specimen; Laboratory Result; Health Report; External Medical Record; Record Merge; Service Catalogue; Product Catalogue; Pricing Version; Discount; Invoice; Invoice Line; Payment Declaration; Payment Validation; Receipt; Credit Note; Refund; Insurance Profile; Insurance Claim Record; Sponsor; Inventory Item; Batch; Stock Movement; Admission; Ward; Bed; Admission Charge Event; Discharge Record; Curis Billing Configuration; Curis Billing Period; Curis Invoice; Curis Settlement; Ledger Account; Journal Entry; Audit Event; Notification; Support Request; Fraud or Risk Flag; Integration Event.

## 26.2 Entity Definition Requirements

For each entity, the detailed design shall define: ownership; tenant boundary; branch boundary; required fields; state; relationships; creation authority; update authority; finalization rules; deletion rules; audit requirements; and retention requirements.

## 26.3 Governing Entity Rules

1. Every tenant-owned entity shall carry `tenant_id`; every branch-attributable entity shall carry `branch_id`.
2. Public identifiers shall be ULIDs; internal sequential keys shall never be exposed via API.
3. Clinical artifacts (Triage Session, Consultation Session, Clinical Note, Diagnosis, Treatment Plan, Prescription, Laboratory Result, Health Report, Dispensing Record) shall reference patient, visit, branch, actor, role, and timestamp, and shall be immutable after finalization.
4. Financial artifacts (Invoice, Invoice Line, Payment Declaration, Payment Validation, Receipt, Credit Note, Journal Entry, Curis Invoice, Curis Settlement) shall be immutable after posting/issuance, corrected only additively.
5. Pricing Version records shall be append-only with effective dates; Invoice Lines shall reference the exact Pricing Version snapshot.
6. Stock Movements shall be append-only; adjustments create new movements referencing originals.
7. External Medical Records shall carry provenance fields (origin facility, source, upload timestamp, provenance metadata, externally-sourced label) and merge state.
8. Record Merge shall preserve survivor designation, source-record preservation, field-level comparison outcome, approver, and audit linkage.
9. Soft deletes shall be used only where business requirements justify recovery; finalized clinical and posted financial records shall never be hard-deleted or soft-deleted.
10. High-volume tables (Audit Event, Stock Movement, Queue Entry, Notification, Integration Event) shall have explicit archival and retention strategies with immutable archives.

## 26.4 Key Relationships

```text
Merchant Tenant 1—N Branch
Branch 1—N (enabled) Role surfaces
User N—M Role (per-branch assignments, conflict-checked)
Patient 1—N Visit (per tenant relationship)
Visit 1—1 Triage Session (outpatient default) ; 1—N Consultation Session (one active)
Consultation Session 1—N {Clinical Note, Diagnosis, Treatment Plan, Prescription, Laboratory Order}
Prescription 1—N Prescription Item ; Dispensing Record N—1 Prescription
Laboratory Order 1—N Specimen ; 1—N Laboratory Result (versioned)
Visit/Trigger 1—N Invoice ; Invoice 1—N Invoice Line (pricing snapshot)
Invoice 1—N Payment Declaration ; Payment Validation 1—1 Receipt
Invoice 1—N Credit Note (bounded by reversible amount)
Admission 1—N Admission Charge Event ; 1—1 Discharge Record
Curis Billing Period 1—N Curis Invoice ; Curis Invoice 1—N Curis Settlement
Journal Entry N—1 source document (typed reference)
Audit Event N—1 actor, N—1 tenant, N—1 branch (nullable for platform events)
```

---

# 27. Audit and Immutable-Event Requirements

1. The platform shall record an immutable audit event for every security-relevant, clinically material, and financially material action, including: login and access events; role and assignment changes; department enablement changes; pricing publications; patient registration and merges; triage completion; consultation finalization; prescription issue; dispensing; result finalization and release; health-report finalization and delivery; invoice issue and state changes; payment declaration, validation, and rejection; receipt generation; credit notes; period close and reopen; Curis fee accrual, invoicing, and settlement validation; break-glass access; staff activation, suspension, and deactivation; configuration and policy-version changes; export generation.
2. Every audit event shall record: actor; tenant; branch; role context; action; target resource and type; timestamp; IP address where appropriate; user agent where appropriate; and before/after values only when safe and necessary, with original-value preservation.
3. Audit events shall be append-only. No role, including the Super Administrator, shall alter or delete an audit event.
4. Audit-event storage shall be tamper-evident (hash-chained or equivalent integrity control) and durable per the Section 33 audit-durability requirement.
5. Audit events shall be queryable by Audit users within their tenant and exportable per Section 36.4.
6. Platform-level audit events (tenant lifecycle, Curis billing configuration, settlement validation) shall be visible to the Super Administrator and, where tenant-relevant, mirrored to tenant Audit visibility without exposing other tenants' data.

---

# 28. Notifications and Communications

## 28.1 Channels

The platform shall support in-app and email notifications, with SMS where specifically approved. Sensitive clinical content shall not be exposed unnecessarily in email or SMS notification previews.

## 28.2 Notification Events

Notifications shall cover: account invitation; magic-link delivery; new-device login; appointment confirmation; appointment reminder; patient check-in; patient added to queue; triage completion; urgent clinical flag; laboratory request; laboratory result completion; prescription issued; dispensing completion; payment awaiting validation; payment approved; payment rejected; receipt issued; health report generated; health report requested; health report delivered; Curis invoice issued; Curis invoice overdue; staff credential expiry; suspicious account activity; break-glass access; tenant or branch suspension.

## 28.3 Delivery Rules

1. Notifications shall be tenant-aware and role-authorized; a notification shall never reveal data its recipient could not access in-app.
2. Delivery shall be queued, retried with backoff, and logged with delivery status.
3. Patients control verified communication preferences; mandatory security notifications (new-device login, contact changes) shall not be suppressible.
4. Notification templates shall be versioned.

---

# 29. Reporting and Analytics

## 29.1 Role-Authorized Reports

The platform shall provide role-authorized reporting for: patient visits; appointments; queue performance; triage performance; physician activity; diagnoses; prescriptions; pharmacy dispensing; medication stock; expiry; laboratory orders; laboratory turnaround time; health-report requests; patient invoices; payment validation; receipts; outstanding balances; insurance receivables; credit notes; refunds; branch revenue; department revenue; Curis platform fees; staff activity; login activity; break-glass access; audit events; admission activity; bed occupancy; discharge activity.

## 29.2 Export Rules

Exports shall be:

1. Permission-controlled.
2. Tenant-scoped.
3. Branch-filterable.
4. Date-filterable.
5. Timestamped.
6. Audit-logged.
7. Protected against formula injection in spreadsheet exports.
8. Watermarked where appropriate.
9. Available in formats such as PDF and CSV according to the report type.
10. Generated through background jobs with tenant context; large exports shall never block interactive requests.

---

# 30. Security and Privacy Requirements

## 30.1 Required Controls

At minimum, the platform shall implement: encryption in transit (TLS 1.2+); encryption at rest; secure passwordless token handling; token hashing; single-use login tokens; session rotation; secure HttpOnly cookies; CSRF protection; Content Security Policy; rate limiting; bot protection; tenant-isolation testing; server-side RBAC enforcement; object-level authorization; device and session visibility; sensitive-action reauthentication; audit logging; secure file storage; malware scanning for uploads; file-type validation; signed download URLs; backup encryption; backup restoration testing; secret management; environment separation; vulnerability management; dependency scanning; centralized error monitoring; database transaction integrity; idempotency for financial and clinical events; data-retention policies; secure deletion where legally permitted; legal-hold capability where required; privacy-by-design controls; and least-privilege access.

## 30.2 Threat Coverage

The application shall defend against: SQL injection; cross-site scripting; cross-site request forgery; broken access control; insecure direct object references; mass assignment; file upload abuse; sensitive data exposure; session fixation; brute-force attacks; API abuse; unsafe redirects; and dependency vulnerabilities.

Implementation requirements: validate all incoming requests server-side (Form Request classes for complex validation); guarded/fillable mass-assignment rules; sanitize and validate uploads; store private files outside public paths; signed URLs for private downloads; escape user-generated content by default; encrypt sensitive fields where appropriate; never log passwords, tokens, API keys, payment data, or secrets; environment variables for secrets; HTTPS enforced in production; strict CORS; rate limits on public and authenticated APIs; automated dependency security scanning.

## 30.3 Privacy Requirements

1. Patient data shall not be used for model training or unrelated commercial processing without an explicit lawful and documented basis.
2. Data minimization shall apply to every integration payload: Refer & Earn events shall carry merchant-level facts only, never patient-identifiable data; Wallet by Citrus payloads shall carry settlement references only.
3. Patient consent records shall govern external sharing; consent shall be revocable prospectively.
4. Data-subject access, correction (via controlled amendment), and export shall be supported within the clinical-integrity constraints.
5. Retention shall follow configured healthcare-record retention policies; legal holds shall suspend deletion.

---

# 31. Clinical Safety Controls and Clinical AI Position

## 31.1 Permitted MVP AI Assistance

MVP AI may assist with:

1. Structuring clinician-entered information.
2. Drafting a health-report summary from completed structured data.
3. Drafting a visit summary.
4. Identifying missing required fields.
5. Highlighting possible data inconsistencies.
6. Suggesting documentation completeness checks.
7. Supporting record classification.

All AI output shall:

1. Be visibly marked as AI-assisted.
2. Require authorized human review.
3. Never become final merely because the AI produced it.
4. Retain source references.
5. Retain model and version metadata where appropriate.
6. Be excluded from independent clinical authority.

## 31.2 Deferred Advanced AI (Non-MVP)

Deferred: dynamic deterioration prediction; autonomous triage classification; differential-diagnosis expansion; diagnostic prediction; medication dosing recommendations; antibiotic stewardship enforcement; longitudinal disease-progression modelling; autonomous clinical alerts that directly change care; automated treatment-plan generation.

## 31.3 Absolute AI Prohibitions

AI shall never:

1. Diagnose a patient independently.
2. Prescribe medication.
3. Sign a health report.
4. Finalize clinical notes.
5. Override a licensed clinician.
6. Conceal uncertainty.
7. Replace an emergency-care pathway.

## 31.4 Clinical Safety Controls

1. Allergy and chronic-condition visibility at triage and consultation.
2. Urgent and emergency flags with visible queue prioritization.
3. Prescription validation gates before dispensing (Section 18).
4. Batch and expiry verification before dispensing.
5. One-active-session rules preventing divided clinical attention contexts.
6. Closure-verification gates preventing incomplete clinical records.
7. Break-glass emergency access (Section 36.2) preserving care continuity under audit.
8. Downtime safeguard mode (Section 32) preserving read access to essential clinical information.

---

# 32. Business-Continuity and Downtime Requirements

## 32.1 Downtime Safeguard Mode

During critical infrastructure disruption, the platform shall:

1. Preserve read-only access to essential clinical information where technically possible.
2. Prevent half-completed financial events.
3. Queue permitted writes for controlled recovery.
4. Display system status.
5. Prevent duplicate submissions after restoration.
6. Preserve transaction ordering.

## 32.2 Backup and Disaster Recovery

1. Automated, encrypted backups with defined schedules per data class.
2. Periodic, verified backup restoration testing.
3. Documented disaster-recovery procedures with defined RPO and RTO (Section 33).
4. Cross-checked recovery of financial and clinical event ordering after restoration.

## 32.3 Integration Continuity

1. Wallet by Citrus or Refer & Earn unavailability shall never block clinical operations or patient billing; outbound events shall queue with persistent retry, dead-letter states, and alerting.
2. Refer & Earn central unavailability shall follow the governing specification: merchant registration continues; attribution snapshots are stored; events queue; attribution is marked pending central confirmation.

---

# 33. Non-Functional Requirements

| Dimension | Requirement |
| --- | --- |
| Availability | ≥ 99.9% monthly for core clinical and billing services, measured excluding announced maintenance |
| Performance | P95 interactive API response ≤ 500 ms; P95 page interactive ≤ 3 s on standard broadband; queue-board refresh ≤ 5 s |
| Scalability | Horizontal scaling of web and worker tiers; no architectural ceiling below 500 concurrent merchant tenants and 5,000 concurrent clinical sessions |
| Reliability | Retry-safe event processing; zero-loss financial event handling; failed-job tracking and replay |
| Data consistency | Database transactions for all multi-step clinical and financial writes; optimistic locking where concurrent edits may occur |
| Recovery-point objective | ≤ 15 minutes for transactional data |
| Recovery-time objective | ≤ 4 hours for core services |
| Audit durability | Audit events durable across failures; no loss after acknowledgement; tamper-evident storage |
| Notification reliability | At-least-once delivery with idempotent rendering; failed-delivery alerting |
| File processing | Virus-scanned, validated, resumable where large; processing failures alertable and retryable |
| Browser support | Latest two major versions of Chrome, Edge, Firefox, Safari |
| Mobile responsiveness | CSS media-query breakpoints: Desktop ≥ 1025px; Tablet 768–1024px; Mobile ≤ 767px; no JavaScript layout-state detection; no horizontal scroll on normal content |
| Accessibility | WCAG AA-aligned: keyboard navigation, visible focus, labelled inputs, associated errors, ≥ 44×44 pt touch targets, browser zoom respected, reduced-motion respected |
| Localization | English at launch; text externalized for future locales |
| Time zones | Timestamps stored UTC; rendered in branch time zone (default Africa/Nairobi) |
| Currency | KES at launch; currency-aware money types; no floating-point money arithmetic |
| Date/time formatting | Locale-consistent, unambiguous formats with time zone indication on clinical and financial records |
| Search performance | Patient and record search P95 ≤ 1 s within tenant scope |
| Report generation | Background-generated; standard reports ≤ 60 s; user notified on completion |
| Concurrency | One-active-session and one-active-consultation rules enforced under concurrent access |
| Background jobs | Redis-backed queues; tenant context preserved; failed-job dead-lettering |
| Observability | Structured logs, error tracking, performance monitoring, queue monitoring, alerting for critical failures |
| Deployment | Dockerized CI/CD; migrations run safely; rollback procedures; health checks; uptime monitoring |
| Migration safety | Backward-compatible, reversible migrations for zero-downtime deploys |

UI standards: light mode default with dark-mode toggle persisted per user; accessible contrast in both themes; Apple HIG-inspired visual discipline (clear hierarchy, minimal clutter, consistent spacing and typography, purposeful motion); stable, accessible forms with duplicate-submit prevention; component-based frontend (Vue.js or React.js with TypeScript); no jQuery; no secrets or privileged authorization logic in the frontend.

## 33.1 Core Technology Stack (per Product Technical Details v.2)

| Layer | Technology |
| --- | --- |
| Backend | Laravel, PHP 8.2+ |
| Frontend | Vue.js or React.js, TypeScript preferred |
| Styling | Tailwind CSS |
| Database | PostgreSQL preferred |
| Authentication | Laravel Sanctum (SPA/API); passwordless flows per Sections 11.1–11.2 |
| API style | REST under `/api/v1/...` |
| Build tooling | Vite |
| Queues | Redis-backed Laravel Queues |
| Cache | Redis |
| Storage | S3-compatible object storage |
| Search | Meilisearch or Typesense (tenant-filtered indexes) |
| Deployment | Dockerized deployment with CI/CD |

---

# 34. Integration Requirements

## 34.1 Wallet by Citrus (Governing Specification: Wallet_by_Citrus_Platform_Project_Scope.md)

Wallet by Citrus is the centralized, API-first payment orchestration, treasury, ledger, and reconciliation platform for Citrus Labs Limited's SaaS products. Where this document conflicts with the Wallet specification, the Wallet specification prevails.

Requirements:

1. Curis shall be registered as a product in the Wallet by Citrus Product Registry through the controlled administrative workflow, with product name, product code, product slug, owners, production and sandbox webhook destinations, expected reference formats, and associated product-scoped ledger accounts (Curis collection revenue, Curis refund liability, Curis payout liability, Curis provider fee expense, platform fee revenue).
2. Curis shall receive separate machine-application credentials per environment (sandbox, staging, production) using OAuth 2.0 client credentials with scoped access, IP allowlists, and per-application webhook secrets; a compromised credential for one environment or product shall not grant access to another.
3. All Citrus-side money movement for Curis — merchant onboarding-fee collections, Curis platform-fee settlements, merchant-to-Curis payments, and Curis-fee refunds — shall be executed through Wallet by Citrus rails (M-PESA C2B with structured bill references, STK Push, PesaLink, bank transfer) rather than product-local payment logic. Curis shall not register its own payment-provider callbacks, shall not store provider credentials, shall not process provider webhooks directly, and shall not perform provider or bank reconciliation.
4. Merchant-to-Curis settlement via Wallet shall use immutable, product-prefixed structured bill references (illustrative format: `CUR-PAY-<ULID>`) registered in the Wallet product record, deterministically identifying the Curis product, merchant tenant, and Curis invoice. References shall never contain raw sequential database identifiers or personal data. External payment references shall be unique per Curis application.
5. Curis shall consume signed, versioned, retryable Wallet webhooks (HMAC or asymmetric signatures, timestamp and replay-window validation, idempotent event identifiers, per-application secrets with rotation) to update Curis Settlement records; a Wallet-confirmed settlement shall enter the Super Administrator validation flow as authoritative settlement evidence.
6. Curis shall call the Wallet product APIs (`/api/v1/payments`, `/api/v1/refunds`, and related routes) with idempotency keys scoped per application and operation for any Curis-initiated collection or refund instruction. A repeated idempotency key with a different request body shall be treated as a conflict, never as a retry.
7. Curis shall treat the Wallet ledger, settlement, and reconciliation states as the authoritative financial truth for all Citrus-side money movement. Curis shall distinguish payment success, bank settlement, and reconciliation completion as separate states (a `SUCCEEDED` collection is not proof of settlement), and shall treat an `UNKNOWN` payout or collection state as unresolved — never as failed — and shall never blindly retry an operation whose provider status is unresolved.
8. Curis end users (patients and merchant staff) shall never log in to Wallet by Citrus directly; all payment-related user experience shall remain inside Curis, which calls Wallet APIs and receives signed webhook updates. Where Wallet-delegated access is required for Curis merchant users, Curis shall expose the trusted identity-verification endpoint defined by the Wallet specification, returning product, merchant account, role, permission, membership status, and identity version.
9. Curis shall not build or represent any stored-value wallet, withdrawable balance, or funds-custody capability, and shall not represent Wallet ledger balances as bank deposits.
10. Patient payments to healthcare facilities remain off-platform declarations under Section 7.1; nothing in the Wallet integration makes Curis a payment processor or funds custodian. Where a facility elects a Citrus-provided gateway channel for patient payments in a later phase, that channel shall be a Wallet-orchestrated integration and the Finance validation boundary shall remain unchanged.
11. Wallet unavailability shall degrade gracefully per Section 32.3; settlement evidence submission by Merchant Finance remains available as the manual path.

## 34.2 Citrus Refer & Earn (Governing Specification: Refer_and_Earn_Project_Scope.md)

Citrus Refer & Earn is the central system of record for referrer identity, attribution, qualification, reward calculation, and payouts. Curis is a product participant. Where this document conflicts with the Refer & Earn specification, the Refer & Earn specification prevails.

Requirements:

1. Curis remains authoritative for its product facts: merchant registration, merchant identity, Merchant Administrator account, setup completion, Curis billing tier and plan, Curis invoices, Curis invoice payments, refunds, chargebacks, merchant billing status, merchant operational status, product-specific merchant activity, and product-specific suspension.
2. Refer & Earn shall not query Curis's internal operational database; Curis shall emit trusted, signed events and answer authenticated verification requests through a dedicated Product Integration Service Account.
3. Curis shall emit the required product events, including: `merchant_registration_started`; `merchant_registered`; `merchant_email_verified`; `merchant_setup_completed`; `merchant_subscription_selected` (Curis billing-tier selection); `subscription_invoice_issued` (Curis invoice issued); `subscription_invoice_fully_paid` (Curis invoice fully settled and validated); `subscription_payment_partially_paid`; `subscription_payment_reversed`; `subscription_refunded`; `subscription_chargeback_recorded`; `merchant_billing_suspended`; `merchant_reactivated`; `merchant_deactivated`; `merchant_plan_changed` (tier change); `merchant_branch_created`; `eligible_operational_activity_completed`; `merchant_identity_updated`; `merchant_duplicate_detected`.
4. Curis shall issue the single authoritative final activity event `merchant_activity_qualification_decided` per merchant, period, and versioned Curis active-use rule, with decision versioning and superseded-event references. A Curis active-use rule (for example: minimum counts of completed visits, validated invoices, and active staff logins in the service month) shall be defined, versioned, and approved before launch campaigns.
5. Event envelopes and signatures shall follow the Refer & Earn contract: raw-body HMAC signing with `X-Citrus-Key-Id`, `X-Citrus-Timestamp`, `X-Citrus-Signature`, `X-Citrus-Environment`, `X-Citrus-Event-Id`, `X-Citrus-Algorithm`; event-ID idempotency; duplicate-content quarantine; bounded key-rotation overlap.
6. Curis shall implement product-side retry: exponential backoff, persistent queue, dead-letter queue, alert thresholds, and manual replay preserving original event IDs.
7. Curis shall capture referral attribution context at merchant registration (referral code or link snapshot), including during central unavailability, marking attribution `pending_central_confirmation` and queueing events. Merchant registration shall never be blocked by Refer & Earn unavailability; no reward-affecting outcome shall be assumed until central confirmation.
8. Referral-code capture shall follow the governing precedence and lock rules: a link-derived code may be prefilled but shall remain replaceable until registration submission; the attribution shall lock at successful merchant-tenant creation; post-lock code changes shall be rejected except through the central dispute or correction route; server-side validation shall be authoritative and frontend state shall never be treated as authoritative. Curis shall submit the attribution evidence bundle (signed-link claim, manual-code claim, cookie claim, merchant confirmation timestamp, registration submission timestamp) and shall let the central platform apply precedence.
9. Exactly one effective earning attribution shall exist per Curis merchant tenant; Curis shall use a consistent merchant-product tenant identifier, shall emit `merchant_duplicate_detected` where duplicate tenants are suspected, and shall not treat branch creation within an existing tenant as a new referral.
10. Curis shall store only the minimum local attribution fields permitted by the governing specification (referral attribution ID, referral code snapshot, referrer reference, campaign ID and version, attribution timestamp and statuses, merchant tenant ID). Curis shall not store referrer payout methods, referrer tax records, earnings balances, or fraud evidence.
11. Curis shall not calculate, accrue, ledger, or pay referral rewards, and shall not duplicate any Refer & Earn attribution, qualification, reward-calculation, retention-milestone, adjustment, or payout logic. Referrer payouts are executed centrally by Refer & Earn; Curis has no payout-execution role. Curis's sole reward-affecting obligations are the accurate, timely emission of the signed product events, including refund, chargeback, deactivation, and corrected activity-qualification events (with a higher `decision_version` referencing the superseded event) that the central platform uses for qualification, holds, and reversals.
12. Curis shall emit `subscription_invoice_fully_paid` only when the Curis invoice is fully settled, validated, and reconciled — never on a pending or merely authorized payment.
13. Curis shall expose the scheduled reconciliation API fields: product merchant ID, Curis invoice ID, paid amount, payment date, refund amount, chargeback status, billing period, activity qualification, and merchant status.
14. Referral events shall carry merchant-level data only; no patient-identifiable information shall ever appear in a Refer & Earn payload.
15. Curis marketing surfaces (public product website, registration screen with optional referral code, Merchant Administrator dashboard limited attribution notice) shall support the product-native Refer & Earn experience defined in the governing specification; the Merchant Administrator notice shall never expose referrer financial data.
16. Before any Curis referral campaign activates, the following shall be registered with Refer & Earn: the Curis product ID and registration URL, the Curis referral-code prefix, the versioned Curis active-use rule, and the eligible Curis billing tiers and cycles.

## 34.3 eTIMS (Version 2 Live Integration; MVP eTIMS-Ready)

Per Section 25.4. The invoice data model, fiscal metadata, and credit-note reversal semantics shall be designed so that live eTIMS submission can be enabled without schema-breaking changes.

## 34.4 Communications Providers

1. Transactional email provider for magic links, OTPs, notifications, and support emails, with delivery-status webhooks.
2. SMS provider for approved SMS notifications and patient OTP delivery, with cost controls and throttling.
3. Provider failures shall queue and retry; authentication-critical messages shall have priority routing.

## 34.5 API and Integration Foundations

1. All Curis APIs shall be versioned under `/api/v1/...`, validated, authenticated, tenant-authorized, rate-limited, and paginated, returning consistent JSON structures and structured errors per Section 35.
2. Webhook and event infrastructure (outbound to Refer & Earn, inbound from Wallet) shall be idempotent, signed, replay-protected, and logged as Integration Events.
3. Integration credentials shall be stored in the platform secret store, rotated on schedule, and never logged.

---

# 35. Error and Exception Handling

## 35.1 Error Response Standard

APIs shall return structured errors: machine-readable code; human-readable message; field-level validation details; correlation identifier; no internal stack traces or sensitive internals. Proper HTTP status codes shall be used throughout.

## 35.2 Workflow Exception Handling

| Scenario | Required Behavior |
| --- | --- |
| Magic link expired or reused | Reject; offer re-request; rate-limit; log attempt |
| OTP exhausted or expired | Reject; throttle resends; escalate on anomaly patterns |
| Login for suspended tenant/branch/staff | Reject with generic message; log with specific reason |
| Duplicate patient detected at registration | Surface candidates; require human decision; never auto-merge |
| Triage started without valid check-in | Block; state machine prevents transition |
| Consultation closure with incomplete requirements | Block closure; list unmet requirements |
| Prescription dispensing against invalid status | Block; record attempt |
| Stock insufficient at dispensing | Block or route to approved-exception flow; record decision |
| Duplicate dispensing attempt on same item | Block via idempotency and item-state check |
| Return exceeding dispensed quantity | Block; validation error |
| Laboratory result upload without order | Block unless permitted direct-test workflow applies |
| Result correction after finalization | Route to amended-result process; version and preserve original |
| Invoice trigger missing pricing | Block issuance; alert Branch Account for pricing; queue trigger |
| Payment declaration exceeding balance | Route to controlled overpayment workflow or reject |
| Duplicate payment declaration | Idempotent rejection with reference to original |
| Finance validation of own declared payment | Block via separation-of-duties check |
| Credit note exceeding reversible amount | Block; validation error |
| Period-close violation | Reject posting into closed period; post to open period with cross-reference |
| Staff deactivation with open obligations | Block until reassignment or formal resolution (Section 15.4) |
| Break-glass without reason | Block; reason is mandatory |
| Refer & Earn event rejection | Retry with backoff; dead-letter; alert integration owner |
| Wallet webhook signature failure | Reject; log security event; alert |
| Duplicate integration event ID with different payload | Quarantine; critical integrity alert |
| Export/formula injection attempt | Sanitize spreadsheet cell prefixes on export |
| Concurrent edit conflict | Optimistic-lock rejection with reload guidance |
| Half-completed financial write at failure | Transaction rollback; idempotent retry; no partial postings |

## 35.3 Human-Facing Error Rules

1. Error messages shall explain the issue and expected correction without exposing internals.
2. Clinical-blocking errors shall be prominent and shall never fail silently.
3. All rejected sensitive actions shall be audit-logged with the rejection reason.

---

# 36. Launch-Readiness Requirements

## 36.1 Tenant Activation Checklist Gate

A merchant tenant shall not go live until required configurations are complete, including:

1. Merchant identity.
2. Branch configuration.
3. Initial Administrator and HR authority.
4. Required clinical roles.
5. Service configuration.
6. Pricing configuration.
7. Payment-validation workflow.
8. Audit access.
9. Security settings.
10. Patient communication configuration.
11. Curis billing configuration (tier, cycle, effective terms).
12. Required compliance documentation.

The checklist state shall be visible to the Super Administrator and the Merchant Administrator; activation shall be a logged Super Administrator action.

## 36.2 Break-Glass Emergency Access

The platform shall provide controlled emergency access to patient records with:

1. Mandatory reason.
2. Limited duration.
3. Restricted scope.
4. Prominent warning.
5. Reauthentication.
6. Immediate audit logging.
7. Administrative notification.
8. Post-event review.

## 36.3 Downtime Safeguard Mode

Per Section 32.1; downtime behavior shall be tested before launch.

## 36.4 Immutable Audit Export

Authorized Audit users shall be able to export: timestamped event records; user identities; role context; branch context; original and amended values; access events; break-glass events; financial-validation chains; and clinical-finalization chains. Exports shall be tenant-scoped, timestamped, and audit-logged.

## 36.5 Duplicate Patient Resolution

The platform shall support: potential duplicate detection; human review; field comparison; controlled merge; survivor-record designation; source-record preservation; audit trail; and prohibition against unsafe automatic merges.

## 36.6 Invoice Lock Safeguard

Per Section 17.2: draft period; issued state; locked state; payment-pending state; paid state; cancelled-before-payment state; credit-note-only correction after payment.

## 36.7 Staff Responsibility Check

Per Section 15.4: deactivation blocked while unresolved responsibilities exist.

## 36.8 Daily Branch Reconciliation Snapshot

Per Section 24.4.

## 36.9 Curis Billing Transparency Ledger

Per Section 23.6.

## 36.10 Pre-Launch Verification

Before production launch, the following shall pass:

1. Automated tenant-isolation test suite.
2. RBAC and role-conflict test suite.
3. Full clinical chain end-to-end test (registration → receipt → Curis fee accrual).
4. Financial integrity tests (idempotency, credit-note bounds, period close).
5. Restore-from-backup drill.
6. Downtime safeguard drill.
7. Wallet and Refer & Earn sandbox integration verification.
8. Security review covering the Section 30.2 threat list.
9. Accessibility review against Section 33 standards.
10. Merchant onboarding dry run against the activation checklist.

---

# 37. Acceptance Criteria

Every major feature shall have testable positive and negative acceptance criteria in Given/When/Then form. The following are governing examples; the full catalogue shall be maintained in the test plan.

## 37.1 Payment Validation

* Given an issued patient invoice,
* And a Front Office user has recorded a payment declaration,
* When an authorized Finance user approves the payment,
* Then the platform shall mark the approved amount as validated,
* Generate an immutable receipt,
* Update the invoice balance,
* Record the validating Finance user,
* Record the validation timestamp,
* Create the required ledger entries,
* Make the receipt visible to the Patient Account,
* And create an audit event.

Negative criteria:

* A Front Office user shall not be able to validate the payment.
* A receipt shall not be generated for a rejected payment declaration.
* A payment declaration shall not be applied twice.
* An approved amount shall not exceed the permitted invoice balance without a controlled overpayment workflow.

## 37.2 Consultation Finalization

* Given an active consultation with complete required notes, diagnosis, and treatment plan,
* When the physician closes the consultation,
* Then the clinical record shall become immutable, the visit record shall be created, billing events shall be triggered, the health-report workflow shall be triggered, and the queue shall update.

Negative criteria:

* Closure shall be blocked while any prescription is in an invalid draft state or any laboratory request is incomplete.
* A finalized note shall not be editable; a correction shall create a versioned amendment.
* A consultation shall not start without a valid visit.

## 37.3 Dispensing

* Given a valid Active prescription with catalogued, priced (or explicitly non-chargeable), in-stock items,
* When Pharmacy confirms dispensing,
* Then an immutable dispensing record shall be created, batch-level stock deducted, and a pharmacy invoice generated automatically.

Negative criteria:

* Dispensing shall be blocked against expired, cancelled, or draft prescriptions.
* A second dispensing of the same fully dispensed prescription item shall be blocked.
* Pharmacy shall not modify the invoice total.

## 37.4 Tenant Isolation

* Given two active merchant tenants,
* When any user of tenant A queries any API, search, report, export, or notification surface,
* Then no record owned by tenant B shall be returned, inferred, enumerated, or modified.

Negative criteria:

* Changing identifiers in URLs or payloads shall not expose tenant B data.
* A staff user of tenant A shall not authenticate into tenant B.

## 37.5 Curis Fee Accrual

* Given validated merchant revenue in an open Curis billing period,
* When the period closes,
* Then the Curis fee shall be calculated from the versioned tier configuration, the minimum floor applied where applicable, the Curis invoice issued to Merchant Finance, and the transparency ledger updated.

Negative criteria:

* A Curis fee shall not accrue from a deleted or nonexistent invoice.
* A Curis fee shall not be editable through an unrestricted manual amount field.
* A patient-facing surface shall never display Curis fee data.

## 37.6 Role Conflict

* Given a staff user holding the Front Office role,
* When HR attempts to assign the Finance role to the same user,
* Then the assignment shall be blocked, the attempt logged, and the conflict rule identified.

## 37.7 Break-Glass

* Given a clinician without ordinary access to a record,
* When break-glass access is invoked with a mandatory reason and reauthentication,
* Then time-limited, scope-restricted access shall be granted, immediately audit-logged, administratively notified, and queued for post-event review.

Negative criterion: break-glass without a recorded reason shall be impossible.

---

# 38. Assumptions

1. Launch market is Kenya; currency is KES; default time zone is Africa/Nairobi.
2. Merchant facilities hold the licenses and statutory registrations required to operate; Curis records but does not confer regulatory standing.
3. Patients or facilities have access to email or SMS-capable phones for passwordless authentication.
4. Facility staff have branch internet connectivity; offline-first clinical operation is out of MVP scope beyond the downtime safeguard mode.
5. Wallet by Citrus and Citrus Refer & Earn expose the integration contracts defined in their governing specifications and sandbox environments before Curis launch.
6. The first launch merchants include facilities requiring admissions and specialist departments, justifying their launch-core classification.
7. Insurance payer decisions are made externally and communicated to the facility; Curis records outcomes.
8. Merchant-to-Curis settlement occurs through external payment with Wallet-confirmed or manually evidenced settlement.
9. Kenyan data-protection law (including the Data Protection Act, 2019) governs personal-data handling; the platform's privacy controls are designed to support merchant compliance.

# 39. Dependencies

1. Wallet by Citrus product registration, machine credentials, structured bill-reference allocation, and webhook endpoints.
2. Citrus Refer & Earn product registry entry, signing keys, event-schema versions, and campaign configuration.
3. Transactional email and SMS providers with production sending domains and sender IDs.
4. S3-compatible object storage, Redis, PostgreSQL, and container infrastructure.
5. Domain and TLS provisioning for all role portals (`*.curis.ke`, `curis.citruslabs.limited`, `curis.ke`).
6. eTIMS technical specifications for the eTIMS-ready invoice structure fields.
7. Approved medical health-report template as the report-rendering baseline.
8. Merchant onboarding materials, contracts, and tier assignments from Citrus Labs commercial operations.

# 40. Risks and Mitigations

All percentage estimates below are labelled estimates based on stated assumptions; none is independently verified evidence.

| Risk | Assessment (assumption-based) | Mitigation |
| --- | --- | --- |
| Clinical record fragmentation | High impact if staff bypass the system for speed | Enforced execution chain; fast structured forms; training; adoption monitoring |
| Revenue leakage at merchant | Principal merchant pain point; leakage of 5–15% of revenue is a commonly cited industry estimate, assumption-dependent | System-derived billing; unbilled-dispensing prevention; daily reconciliation snapshots |
| Unbilled dispensing | Likely without deterministic triggers | Dispensing-completion auto-billing; audit visibility |
| Price manipulation | Moderate likelihood in cash-heavy contexts | Versioned pricing; snapshot invoicing; separation of duties; pricing-change audit |
| Duplicate patients | Expected in walk-in-heavy facilities | Detection at registration; controlled merge; no auto-merge |
| Cross-tenant exposure | Low likelihood with layered controls; severe impact | Layered isolation (Section 9.5); CI isolation tests; deployment gate |
| Unauthorized role access | Moderate without conflict engine | Role-conflict engine; server-side RBAC; session-context separation |
| Payment-validation fraud | Moderate; collusion risk | Separation of duties; evidence capture; audit chains; anomaly flags |
| Insurance-reconciliation gaps | High operational friction | Receivable tracking; credit-note-governed adjustments; aging reports |
| Inventory shrinkage | Common in pharmacy operations | Batch-level immutable movements; reconciliation; write-off approvals |
| Health-report integrity | Reputational and legal exposure | Human validation gate; immutability; provenance; versioning |
| AI clinical-safety | Severe if unbounded | Section 31 hard boundaries; human review; visible AI marking |
| Implementation complexity | High: many roles, workflows, and integrations | Phased delivery (Section 43); state-machine-driven design; strong test coverage |
| Merchant onboarding friction | High onboarding fees demand strong activation support | Activation checklist; onboarding playbooks; dedicated onboarding phase |
| Training burden | Every role has a distinct portal | Role-specific quick-start guides; in-app guidance; sandbox tenants |
| Adoption risk | Staff may resist governed workflows | Executive sponsorship at merchant; phased branch rollout; usage dashboards |
| Regulatory risk | Health-data and fiscal rules evolve | Configurable tax/eTIMS metadata; retention policies; legal review cadence |
| Operational-support burden | Email-based MVP support may saturate | Severity triage; FAQ deflection; support-volume monitoring; Version 2 tooling |

---

# 41. MVP Lite Scope

The launch-ready MVP Lite shall include, at minimum:

1. Merchant onboarding.
2. Tenant activation checklist.
3. Multi-branch support.
4. Healthcare tenant isolation.
5. Merchant Administrator portal.
6. Branch configuration.
7. HR staff management.
8. Magic-link staff login.
9. Patient passwordless login.
10. Role-based access control.
11. Role-conflict detection.
12. Patient registration.
13. Duplicate-patient detection.
14. Appointment scheduling.
15. Check-in and queue management.
16. Triage.
17. Physician consultation.
18. Structured clinical notes.
19. Diagnosis and treatment plan.
20. Prescriptions.
21. Laboratory requests and results.
22. Pharmacy dispensing.
23. Basic healthcare inventory.
24. Health-report generation and fulfilment.
25. Patient longitudinal history.
26. System-derived invoices.
27. Off-platform payment declaration.
28. Finance payment validation.
29. Immutable receipts.
30. Insurance and sponsor payment attribution.
31. Credit notes.
32. Branch revenue reconciliation.
33. Curis platform-fee calculation.
34. Curis billing transparency ledger.
35. Merchant-to-Curis invoicing and settlement recording (Wallet-integrated).
36. Audit logs.
37. Immutable audit export.
38. Patient-facing records, invoices, and receipts.
39. Notifications.
40. Break-glass access.
41. Downtime safeguard mode.
42. Help and Support email workflow.
43. Security monitoring.
44. Backup and disaster recovery.
45. Operational dashboards.
46. Role-authorized reports.
47. API and integration foundations (Wallet by Citrus; Refer & Earn).
48. eTIMS-ready invoice structure.
49. **Admissions and Ward Management (launch-core).**
50. **Specialist department accounts: Optician, Mental Health, Nutrition, Maternal and Child Health, Dentistry (launch-core).**

Admissions, Ward Management, and the specialist department accounts are classified as launch-core for the intended first merchant profile. Their per-branch activation remains a Branch Account decision; the architecture supports enabling or disabling them per branch at any time.

# 42. Deferred and Post-MVP Scope

## Version 2

Potential additions: passkey and WebAuthn authentication; expanded specialist departments; advanced ward workflows; enhanced insurer integrations; structured referral network; live eTIMS submission and expanded eTIMS automation; advanced inventory forecasting; more extensive consent management; patient-dependent and caregiver access; controlled inter-facility referrals; expanded accounting exports.

## Version 3

Potential additions: advanced clinical AI; longitudinal risk analytics; predictive deterioration alerts; drug-interaction intelligence; advanced antibiotic stewardship; diagnostic-pattern analysis; expanded payer APIs; national health-system interoperability where lawful and technically approved; medical-device integrations.

## Version 4

Potential additions: enterprise hospital extensions; advanced inpatient orchestration; multi-facility clinical collaboration; advanced population-health analytics; research-data de-identification workflows; enterprise data warehouse; federated analytics.

Post-MVP functionality shall not weaken the original tenant-isolation, role-separation, clinical-immutability, or financial-integrity rules.

# 43. Implementation Phases

## Phase 1 — Foundation

Tenancy, branches, identity and access (magic-link staff login, patient passwordless login), RBAC and role-conflict engine, audit-event infrastructure, tenant activation checklist, core data model, CI/CD, environments, observability baseline.

Exit criteria: isolation and RBAC test suites green; tenant onboarding to activation demonstrable end to end.

## Phase 2 — Clinical Core

Patient registration and duplicate detection, appointments, check-in, queues, triage, physician consultation, structured notes, diagnoses, treatment plans, prescriptions, clinical-record integrity states, health-report generation with Health Records validation.

Exit criteria: full outpatient clinical chain executes with immutability and amendment controls verified.

## Phase 3 — Fulfilment and Financial Core

Laboratory workflows, pharmacy dispensing-to-billing, inventory, system-derived invoicing, payment declaration and Finance validation, receipts, credit notes, subledger, daily reconciliation snapshots, patient-facing billing surfaces.

Exit criteria: Section 37.1–37.3 acceptance criteria pass; financial idempotency tests green.

## Phase 4 — Admissions, Specialist Departments, and Platform Billing

Admissions and Ward Management with event-driven billing; the five specialist department accounts; Curis platform-fee engine, Curis invoicing, transparency ledger; Wallet by Citrus settlement integration; Refer & Earn event emission and reconciliation API.

Exit criteria: admission-linked billing verified; Curis billing cycle executes in sandbox against Wallet; Refer & Earn sandbox events validated.

## Phase 5 — Launch Hardening

Break-glass, downtime safeguard drills, immutable audit export, notifications completion, dashboards, reports and exports, security review, accessibility review, performance testing, backup/restore drills, merchant onboarding dry run, Section 36.10 pre-launch verification.

Exit criteria: all launch-readiness gates pass; first merchant activated through the checklist.

# 44. Final System Guarantees

Curis by Citrus, as scoped in this document, guarantees by construction that:

1. Every patient interaction has a valid context.
2. Every clinical action has an accountable actor.
3. Every finalized clinical record is preserved.
4. Every charge originates from an approved service or healthcare event.
5. Every payment is validated before receipt issuance.
6. Every branch remains operationally attributable.
7. Every staff user remains role-bound.
8. Every Curis fee remains traceable to governed merchant activity.
9. Every critical action remains audit-ready.
10. Every patient sees only approved patient-facing information.
11. No operational role has unilateral control over the complete clinical-to-financial chain.

The correct Curis MVP is not a generic appointment application. It is not merely an EMR. It is not merely a billing system. It is not a payment processor. It is not an autonomous AI doctor. It is a controlled healthcare execution system.

---

# Appendix A: Product Technical Details v.2 Conformance

| v.2 Requirement Area | Conformance in this Scope |
| --- | --- |
| 1. Core technology stack | Section 33.1 adopts the required Laravel/PHP 8.2+, Vue or React with TypeScript, Tailwind, PostgreSQL, Sanctum, REST `/api/v1`, Vite, Redis queues/cache, S3 storage, Meilisearch/Typesense, Dockerized CI/CD; no jQuery |
| 2. SaaS architecture | Sections 8–13: tenants, multi-user, RBAC, permission-based access, isolation, invitation onboarding, audit logging, plan-based control via Curis billing tiers, background processing |
| 3. Multi-tenancy and isolation | Sections 8–9: tenant keys, scoped queries, dual permission+ownership authorization, controlled super-admin workflow, tenant-aware jobs/exports/webhooks, ULID public identifiers |
| 4. Authentication and session security | Section 11: passwordless per product scope (v.2 permits login method per project scope), verification, MFA-equivalent step-up, session controls, secure cookies, CSRF, rate limiting, brute-force protection |
| 5. Authorization, roles, permissions | Sections 12–13: policy-based enforcement on controllers, APIs, forms, jobs, exports, admin screens, billing settings, invitations; frontend checks are UX only |
| 6. Security requirements | Section 30: full threat list and implementation requirements adopted |
| 7. Database and data integrity | Sections 26, 33: migrations, foreign keys, tenant-leading indexes, justified soft deletes, transactions, optimistic locking, pagination, eager loading, archival strategies |
| 8. API requirements | Sections 34.5, 35: versioning, consistent JSON, status codes, validation, authentication, authorization, rate limits, pagination, safe identifiers, structured errors, sanitized logging |
| 9. Frontend requirements | Section 33: component architecture, reusable layouts/forms, centralized API client, state management, error/loading/empty states, accessible forms, safe rendering, no jQuery, no frontend secrets |
| 10. UI/UX | Section 33: content and navigation preservation, professional SaaS presentation |
| 11. Responsive design | Section 33: required breakpoints (≥1025 / 768–1024 / ≤767), CSS-media-query-only responsive state, no device detection, no horizontal scroll, scaling typography and touch targets |
| 12. Dark mode | Section 33: light default, clear toggle, per-user persistence, accessible contrast in both themes |
| 13. Accessibility | Section 33: keyboard navigation, focus visibility, WCAG AA contrast, labels, associated errors, 44×44 targets, zoom respected, reduced motion |
| 14. Apple HIG-inspired standards | Section 33: hierarchy, minimal clutter, consistent spacing/typography, purposeful subtle motion |
| 15. Forms and input behavior | Section 33 and 35.3: labels not replaced by placeholders, clear validation states, duplicate-submit prevention, sectioned long forms |
| 16. User profile and account UI | Adopted: cohesive identity unit, hover/focus feedback, anchored preview cards, clear affordances; CSS presentation-only |
| 17. Performance | Section 33: pagination, indexes, queues, caching, bundle discipline, lazy loading, CDN, monitoring, background jobs, rate limits |
| 18. Observability and auditability | Sections 27, 33: structured logs, error tracking, performance and queue monitoring, failed-job tracking, security and admin activity logs, alerting; audit-event field set adopted |
| 19. Testing | Sections 36.10, 37: authentication, authorization, isolation, API validation, forms, roles, billing enforcement, upload security, critical UI workflows, regression; unit/feature/API/browser/security layers |
| 20. Deployment and production readiness | Section 33: environment config, secret hygiene, CI/CD with pre-deploy tests, safe migrations, queue workers, scheduler, centralized logging, backups, rollback, HTTPS, health checks, uptime monitoring, dependency scanning |
| 21. Deliverables | This document provides architecture, data model, auth model, tenancy model, API structure, frontend structure, responsive strategy, security controls, accessibility, testing, deployment, performance plan, and risk list |
| 22. Non-negotiable rules | All thirteen v.2 non-negotiables adopted without exception |
| 23. Success criteria | Section 36.10 and Section 37 operationalize the v.2 success criteria for launch acceptance |
