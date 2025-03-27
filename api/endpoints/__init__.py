from flask import Blueprint

# Создаем Blueprint для API
api = Blueprint('api', __name__)

# Импортируем все эндпоинты после создания Blueprint
from .endpoint_profile import profile_bp
from .endpoint_auth import auth_bp
from .endpoint_recipes import recipes_bp

# Импортируем дополнительные эндпоинты
try:
    from .endpoint_users import users_bp
    api.register_blueprint(users_bp)
except ImportError:
    pass

try:
    from .endpoint_recommended import recommended_bp
    api.register_blueprint(recommended_bp)
except ImportError:
    pass

try:
    from .endpoint_reference import reference_bp
    api.register_blueprint(reference_bp)
except ImportError:
    pass

# Регистрируем основные эндпоинты
api.register_blueprint(profile_bp)
api.register_blueprint(auth_bp)
api.register_blueprint(recipes_bp)

# Импортируем все наши модули с эндпоинтами
from . import (
    endpoint_users,
    endpoint_recipes,
    endpoint_auth,
    endpoint_profile,
    endpoint_recommended,
    endpoint_reference
) 