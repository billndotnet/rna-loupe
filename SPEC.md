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

## Migration plan (billnash → loupe instance)

Status: package scaffolded & committed. Live deployment still runs the
old `module/billnash` app module. Deliberate cutover (same staged
approach used for the ModelDB extraction — do not destabilize the
running site):

1. Stand up a `/opt/loupe-*` (or re-point billnash) assembled from
   rna-loupe via `install.sh`.
2. Move billnash-specific identity entirely into
   `etc/billnash/config.yml` + CMS/branding (already mostly there).
3. Swap `module/billnash` → `module/loupe`; retire `rna-billnash`.
4. Parity-smoke (portfolio, contact, workflows, galleries), then
   cut over the symlink.

## On deck

- billnash→loupe deployment cutover (above).
- ModelDB hub: a dedicated `rna-modeldb` deployment; Loupe instances
  set `modeldb.mode=integration` + `hub_url`.
- Per-instance provisioning flow (new photographer site from template).

## Invariants

- The package ships **no brand and no secrets**. Identity, domain,
  colors, logo, ModelDB hub creds = per-instance config / CMS only.
- Module assembly in `deploy.yml` and `install.sh` must stay in sync.
