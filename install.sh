#!/bin/bash
# Loupe — photographer-site application installer.
#
# Assembles the RNA framework + the photography module set into a target
# install directory (the same dev→deploy pattern as rna-servicetag).
# Brand-agnostic: every photographer site uses this identical assembly;
# identity/branding comes from the instance config + CMS/branding system.
#
# Usage:  ./install.sh --target /opt/<instance> [--branch main] [--force]

set -e

DEFAULT_BRANCH="main"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GH="git@github.com:billndotnet"

RNA_REPO="$GH/rna.git"
# repo -> deployed module dir name (keep in sync with deploy.yml: modules)
declare -A MODULES=(
  [rna-gallery]=gallery
  [rna-catalog]=catalog
  [rna-cms]=cms
  [rna-crm]=crm
  [rna-modeldb]=modeldb
  [rna-amazonads]=amazonads
  [rna-waf]=waf
  [rna-oauth]=oauth
  [rna-tasks]=tasks
  [rna-kanban]=kanban
  [rna-support]=support
)

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}   $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERR]${NC}  $1"; }

usage() {
  cat <<EOF
Loupe photographer-site installer

USAGE:
  $0 --target DIR [--branch BRANCH] [--force]

  --target DIR     Target installation directory (required)
  --branch BRANCH  Git branch for all repos (default: $DEFAULT_BRANCH)
  --force          Overwrite an existing target directory
  -h, --help       This help
EOF
}

INSTALL_DIR=""; BRANCH="$DEFAULT_BRANCH"; FORCE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) INSTALL_DIR="$2"; shift 2;;
    -b|--branch) BRANCH="$2"; shift 2;;
    -f|--force) FORCE=1; shift;;
    -h|--help) usage; exit 0;;
    *) log_error "Unknown arg: $1"; usage; exit 1;;
  esac
done

[[ -z "$INSTALL_DIR" ]] && { log_error "--target is required"; usage; exit 1; }
if [[ -e "$INSTALL_DIR" && $FORCE -ne 1 ]]; then
  log_error "$INSTALL_DIR exists (use --force to overwrite)"; exit 1
fi

WORKSPACE="$(mktemp -d)"
trap 'rm -rf "$WORKSPACE"' EXIT
cd "$WORKSPACE"

log_info "Fetching RNA framework ($BRANCH)..."
git clone --depth 1 --branch "$BRANCH" "$RNA_REPO" rna \
  || { log_error "framework fetch failed (check ssh-agent / access)"; exit 1; }
[[ -d "$WORKSPACE/rna/rna" ]] || { log_error "unexpected framework layout"; exit 1; }

for repo in "${!MODULES[@]}"; do
  log_info "Fetching $repo..."
  git clone --depth 1 --branch "$BRANCH" "$GH/${repo}.git" "$repo" \
    || log_warning "could not fetch $repo (skipped)"
done
# this package itself (the app module)
cp -r "$SCRIPT_DIR" "$WORKSPACE/rna-loupe-pkg"

log_info "Assembling into $INSTALL_DIR ..."
mkdir -p "$INSTALL_DIR"
FW="$WORKSPACE/rna/rna"
for d in backend frontend scripts shared etc mapping; do
  cp -r "$FW/$d" "$INSTALL_DIR/" 2>/dev/null || log_warning "no framework $d/"
done
mkdir -p "$INSTALL_DIR/module"
# app module
cp -r "$WORKSPACE/rna-loupe-pkg" "$INSTALL_DIR/module/loupe"
rm -rf "$INSTALL_DIR/module/loupe/.git" "$INSTALL_DIR/module/loupe/install.sh"
# feature modules
for repo in "${!MODULES[@]}"; do
  name="${MODULES[$repo]}"
  if [[ -d "$WORKSPACE/$repo" ]]; then
    cp -r "$WORKSPACE/$repo" "$INSTALL_DIR/module/$name"
    rm -rf "$INSTALL_DIR/module/$name/.git"
    log_success "module/$name"
  fi
done

[[ -f "$INSTALL_DIR/etc/loupe/config.yml" ]] || {
  mkdir -p "$INSTALL_DIR/etc/loupe"
  cp "$SCRIPT_DIR/config.example.yml" "$INSTALL_DIR/etc/loupe/config.yml" 2>/dev/null \
    && log_warning "wrote template etc/loupe/config.yml — EDIT IT before first start"
}

log_success "Loupe assembled at $INSTALL_DIR"
log_info  "Next: edit etc/loupe/config.yml, create a venv + pip install, ensure_indices, then scripts/start.sh"
