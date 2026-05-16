"""Loupe Photography Platform — 

Photography portfolio and client gallery site built on the RNA framework.
Leverages rna-gallery for image management and client proofing, with
a public-facing photography portfolio, blog integration via rna-cms,
and client booking/contact workflows.
"""

import logging
from pathlib import Path

import yaml

from backend.framework.modules import register_blueprint, register_module_metadata

logger = logging.getLogger(__name__)

MODULE_DIR = Path(__file__).resolve().parent


def _load_workflow_templates() -> list[dict]:
    """Load YAML workflow templates from the workflows/ directory."""
    workflows_dir = MODULE_DIR / "workflows"
    if not workflows_dir.is_dir():
        return []
    templates = []
    for path in sorted(workflows_dir.glob("*.yaml")):
        try:
            with open(path) as f:
                templates.append(yaml.safe_load(f))
        except Exception as exc:
            logger.warning("Failed to load workflow template %s: %s", path.name, exc)
    return templates


def init_app(app, task_registry=None) -> None:
    """Initialize the Loupe module."""
    from .api.routes import loupe_api

    register_blueprint(loupe_api)

    register_module_metadata(
        name="loupe",
        display_name="Loupe Photography Platform",
        description="Photography portfolio, client galleries, and booking for ",
        category="application",
        admin_tools=[
            {"label": "Photography", "path": "/admin/loupe", "icon": "CameraAlt"},
        ],
    )

    # Register photography-specific workflow templates into kanban
    try:
        from module.kanban.service import register_workflow_templates
        templates = _load_workflow_templates()
        if templates:
            count = register_workflow_templates("loupe", templates)
            logger.info("Registered %d photography workflow templates", count)
    except ImportError:
        logger.debug("Kanban module not available, skipping workflow registration")
    except Exception as exc:
        logger.warning("Failed to register workflow templates: %s", exc)

    logger.info("Loupe Photography Platform module initialized")
