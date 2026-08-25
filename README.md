# Climate Action OS 🐺

> **ชุมชนพร้อมรับมือก่อนวิกฤต** — โครงสร้างพื้นฐานดิจิทัลที่เปลี่ยนความเสี่ยงสภาพภูมิอากาศให้เป็นโครงการพร้อมรับทุน และติดตามผลลัพธ์ที่ตรวจสอบได้

[![CI](https://github.com/bravforcode/climate-web/actions/workflows/ci.yml/badge.svg)](https://github.com/bravforcode/climate-web/actions/workflows/ci.yml)

## ทำไมต้องมีระบบนี้

ชุมชนและ อปท. ไทยเผชิญความเสี่ยงภูมิอากาศ (น้ำท่วม ความร้อน PM2.5) แต่ขาดเครื่องมือเชื่อม 3 สิ่งเข้าด้วยกัน: **ข้อมูลความเสี่ยง → โครงการที่ชุมชนต้องการจริง → แหล่งทุน** แพลตฟอร์มที่มีอยู่แพร่กระจายเป็นเสี่ยง ๆ (hazard maps / grant databases / MRV tools) ไม่มีใครปิดวงจรครบในที่เดียว — เราปิดมัน

## Core Loop (6 Modules)

| Module | ฟีเจอร์ | จุดต่าง |
|---|---|---|
| A | Risk Intelligence | hazard layers + source provenance + valid_until |
| B | Vulnerability Zones | **k-anonymity (k≥10)** — privacy-preserving mapping ที่_COMMERCIAL platform ยังไม่มีใครทำ |
| C | Community Priorities | transparent scoring `(urgency×beneficiaries×feasibility×equity)/cost` |
| D/E | Intervention Library + AI-assisted Composer | human-in-the-loop confirmation ทุก field |
| F | Funding Match | rule-based matching + **human-confirmed only** ก่อน community เห็น |
| H/I | Evidence MRV + Append-only Ledger | photo/GPS evidence + hash chain + REVOKE UPDATE/DELETE |

+ LINE Login, PromptPay/Stripe billing rails (Thai-market native)

## Security Model (production-grade schema included)

- **17 tables PostgreSQL + PostGIS**, RLS ทุกตาราง (`supabase/migrations/`)
- k-anonymity enforcement ทั้ง DB trigger และ client view
- Ledger append-only: `REVOKE UPDATE, DELETE` — correction ผ่าน reversal entry เท่านั้น
- PDPA consent records (grant/withdraw) + audit log ทุก mutation
- CSP hardened, HSTS, org-scoped RLS (cross-org leak patched & regression-tested)

## สถานะความจริงของตัวโปรเจกต์ (no hype policy)

| Layer | Status |
|---|---|
| Frontend (React 19 + TS strict + Tailwind + GSAP) | ✅ production build ผ่าน |
| Tests | ✅ **93 tests / 0 fail** (CI-verified) |
| Schema + RLS migrations | ✅ ready to apply (one-click workflow) |
| Supabase wiring | 🔧 Phase A done (client foundation); Phase B รอ provisioning keys |
| Auth/Payments | 🔧 mock flows (LINE OIDC + Stripe/PromptPay structure พร้อม รอ credentials) |
| Data | 🔧 seed/mock dataset — metrics แสดงค่าจริงเสมอ (fabricated numbers purged) |

## Dev Quickstart

```bash
bun install
bun run dev        # local dev
bun test           # 93 tests
bun run typecheck  # tsc --noEmit
bun run build      # production bundle -> dist/
```

Deploy: push to `main` → CI builds → Pages auto-deploys; migration ผ่าน Actions "Supabase Migrate" (workflow_dispatch)

## License & Contact

TBD — see CODE_OF_CONDUCT.md / CONTRIBUTING.md
