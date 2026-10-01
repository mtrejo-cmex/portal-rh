from datetime import datetime
from zoneinfo import ZoneInfo

ZONA_MEXICO = ZoneInfo("America/Mexico_City")

def obtener_ahora_mexico():
    """Devuelve la fecha y hora actual exacta para el centro de México (naive)"""
    return datetime.now(ZONA_MEXICO).replace(tzinfo=None)