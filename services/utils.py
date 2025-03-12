from functools import wraps
from typing import TypeVar, Callable, Union
from datetime import datetime, timezone
from db import logger

U = TypeVar('U')
V = TypeVar('V')

def debug(fn: Callable[..., U]) ->  Callable[..., U]: # JUST to annotate debug functions
    @wraps(fn)
    def wrapper(*args, **kwargs) -> U:
        logger.debug(f"Calling function: {fn.__name__}")
        return fn(*args, **kwargs)
    return wrapper

def cached(fn: Callable[..., U]) ->  Callable[..., U]:
    # cached_value: Optional[U] = None
    # is_called: bool = False
    @wraps(fn)
    def wrapper(self, *args, **kwargs) -> U:
        # Use a unique attribute name for each method's cache
        cache_attr = f'_cached_value_{fn.__name__}'
        if not hasattr(self, cache_attr):
            setattr(self, cache_attr, fn(self, *args, **kwargs))
        return getattr(self, cache_attr)
        # nonlocal cached_value, is_called
        # if is_called or cached_value is not None: return cached_value
        # else: is_called = True
        # cached_value = fn(*args, **kwargs)
        # return cached_value
    return wrapper

def try_default(default_value: V) -> Callable[[Callable[..., U]], Callable[..., Union[U, V]]]:
    def decorator(fn: Callable[..., U]) -> Callable[..., Union[U, V]]:
        @wraps(fn)
        def wrapper(*args, **kwargs) -> Union[U, V]:
            try:
                return fn(*args, **kwargs)
            except Exception as e:
                logger.error(f"Error running function {fn.__name__}, err: {e}")
                return default_value  # Return the default value if an error occurs
        return wrapper
    return decorator

def get_current_date()->str:
    return datetime.now(timezone.utc).strftime('%Y-%m-%d')

def get_current_timestamp()->str:
    return datetime.now(timezone.utc).strftime('%Y-%m-%d %I:%M:%S %p')