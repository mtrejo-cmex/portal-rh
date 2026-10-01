from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime, date, time
from typing import Optional, List

# ==============================================================================
# --- SCHEMAS COMUNICADOS Y REACCIONES ---
# ==============================================================================

class ComunicadoReaccionBase(BaseModel):
    tipo_reaccion: str

class ComunicadoReaccionCreate(BaseModel):
    usuario_email: str
    usuario_nombre: Optional[str] = None
    tipo_reaccion: Optional[str] = "like" # Opcional si el endpoint define el tipo

class ComunicadoReaccionResponse(ComunicadoReaccionBase):
    id: int
    comunicado_id: int
    usuario_email: Optional[str] = None
    usuario_nombre: Optional[str] = None
    creado_el: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ComunicadoBase(BaseModel):
    titulo: str
    categoria: str
    resumen: Optional[str]
    contenido: Optional[str]
    autor: Optional[str] = "Recursos Humanos"
    imagen_url: Optional[str] = None
    documento_url: Optional[str] = None  # <-- Campo que faltaba agregar
    enlace_url: Optional[str] = None
    fecha_publicacion: Optional[datetime] = None

class ComunicadoCreate(ComunicadoBase):
    pass

class EstadoUpdate(BaseModel):
    estado: str  # <-- Schema necesario para la actualización rápida de estatus

class ComunicadoResponse(ComunicadoBase):
    id: int
    estado: Optional[str] = "activo"
    likes: Optional[int] = 0
    confirmaciones: Optional[int] = 0
    creado_el: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Esquema detallado (solo si consultas 1 comunicado específico)
class ComunicadoDetalleResponse(ComunicadoResponse):
    reacciones: Optional[List[ComunicadoReaccionResponse]] = Field(default_factory=list)


# ==============================================================================
# --- SCHEMAS CATEGORÍAS DE CONVENIOS ---
# ==============================================================================

class CategoriaConvenioBase(BaseModel):
    nombre: str
    estado: Optional[str] = "activo"

class CategoriaConvenioCreate(CategoriaConvenioBase):
    pass

class CategoriaConvenioResponse(CategoriaConvenioBase):
    id: int
    creado_el: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# --- SCHEMAS CONTACTOS DE CONVENIOS ---
# ==============================================================================

class ConvenioContactoBase(BaseModel):
    nombre: str
    email: Optional[str] = None
    telefono: Optional[str] = None
    puesto: Optional[str] = None

class ConvenioContactoCreate(ConvenioContactoBase):
    pass

class ConvenioContactoResponse(ConvenioContactoBase):
    id: int
    convenio_id: int

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# --- SCHEMAS CONVENIOS ---
# ==============================================================================

class ConvenioBase(BaseModel):
    empresa: str
    titulo: Optional[str] = None
    descripcion: str
    descuento: Optional[str] = None
    categoria_id: Optional[int] = None
    categoria: Optional[str] = None
    condiciones: Optional[str] = None
    vigencia: Optional[date] = None
    codigo_promocional: Optional[str] = None
    logo_url: Optional[str] = None
    sitio_web: Optional[str] = None
    destacado: Optional[bool] = False
    estado: Optional[str] = "activo"
    archivos_adjuntos: Optional[str] = None

class ConvenioCreate(ConvenioBase):
    # Permite recibir múltiples contactos al crear el convenio
    contactos: Optional[List[ConvenioContactoCreate]] = Field(default_factory=list)

class ConvenioResponse(ConvenioBase):
    id: int
    creado_el: Optional[datetime] = None
    actualizado_el: Optional[datetime] = None
    categoria_rel: Optional[CategoriaConvenioResponse] = None
    contactos: Optional[List[ConvenioContactoResponse]] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# --- SCHEMAS GALERÍA DE EVENTOS ---
# ==============================================================================

class GaleriaFotoBase(BaseModel):
    url: str
    es_portada: bool = False

class GaleriaFotoCreate(GaleriaFotoBase):
    pass

class GaleriaFotoResponse(GaleriaFotoBase):
    id: int
    evento_id: int

    model_config = ConfigDict(from_attributes=True)


class GaleriaEventoBase(BaseModel):
    titulo: str
    categoria: str
    categoria_etiqueta: str
    fecha: str
    descripcion: str
    enlace_url: Optional[str] = None

class GaleriaEventoCreate(GaleriaEventoBase):
    fotos: List[GaleriaFotoCreate] = Field(default_factory=list)

class GaleriaEventoResponse(GaleriaEventoBase):
    id: int
    enlace_url: Optional[str] = None
    fotos_count: int = 1
    fotos: List[GaleriaFotoResponse] = Field(default_factory=list)
    creado_el: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# --- SCHEMAS CALENDARIO CORPORATIVO ---
# ==============================================================================

class CalendarioBase(BaseModel):
    titulo: str
    fecha_inicio: date
    fecha_fin: Optional[date] = None
    hora_inicio: Optional[time] = None  # 🟢 Permite recibir "10:00" o None
    hora_fin: Optional[time] = None     # 🟢 Permite recibir "11:30" o None
    tipo: str = "canon"  # 'oficial' o 'canon'
    descripcion: Optional[str] = None
    enlace_url: Optional[str] = None

class CalendarioCreate(CalendarioBase):
    pass

class CalendarioResponse(CalendarioBase):
    id: int
    creado_el: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class LoginAdminRequest(BaseModel):
    user_id: str
    password: str


# 1. Esquema para la creación (vía JSON con URL de Google Drive)
class FormatoCreate(BaseModel):
    titulo: str
    categoria: str = "General"
    descripcion: Optional[str] = None
    extension: str = "PDF"        # PDF, DOCX, XLSX, etc.
    archivo_url: str              # Enlace público de Google Drive
    peso_bytes: Optional[int] = None
    estado: Optional[str] = "activo"

# 2. Esquema para la actualización parcial (vía PUT / PATCH)
class FormatoUpdate(BaseModel):
    titulo: Optional[str] = None
    categoria: Optional[str] = None
    descripcion: Optional[str] = None
    extension: Optional[str] = None
    archivo_url: Optional[str] = None
    peso_bytes: Optional[int] = None
    estado: Optional[str] = None

# 3. Esquema para lectura / respuesta de la API (ORm Mode / attributes)
class FormatoOut(BaseModel):
    id: int
    titulo: str
    categoria: str
    descripcion: Optional[str] = None
    extension: str
    archivo_url: str
    peso_bytes: Optional[int] = None
    estado: Optional[str] = "activo"
    creado_el: datetime
    actualizado_el: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class CajaAhorroBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    categoria: Optional[str] = "General"
    extension: str = "PDF"
    archivo_url: str
    peso_bytes: Optional[int] = 0

class CajaAhorroCreate(CajaAhorroBase):
    pass

class CajaAhorroResponse(CajaAhorroBase):
    id: int
    fecha_actualizacion: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)