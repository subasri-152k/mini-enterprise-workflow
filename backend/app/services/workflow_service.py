from fastapi import HTTPException, status


ALLOWED_TRANSITIONS = {
    "todo": {"in_progress"},
    "in_progress": {"review"},
    "review": {"done"},
    "done": set(),
}


def validate_status_transition(
    current_status: str,
    new_status: str,
):
    current_status = current_status.lower()
    new_status = new_status.lower()

    if current_status == new_status:
        return

    allowed_statuses = ALLOWED_TRANSITIONS.get(
        current_status,
        set(),
    )

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid status transition: "
                f"{current_status} → {new_status}. "
                f"Allowed flow: TODO → IN PROGRESS → REVIEW → DONE"
            ),
        )