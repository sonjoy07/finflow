# FinFlow: Security & Compliance Architecture

## 1. Context: Portfolio Demonstration vs. Production Banking

> **Important Security Boundary**:
> FinFlow is built as a **portfolio-grade demonstration platform** designed to showcase architectural and engineering mastery of high-security fintech patterns. It is not connected to production clearinghouses or real payment networks.
>
> To maintain realism without introducing compliance exposure, FinFlow models production security controls while explicitly segregating them from real cardholder and banking data.

### Comparison Matrix

| Security Dimension | Production Financial System | FinFlow Portfolio Demonstration |
| :--- | :--- | :--- |
| **Banking Rails** | Real clearing connections (Fedwire, ACH, SWIFT) | Deterministic mock gateway route handlers |
| **Cardholder Data (CHD)** | Full PCI-DSS Level 1 HSMs and tokenization | Synthetic tokens and truncated test numbers only (`4242`) |
| **Identity Provider** | Enterprise SAML / Okta / Azure AD SSO | Cryptographically signed mock session cookies |
| **Data Storage** | Encrypted multi-region relational database (PostgreSQL) | Seeded in-memory mock repository |
| **Audit Trails** | Immutable append-only write-once-read-many (WORM) storage | Structured activity logs persisted during session |

---

## 2. Authentication Architecture & Session Handling

### 2.1 Mock Session Simulation
FinFlow simulates enterprise authentication through a cryptographically signed HTTP-only cookie (`finflow_session`):

```typescript
export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'operations_lead' | 'analyst' | 'auditor';
  issuedAt: number;
  expiresAt: number;
}
```

### 2.2 Cookie Configuration
- `HttpOnly: true` (Inaccessible to client-side JavaScript, mitigating XSS token theft).
- `SameSite: Lax` (Protects against Cross-Site Request Forgery on top-level navigation).
- `Secure: true` in production environments (Enforces HTTPS).

### 2.3 Next.js Middleware Protection
Next.js `middleware.ts` intercepts all requests to `/api/*` and `/(dashboard)/*` to verify session integrity and expiration:

```typescript
// middleware.ts concept
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('finflow_session');

  if (!sessionCookie && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

---

## 3. Server-Side Authorization & Role-Based Access Control (RBAC)

FinFlow applies defensive authorization: **client-side UI gating is treated as a visual convenience; the API layer independently validates permissions on every request.**

### 3.1 Permission Matrix

| Operation | Admin | Operations Lead | Analyst | Auditor |
| :--- | :---: | :---: | :---: | :---: |
| `GET /api/dashboard` | Allow | Allow | Allow | Allow |
| `GET /api/transactions` | Allow | Allow | Allow | Allow |
| `POST /api/transactions/:id/retry` | Allow | Allow | **Deny (403)** | **Deny (403)** |
| `GET /api/reconciliation` | Allow | Allow | Allow | Allow |
| `PATCH /api/reconciliation/:id/resolve` | Allow | Allow | Allow | **Deny (403)** |
| `POST /api/workflows` | Allow | Allow | **Deny (403)** | **Deny (403)** |
| `PATCH /api/workflows/:id` | Allow | Allow | **Deny (403)** | **Deny (403)** |
| `GET /api/activity` | Allow | **Deny (403)** | **Deny (403)** | Allow |

If an unauthorized role attempts a mutation, the API returns a structured `403 Forbidden`:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Role 'analyst' lacks permission 'TRANSACTION_RETRY'."
  },
  "timestamp": "2026-11-01T12:00:00Z"
}
```

---

## 4. Input Validation & Defense-in-Depth

Untrusted input from query strings, route parameters, and request bodies is strictly validated using **Zod** before processing:

1. **Strict Type Coercion**: Pagination limits, sort columns, and date ranges are parsed and clamped to safe bounds.
2. **Denial-of-Service Prevention**: Page sizes are capped at 100 items to prevent memory exhaustion.
3. **Payload Sanitization**: String inputs are trimmed and stripped of unexpected script tags.

```typescript
export const createWorkflowSchema = z.object({
  name: z.string().trim().min(3).max(60),
  description: z.string().trim().max(200),
  trigger: z.object({
    eventType: z.enum(['transaction_failed', 'reconciliation_mismatch', 'high_risk_transaction']),
  }),
  conditions: z.array(workflowConditionSchema).min(1).max(5),
  actions: z.array(workflowActionSchema).min(1).max(3),
});
```

---

## 5. Error Sanitization & Information Leakage Prevention

- **No Stack Traces in Production**: Stack traces and raw internal error objects are caught and logged server-side only; they are never transmitted to client responses.
- **Redacted Identifiers**: Database table names, internal server file paths, and environment details are sanitized into generic operational messages.

---

## 6. Sensitive Data Handling & Truncation

In accordance with fintech data protection principles:
1. **Primary Account Numbers (PAN)**: Card numbers are represented strictly in masked format (e.g. `•••• •••• •••• 4242`). Raw 16-digit card numbers never enter application state or log outputs.
2. **Customer PII**: Customer email addresses and phone numbers use synthetic formats (`@example.com`).
3. **Secrets in Source Control**: Automated scanners (`git-secrets` / pre-commit hooks) ensure no API keys or credentials are committed to Git.

---

## 7. Operational Logging Restrictions

Audit trails record what an operator did, but strictly omit sensitive payload contents:

```typescript
// What is logged:
{
  actorId: "usr_9921",
  actorRole: "operations_lead",
  action: "TRANSACTION_RETRY",
  entityId: "txn_01HZ89K2P001",
  timestamp: "2026-11-01T10:14:00Z",
  ipAddress: "192.168.1.1"
}

// What is NEVER logged:
// - Passwords, secret tokens, or session cookie hashes
// - Unmasked credit card details
// - Plaintext bank account or routing numbers
```

---

## 8. CSRF, CORS & Security Headers

1. **Content Security Policy (CSP)**: Configured via Next.js headers to prohibit unsafe inline scripts and enforce trusted script/style domains.
2. **X-Frame-Options**: Set to `DENY` to prevent clickjacking attacks in unauthorized iframes.
3. **X-Content-Type-Options**: Set to `nosniff` to prevent MIME-type confusion attacks.
4. **Referrer-Policy**: Set to `strict-origin-when-cross-origin`.
