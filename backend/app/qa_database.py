import os
from pathlib import Path
from dotenv import dotenv_values
import pyodbc
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# 1. Obtener la ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent

# Buscar .env.empleados en el directorio superior (/app/.env.empleados)
env_path = BASE_DIR.parent / ".env.empleados"
if not env_path.exists():
    env_path = BASE_DIR / ".env.empleados"

# Cargar valores si el archivo existe
file_env = dotenv_values(dotenv_path=env_path) if env_path.exists() else {}

# 2. Asignar credenciales (Prioridad: Variables de Entorno > Archivo .env.empleados > Valores por defecto)
SERVER = os.getenv("EMP_DB_SERVER")
DB = os.getenv("EMP_DB_NAME")
USER = os.getenv("EMP_DB_USER")
PASSWORD = os.getenv("EMP_DB_PASSWORD")
DRIVER = os.getenv("EMP_DB_DRIVER")
ENCRYPT = os.getenv("EMP_DB_ENCRYPT")
TRUST_CERT = os.getenv("EMP_DB_TRUST_CERT")

def get_conn():
    conn_str = (
        f"DRIVER={{{DRIVER}}};"
        f"SERVER={SERVER};"
        f"DATABASE={DB};"
        f"UID={USER};"
        f"PWD={PASSWORD};"
        f"Encrypt={ENCRYPT};"
        f"TrustServerCertificate={TRUST_CERT};"
    )
    
    try:
        print("🔌 Intentando conectar a la base de datos de QA/Empleados...")
        conn = pyodbc.connect(conn_str)
        
        cursor = conn.cursor()
        
        # Diagnóstico de contexto de seguridad y base de datos
        cursor.execute("SELECT SYSTEM_USER, USER_NAME(), DB_NAME();")
        sys_user, db_user, current_db = cursor.fetchone()
        print(f"✅ CONEXIÓN EXITOSA:")
        print(f"   - Login SQL: {sys_user}")
        print(f"   - Usuario DB: {db_user}")
        print(f"   - Base de datos actual: {current_db}")
        
        # Validación de existencia de la tabla en el esquema dbo
        cursor.execute("SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'empleado' AND TABLE_SCHEMA = 'dbo'")
        exists = cursor.fetchone()[0]
        print(f"🔍 DEBUG: ¿Existe la tabla 'dbo.empleado' en {current_db}? {'SÍ' if exists > 0 else 'NO'}")
        
        cursor.close()
        return conn
    except Exception as e:
        print(f"❌ ERROR CRÍTICO DE CONEXIÓN O CONSULTA: {e}")
        raise e

# Motor de SQLAlchemy vinculado al creator seguro
qa_engine = create_engine("mssql+pyodbc://", creator=get_conn)
QASessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=qa_engine)
QABase = declarative_base()

def get_qa_db():
    db = QASessionLocal()
    try:
        yield db
    finally:
        db.close()