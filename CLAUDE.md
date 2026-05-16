# CLAUDE.md — rna-loupe

The **brand-agnostic photographer-site application package** (the
"photographer site" application class). See `SPEC.md` for scope/status
and `README.md` for install.

## What this is

- An RNA *application package* (like rna-servicetag): an app module +
  `deploy.yml` manifest + `install.sh` that assembles the framework and
  the photography module set into a deployable site.
- billnash.com is an **instance** of this, not the product. The package
  ships **no brand and no secrets** — identity/domain/branding/ModelDB
  hub creds are per-instance (`etc/<instance>/config.yml` + CMS +
  framework branding).

## Rules

- Keep `deploy.yml` `modules:` and `install.sh` `MODULES` in sync.
- Never hardcode a brand (titles, domain, colors, emails) or any
  secret in this repo. New brandable surface → drive it from config /
  CMS, not code.
- The app module name is `loupe` (blueprint `loupe`, admin
  `/admin/loupe`). Don't reintroduce `billnash` identifiers here.
- ModelDB is a separate first-class app (`rna-modeldb`). Loupe embeds
  it in `integration` mode via config (`modeldb.mode`, `hub_url`);
  never import modeldb directly — talk to it over its API.
- Git: commits as the user, no AI attribution; SSH remotes; no `gh`.

## Migration note

The live deployment still runs the legacy `module/billnash` app
module. The billnash→loupe cutover is deliberate and staged (see
SPEC.md) — scaffold/parity first, swap the running site last.
