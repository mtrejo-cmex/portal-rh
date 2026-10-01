import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. Obtener variables del archivo .env
SERVER = os.getenv("DB_SERVER", "192.168.3.44")
DATABASE = os.getenv("DB_NAME", "cmex_portalrh")
USER = os.getenv("DB_USER", "cmex_portalrh")
PASSWORD = os.getenv("DB_PASSWORD", "cmex_portalrh")
DRIVER = os.getenv("DB_DRIVER", "ODBC Driver 18 for SQL Server")

# Asegurar puerto 1433 si no está presente
if "," not in SERVER and ":" not in SERVER:
    SERVER = f"{SERVER},1433"

# 🟢 OBLIGATORIO EN LINUX/DOCKER: Anteponer tcp: para evitar el timeout de 14s por Named Pipes
if not SERVER.startswith("tcp:"):
    SERVER = f"tcp:{SERVER}"

# 2. Construir la cadena ODBC directa
odbc_str = (
    f"DRIVER={{{DRIVER}}};"
    f"SERVER={SERVER};"
    f"DATABASE={DATABASE};"
    f"UID={USER};"
    f"PWD={PASSWORD};"
    f"Encrypt=no;"
    f"TrustServerCertificate=yes;"
    f"Authentication=SqlPassword;"
    f"Connection Timeout=5;"
)

DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={urllib.parse.quote_plus(odbc_str)}"

# 3. Crear Motor de SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=1800
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()