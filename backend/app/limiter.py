"""Rate limiting configuration.

This module provides the global SlowAPI limiter instance.
"""

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

# Initialize the limiter with a default strategy
limiter = Limiter(key_func=get_remote_address)
