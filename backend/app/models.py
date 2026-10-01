from datetime import datetime
from zoneinfo import ZoneInfo
from .utils import obtener_ahora_mexico
from sqlalchemy import Column, Integer, String, Date, DateTime, Text, Boolean, ForeignKey, func, Time, Unicode, UnicodeText
from sqlalchemy.orm import relationship
from .database import Base

# ==============================================================================
# --- MODELOS COMUNICADOS Y REACCIONES ---
# ==============================================================================

class Comunicado(Base):
    __tablename__ = "comunicados"
    __table_args__ = {"schema": "dbo"}

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(Unicode(255), nullable=False)
    categoria = Column(String(50), nullable=False)
    autor = Column(String(100), nullable=True)
    resumen = Column(Unicode(500), nullable=True)
    contenido = Column(UnicodeText, nullable=True)
    imagen_url = Column(String(500), nullable=True)
    documento_url = Column(String(500), nullable=True) 
    enlace_url = Column(String(500), nullable=True)
    fecha_publicacion = Column(DateTime, nullable=False, default=obtener_ahora_mexico)
    estado = Column(String(20), nullable=True, default="activo")
    likes = Column(Integer, nullable=True, default=0)
    confirmaciones = Column(Integer, nullable=True, default=0)
    creado_el = Column(DateTime, default=obtener_ahora_mexico)

    reacciones = relationship(
        "ComunicadoReaccion", 
        back_populates="comunicado", 
        cascade="all, delete-orphan"
    )


class ComunicadoReaccion(Base):
    __tablename__ = "comunicado_reacciones"
    __table_args__ = {"schema": "dbo"}

    id = Column(Integer, primary_key=True, index=True)
    comunicado_id = Column(Integer, ForeignKey("dbo.comunicados.id", ondelete="CASCADE"), nullable=False)
    usuario_email = Column(String(150), nullable=False)
    usuario_nombre = Column(String(150), nullable=True)
    tipo_reaccion = Column(String(20), nullable=False)  # 'like' o 'confirmar'
    creado_el = Column(DateTime, default=obtener_ahora_mexico)

    comunicado = relationship("Comunicado", back_populates="reacciones")


# ==============================================================================
# --- MODELOS CATEGORÍAS, CONVENIOS Y CONTACTOS ---
# ==============================================================================

class CategoriaConvenio(Base):
    __tablename__ = "categorias_convenios"
    __table_args__ = {"schema": "dbo"}

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, unique=True)
    estado = Column(String(20), nullable=True, default="activo")
    creado_el = Column(DateTime, default=obtener_ahora_mexico)

    convenios = relationship("Convenio", back_populates="categoria_rel")


class ConvenioContacto(Base):
    __tablename__ = "convenio_contacto"
    __table_args__ = {"schema": "dbo"}

    id = Column(Integer, primary_key=True, index=True)
    convenio_id = Column(Integer, ForeignKey("dbo.convenios.id", ondelete="CASCADE"), nullable=False)
    nombre = Column(String(150), nullable=False)
    email = Column(String(100), nullable=True)
    telefono = Column(String(50), nullable=True)
    puesto = Column(String(100), nullable=True)
    creado_el = Column(DateTime, default=obtener_ahora_mexico)

    convenio = relationship("Convenio", back_populates="contactos")


class Convenio(Base):
    __tablename__ = "convenios"
    __table_args__ = {"schema": "dbo"}

    id = Column(Integer, primary_key=True, index=True)
    empresa = Column(String(150), nullable=False)
    titulo = Column(String(200), nullable=True)
    categoria_id = Column(Integer, ForeignKey("dbo.categorias_convenios.id"), nullable=True)
    descuento = Column(String(500), nullable=True)
    descripcion = Column(Text, nullable=False)
    condiciones = Column(Text, nullable=True)
    vigencia = Column(Date, nullable=True)
    codigo_promocional = Column(String(50), nullable=True)
    contacto_email = Column(String(100), nullable=True)
    logo_url = Column(String(500), nullable=True)
    sitio_web = Column(String(500), nullable=True)
    archivos_adjuntos = Column(Text, nullable=True)
    destacado = Column(Boolean, nullable=True, default=False)
    estado = Column(String(20), nullable=True, default="activo")
    creado_el = Column(DateTime, default=obtener_ahora_mexico)
    actualizado_el = Column(
        DateTime, 
        nullable=True, 
        default=obtener_ahora_mexico, 
        onupdate=obtener_ahora_mexico
    )

    # Carga automática de la categoría asociada
    categoria_rel = relationship("CategoriaConvenio", back_populates="convenios", lazy="joined")
    
    # Carga automática de la lista de contactos
    contactos = relationship(
        "ConvenioContacto", 
        back_populates="convenio", 
        cascade="all, delete-orphan",
        lazy="joined"
    )


# ==============================================================================
# --- MODELOS GALERÍA DE EVENTOS ---
# ==============================================================================

class GaleriaEvento(Base):
    __tablename__ = "galeria_eventos"
    __table_args__ = {"schema": "dbo"}

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    categoria = Column(String, nullable=False)
    categoria_etiqueta = Column(String, nullable=False)
    fecha = Column(String, nullable=False)
    descripcion = Column(String, nullable=False)
    enlace_url = Column(String, nullable=True)
    creado_el = Column(DateTime, default=obtener_ahora_mexico)

    fotos = relationship("GaleriaFoto", back_populates="evento", cascade="all, delete-orphan")


class GaleriaFoto(Base):
    __tablename__ = "galeria_fotos"
    __table_args__ = {"schema": "dbo"}

    id = Column(Integer, primary_key=True, index=True)
    evento_id = Column(Integer, ForeignKey("dbo.galeria_eventos.id", ondelete="CASCADE"), nullable=False)
    url = Column(String, nullable=False)
    es_portada = Column(Boolean, default=False)

    evento = relationship("GaleriaEvento", back_populates="fotos")


# ==============================================================================
# --- MODELO CALENDARIO CORPORATIVO ---
# ==============================================================================

class CalendarioEvento(Base):
    __tablename__ = "calendario_eventos"
    __table_args__ = {"schema": "dbo"}

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(Unicode(200), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=True)
    hora_inicio = Column(Time, nullable=True)
    hora_fin = Column(Time, nullable=True)
    tipo = Column(Unicode(50), nullable=False, default="canon")
    descripcion = Column(UnicodeText, nullable=True)
    enlace_url = Column(UnicodeText, nullable=True)
    creado_el = Column(DateTime, default=obtener_ahora_mexico)

# ==============================================================================
# --- MODELO FORMATOS Y DOCUMENTOS CORPORATIVOS ---
# ==============================================================================

class Formato(Base):
    __tablename__ = "formatos"
    __table_args__ = {"schema": "dbo"}

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(Unicode(255), nullable=False)
    categoria = Column(Unicode(100), nullable=False, default="General")
    descripcion = Column(UnicodeText, nullable=True)
    extension = Column(String(10), nullable=False)  # 'PDF', 'DOCX', 'XLSX', etc.
    archivo_url = Column(String(500), nullable=False)
    peso_bytes = Column(Integer, nullable=True)
    estado = Column(String(20), nullable=True, default="activo")
    creado_el = Column(DateTime, default=obtener_ahora_mexico)
    actualizado_el = Column(
        DateTime, 
        nullable=True, 
        default=obtener_ahora_mexico, 
        onupdate=obtener_ahora_mexico
    )

class CajaAhorroModel(Base):
    __tablename__ = "caja_ahorro"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True)
    categoria = Column(String(100), nullable=True)
    extension = Column(String(10), nullable=False)  # Ej: 'PDF', 'DOCX'
    archivo_url = Column(Text, nullable=False)      # Enlace de Google Drive
    peso_bytes = Column(Integer, default=0)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)