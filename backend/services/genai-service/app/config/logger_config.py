import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

def get_logger(name: str):
    """
    Return a logger for a given module.
    """
    return logging.getLogger(name)
