from flask import Blueprint

api = Blueprint("api", __name__)

# Импортируем все наши модули с эндпоинтами
from . import (
    endpoint_users,
    endpoint_recipes,
    endpoint_auth,
    endpoint_profile,
    endpoint_recommended,
    endpoint_reference
) 