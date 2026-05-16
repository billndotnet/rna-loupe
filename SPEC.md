# Loupe — Spec Sheet

> The brand-agnostic photographer-site application package. Companion to
> rna-modeldb/SPEC.md (the directory side).

## Positioning

Two application classes on the RNA platform:

- **Loupe (this package)** — a hosted *photographer site*: a
  photographer manages galleries, Lightroom catalog sync, CMS
  landing/branding, CRM, affiliate gear, client proofing/booking
  workflows. Brand-agnostic; each site is an instance.
- **ModelDB** (`rna-modeldb`) — the canonical LinkedIn×IMDB directory
  hub. Loupe sites integrate with it.

billnash.com is the first Loupe instance (the maintainer's personal
site); it is not the product.

## What's in the package (shipped)

- De-branded Loupe app module (portfolio sections, contact intake,
  photography workflow templates: client proofing, gallery showing,
  Lightroom catalog sync, shoot planning).
- `deploy.yml` manifest + `install.sh` assembler (RNA framework +
  gallery, catalog, cms, crm, modeldb, amazonads, waf, oauth, tasks,
  kanban, support).
- `config.example.yml` — per-instance identity/branding/ModelDB-hub
  template. No brand or secret in the package.

## Migration status (billnash → loupe instance)

**DONE on the billnash staging instance (2026-05-16).** `module/billnash`
retired; the instance runs `module/loupe`. Verified: public site
(`/`, `/contact`, `/landing/*`, galleries) all 200 loupe-served;
`/api/loupe/*` authoritative; `/api/billnash/*` gone (404); shared
`portfolio_sections`/`contact_submissions` indices reused (no data
migration, no orphans); adjacent modules intact. billnash identity is
now purely `etc/billnash/config.yml` + CMS/branding.

Remaining: (a) apply the same swap to any future/other photographer
instances via `install.sh` (no `module/<brand>` app module — always
`module/loupe`); (b) the legacy `rna-billnash` repo is superseded —
archive/retire it; (c) production rollout when ready (this was the
staging instance).

## On deck

- billnash→loupe deployment cutover (above).
- ModelDB hub: a dedicated `rna-modeldb` deployment; Loupe instances
  set `modeldb.mode=integration` + `hub_url`.
- Per-instance provisioning flow (new photographer site from template).

## Invariants

- The package ships **no brand and no secrets**. Identity, domain,
  colors, logo, ModelDB hub creds = per-instance config / CMS only.
- Module assembly in `deploy.yml` and `install.sh` must stay in sync.
