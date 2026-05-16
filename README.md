# rna-loupe

**The brand-agnostic photographer-site application package.**

Loupe is the productized "photographer site" class of the RNA platform:
a deployable bundle of the photography modules (galleries, Lightroom
catalog sync, CMS landing/branding, CRM, Amazon affiliate gear, WAF,
OAuth, background tasks) plus built-in **ModelDB** integration.

A photographer site (e.g. billnash.com) is just an **instance** of
rna-loupe: identical code/assembly, with identity, domain, branding,
and ModelDB hub wiring supplied per-instance via config + the CMS /
framework branding system. The package ships **no brand**.

## Layout

- `__init__.py`, `api/`, `frontend/`, `mapping/`, `services/`,
  `workflows/` — the Loupe app module (portfolio, contact intake,
  photography workflow templates).
- `deploy.yml` — the canonical module manifest for the package.
- `install.sh` — assembles RNA framework + the module set into a
  target install dir (rna-servicetag pattern).
- `config.example.yml` — per-instance config template (copy & fill;
  never commit a real instance config — it carries secrets).
- `SPEC.md` — scope, status, and the billnash→loupe migration plan.

## Install

    ./install.sh --target /opt/<instance> --branch main
    # then: edit etc/<instance>/config.yml, venv + pip install,
    #       ensure_indices, scripts/start.sh

## Relationship to ModelDB

`rna-modeldb` is its own first-class application (the LinkedIn×IMDB
directory). Loupe sites embed it in **integration** mode and point at a
configured hub; the dedicated hub is a separate rna-modeldb deployment.
