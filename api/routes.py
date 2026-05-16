"""Loupe Photography Platform API routes."""

from flask import Blueprint, jsonify, request
from backend.framework.utils import error_response, get_sanitized_json, prefixed_index
from backend.framework.es import get_es_client, get_user_from_session

loupe_api = Blueprint("loupe", __name__, url_prefix="/api/loupe")


# ---------------------------------------------------------------------------
# Portfolio (public-facing)
# ---------------------------------------------------------------------------

@loupe_api.route("/portfolio", methods=["GET"])
def get_portfolio():
    """Public portfolio — featured galleries and recent work."""
    es = get_es_client()
    try:
        resp = es.search(
            index=prefixed_index("portfolio_sections"),
            query={"term": {"published": True}},
            sort=[{"order": "asc"}],
            size=50,
        )
        sections = [hit["_source"] | {"id": hit["_id"]} for hit in resp["hits"]["hits"]]
        return jsonify({"sections": sections})
    except Exception:
        return jsonify({"sections": []})


@loupe_api.route("/portfolio/<section_id>", methods=["GET"])
def get_portfolio_section(section_id: str):
    """Get a portfolio section with its gallery images."""
    es = get_es_client()
    try:
        doc = es.get(index=prefixed_index("portfolio_sections"), id=section_id)
        section = doc["_source"] | {"id": doc["_id"]}
        return jsonify(section)
    except Exception:
        return error_response("Section not found", 404)


# ---------------------------------------------------------------------------
# Portfolio admin (authenticated)
# ---------------------------------------------------------------------------

@loupe_api.route("/portfolio", methods=["POST"])
def create_portfolio_section():
    """Create a new portfolio section."""
    token = request.cookies.get("session")
    user = get_user_from_session(token)
    if not user:
        return error_response("unauthorized", 401)

    data = get_sanitized_json()
    if not data.get("title"):
        return error_response("title required", 400)

    es = get_es_client()
    from datetime import datetime, timezone
    doc = {
        "title": data["title"],
        "description": data.get("description", ""),
        "gallery_id": data.get("gallery_id", ""),
        "cover_image": data.get("cover_image", ""),
        "order": data.get("order", 0),
        "published": data.get("published", False),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = es.index(index=prefixed_index("portfolio_sections"), document=doc)
    return jsonify({"id": result["_id"], **doc}), 201


@loupe_api.route("/portfolio/<section_id>", methods=["PUT"])
def update_portfolio_section(section_id: str):
    """Update a portfolio section."""
    token = request.cookies.get("session")
    user = get_user_from_session(token)
    if not user:
        return error_response("unauthorized", 401)

    data = get_sanitized_json()
    allowed = {"title", "description", "gallery_id", "cover_image", "order", "published"}
    updates = {k: v for k, v in data.items() if k in allowed}

    es = get_es_client()
    try:
        es.update(index=prefixed_index("portfolio_sections"), id=section_id, doc=updates)
        return jsonify({"status": "ok"})
    except Exception:
        return error_response("Section not found", 404)


@loupe_api.route("/portfolio/<section_id>", methods=["DELETE"])
def delete_portfolio_section(section_id: str):
    """Delete a portfolio section."""
    token = request.cookies.get("session")
    user = get_user_from_session(token)
    if not user:
        return error_response("unauthorized", 401)

    es = get_es_client()
    try:
        es.delete(index=prefixed_index("portfolio_sections"), id=section_id)
        return jsonify({"status": "ok"})
    except Exception:
        return error_response("Section not found", 404)


# ---------------------------------------------------------------------------
# Contact / Booking
# ---------------------------------------------------------------------------

@loupe_api.route("/contact", methods=["POST"])
def submit_contact():
    """Public contact form submission."""
    data = get_sanitized_json()
    if not data.get("name") or not data.get("email") or not data.get("message"):
        return error_response("name, email, and message required", 400)

    es = get_es_client()
    from datetime import datetime, timezone
    doc = {
        "name": data["name"],
        "email": data["email"],
        "phone": data.get("phone", ""),
        "event_type": data.get("event_type", ""),
        "event_date": data.get("event_date", ""),
        "message": data["message"],
        "status": "new",
        "ip": request.remote_addr,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = es.index(index=prefixed_index("contact_submissions"), document=doc)
    return jsonify({"status": "ok", "id": result["_id"]}), 201


@loupe_api.route("/contact", methods=["GET"])
def list_contacts():
    """Admin: list contact submissions."""
    token = request.cookies.get("session")
    user = get_user_from_session(token)
    if not user:
        return error_response("unauthorized", 401)

    es = get_es_client()
    try:
        resp = es.search(
            index=prefixed_index("contact_submissions"),
            query={"match_all": {}},
            sort=[{"created_at": "desc"}],
            size=100,
        )
        submissions = [hit["_source"] | {"id": hit["_id"]} for hit in resp["hits"]["hits"]]
        return jsonify({"submissions": submissions, "total": resp["hits"]["total"]["value"]})
    except Exception:
        return jsonify({"submissions": [], "total": 0})
