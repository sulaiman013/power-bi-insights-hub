"""
Flask Application Factory
=========================
Creates and configures the Flask application for the Power BI MCP Server.
"""

import logging
from pathlib import Path
from flask import Flask, render_template
from flask_cors import CORS

from .routes import register_blueprints

logger = logging.getLogger("powerbi-v3-webui")


def create_app(template_folder: str = None, enable_cors: bool = True) -> Flask:
    """
    Create and configure the Flask application.

    Args:
        template_folder: Optional path to templates folder.
                        If not provided, uses default templates directory.
        enable_cors: Enable CORS for React frontend integration (default: True)

    Returns:
        Configured Flask application instance
    """
    # Determine template folder
    if template_folder is None:
        template_folder = str(Path(__file__).parent / "templates")

    app = Flask(
        __name__,
        template_folder=template_folder
    )

    # Enable CORS for frontend integration
    if enable_cors:
        CORS(app, resources={
            r"/api/*": {
                "origins": ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True
            }
        })
        logger.info("CORS enabled for React frontend")

    # Register all route blueprints
    register_blueprints(app)

    # Add root route for serving the main page
    @app.route('/')
    def index():
        return render_template('index.html')

    return app


def run_server(host: str = '127.0.0.1', port: int = 5050, debug: bool = False):
    """
    Run the Flask development server.

    Args:
        host: Host to bind to
        port: Port to listen on
        debug: Enable debug mode
    """
    print("=" * 60)
    print("  POWER BI EXPERT WEBAPP")
    print("  AI-Powered Power BI Assistant")
    print("=" * 60)
    print()
    print(f"  Starting server on http://{host}:{port}")
    print()
    print("  Requirements:")
    print("  1. Ollama running with powerbi-expert model")
    print("  2. Power BI Desktop with a .pbix file open")
    print()
    print("  Press Ctrl+C to stop")
    print("=" * 60)

    app = create_app()
    app.run(host=host, port=port, debug=debug, threaded=True)
