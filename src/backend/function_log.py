import logging
import time

def log(func):
    if __debug__:
        async def wrapper(*args, **kwargs):
            logging.info("Function %s called with args: %s and kwargs: %s",
                func.__name__, args, kwargs)
            start = time.perf_counter()
            result = await func(*args, **kwargs)
            end = time.perf_counter()
            logging.info("Function %s returned in %.1f with output: %s", func.__name__, end - start, result)
            return result
        return wrapper
    return func
