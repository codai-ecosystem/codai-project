#!/usr/bin/env python3
"""
MemorAI Python Client Library Setup
Official Python client for the MemorAI platform
"""

from setuptools import setup, find_packages
import os

# Read README for long description
def read_readme():
    readme_path = os.path.join(os.path.dirname(__file__), 'README.md')
    if os.path.exists(readme_path):
        with open(readme_path, 'r', encoding='utf-8') as f:
            return f.read()
    return "Official Python client library for MemorAI platform"

# Read version from __init__.py
def read_version():
    version_file = os.path.join(os.path.dirname(__file__), 'memorai', '__init__.py')
    if os.path.exists(version_file):
        with open(version_file, 'r') as f:
            for line in f:
                if line.startswith('__version__'):
                    return line.split('=')[1].strip().strip('"\'')
    return '1.0.0'

setup(
    name='memorai-client',
    version=read_version(),
    description='Official Python client library for MemorAI platform',
    long_description=read_readme(),
    long_description_content_type='text/markdown',
    author='MemorAI Team',
    author_email='support@memorai.ro',
    url='https://github.com/codai-org/memorai-python-client',
    packages=find_packages(),
    python_requires='>=3.8',
    install_requires=[
        'requests>=2.28.0',
        'websocket-client>=1.4.0',
        'pydantic>=2.0.0',
        'typing-extensions>=4.0.0',
        'httpx>=0.24.0',  # For async support
        'backoff>=2.2.0',  # For retry logic
    ],
    extras_require={
        'dev': [
            'pytest>=7.0.0',
            'pytest-asyncio>=0.21.0',
            'pytest-mock>=3.10.0',
            'black>=23.0.0',
            'flake8>=6.0.0',
            'mypy>=1.0.0',
            'sphinx>=5.0.0',
            'sphinx-rtd-theme>=1.2.0',
        ],
        'async': [
            'aiohttp>=3.8.0',
            'aiofiles>=23.1.0',
        ]
    },
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Programming Language :: Python :: 3.12',
        'Topic :: Software Development :: Libraries :: Python Modules',
        'Topic :: Internet :: WWW/HTTP',
        'Topic :: Scientific/Engineering :: Artificial Intelligence',
    ],
    keywords='memorai, ai, memory, vector-database, embeddings, search',
    project_urls={
        'Documentation': 'https://docs.memorai.ro/python',
        'Source': 'https://github.com/codai-org/memorai-python-client',
        'Tracker': 'https://github.com/codai-org/memorai-python-client/issues',
        'Homepage': 'https://memorai.ro',
    },
    entry_points={
        'console_scripts': [
            'memorai=memorai.cli:main',
        ],
    },
    include_package_data=True,
    zip_safe=False,
)
