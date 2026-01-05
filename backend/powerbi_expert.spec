# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller Spec File for Power BI Expert Backend
==================================================
This bundles the Python Flask backend into a single executable.
"""

import sys
from pathlib import Path

block_cipher = None

# Get the absolute path to the backend directory
backend_dir = Path(SPECPATH).resolve()
src_dir = backend_dir / 'src'

# Collect all data files
datas = [
    (str(src_dir / 'web' / 'templates'), 'src/web/templates'),
]

# Hidden imports that PyInstaller might miss
hidden_imports = [
    'flask',
    'flask_cors',
    'httpx',
    'msal',
    'psutil',
    'yaml',
    'pyadomd',
    'clr',
    'pythonnet',
    'dotenv',
    'src',
    'src.web',
    'src.web.app',
    'src.web.routes',
    'src.web.routes.chat',
    'src.web.routes.desktop',
    'src.web.routes.cloud',
    'src.web.routes.llm',
    'src.web.routes.pbip',
    'src.web.routes.status',
    'src.web.services',
    'src.web.services.state',
    'src.web.services.dax_utils',
    'src.web.services.pbip_service',
    'src.connectors',
    'src.connectors.desktop',
    'src.connectors.xmla',
    'src.connectors.tom',
    'src.connectors.pbip',
    'src.connectors.rest',
    'src.llm',
    'src.llm.router',
    'src.llm.base_provider',
    'src.llm.ollama_provider',
    'src.llm.azure_provider',
    'src.llm.azure_claude_provider',
    'src.llm.data_boundary',
    'src.security',
    'src.security.audit_logger',
    'src.security.network_validator',
]

a = Analysis(
    ['web_ui.py'],
    pathex=[str(backend_dir)],
    binaries=[],
    datas=datas,
    hiddenimports=hidden_imports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='PowerBI_Expert_Server',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,  # Keep console for debugging; set to False for release
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,  # Add icon path here if you have one
)
