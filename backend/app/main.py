import os
import uuid
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Header, Query, File, UploadFile, status, Request, Body, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func, text
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel
from dotenv import load_dotenv
from .models import Formato

# Importaciones de servicios y bases de datos
from .ldap_service import autenticar_admin_ldap
from .qa_database import get_qa_db
from .models_qa import EmpleadoQA
from . import crud, models, schemas
from .database import engine, get_db
from .utils import obtener_ahora_mexico
from .schemas import FormatoCreate, FormatoUpdate, FormatoOut
from .dependencies import requerir_admin

load_dotenv()

SUPER_ADMIN_USER = os.getenv("SUPER_ADMIN_USER")
SUPER_ADMIN_PASS = os.getenv("SUPER_ADMIN_PASS")

# --- CONFIGURACIÓN DE RUTA ABSOLUTA PARA 'uploads' DENTRO DE app/ ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Definir límites de tamaño en bytes
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB máximo general

def eliminar_archivo_fisico(url_o_ruta: str):
    """Elimina un archivo del disco si existe, basándose en su URL o nombre"""
    if not url_o_ruta:
        return
    try:
        nombre_archivo = url_o_ruta.split("/")[-1]
        ruta_completa = os.path.join(UPLOAD_DIR, nombre_archivo)
        if os.path.exists(ruta_completa):
            os.remove(ruta_completa)
    except Exception as e:
        print(f"No se pudo eliminar el archivo antiguo: {e}")

def sincronizar_comunicados_programados(db: Session):
    """
    Busca comunicados en estado 'Programado' cuya fecha_publicacion
    sea menor o igual a la fecha/hora actual y los cambia a 'Activo'.
    """
    try:
        ahora_mexico = crud.obtener_ahora_mexico()
        
        comunicados_pendientes = db.query(models.Comunicado).filter(
            models.Comunicado.estado == "Programado",
            models.Comunicado.fecha_publicacion <= ahora_mexico
        ).all()

        if comunicados_pendientes:
            for comunicado in comunicados_pendientes:
                comunicado.estado = "Activo"
            db.commit()
    except Exception as e:
        print(f"Error al sincronizar comunicados programados: {e}")
        db.rollback()


app = FastAPI(
    title="API REST - CMEX Portal RH",
    version="1.4.0",
    description="Backend oficial para la gestión de Comunicados, Convenios y Galería de Eventos (Modo Local / Intranet)"
)

# ==============================================================================
# --- CONFIGURACIÓN DE CORS ---
# ==============================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:80",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.3.59",
        "http://192.168.3.59:8001",
    ],
    allow_origin_regex=r"http://192\.168\.\d+\.\d+(:\d+)?", # Permite cualquier IP de red local
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar la carpeta para servir los archivos estáticos públicamente en la ruta '/uploads'
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/")
def home():
    return {"status": "ok", "message": "API REST CMEX Portal RH activa en Modo Local"}

# ==============================================================================
# --- AUTENTICACIÓN ---
# ==============================================================================

class LoginColaboradorRequest(BaseModel):
    user_id: str

class LoginAdminRequest(BaseModel):
    user_id: str
    password: str

@app.post("/api/auth/colaborador")
def login_colaborador(
    data: LoginColaboradorRequest, 
    response: Response,  # 👈 Inyectamos el objeto Response
    qa_db: Session = Depends(get_qa_db)
):
    """Acceso para empleados obteniendo el correo real de dbo.datos_correo y asignando Cookie de Sesión"""
    user_id_limpio = data.user_id.strip()[:6]
    
    # 🟢 Consulta con JOIN a datos_correo por no_empleado
    query = text("""
        SELECT TOP 1
            E.usuario_rh, 
            E.nombre, 
            E.apellido_paterno, 
            E.apellido_materno,
            C.correo_corporativo
        FROM dbo.empleado E
        INNER JOIN dbo.datos_correo C ON C.no_empleado = E.no_empleado
        WHERE E.usuario_rh = :uid
    """)
    
    result = qa_db.execute(query, {"uid": user_id_limpio}).fetchone()
    
    if not result:
        raise HTTPException(
            status_code=404, 
            detail=f"Usuario '{user_id_limpio}' no encontrado o sin correo corporativo asignado."
        )
        
    nombre_completo = f"{result.nombre or ''} {result.apellido_paterno or ''} {result.apellido_materno or ''}".strip()
    
    # 🛡️ Inyectar la Cookie HttpOnly de sesión
    response.set_cookie(
        key="cmex_session",
        value=result.usuario_rh,
        httponly=True,   # Evita que scripts maliciosos lean la cookie desde JS (Protección Anti-XSS)
        samesite="lax",  # Protección contra ataques CSRF
        secure=False,    # Ponlo en True únicamente cuando despliegues con HTTPS en producción
        max_age=28800    # Duración de la cookie: 8 horas (en segundos)
    )

    return {
        "status": "success",
        "user": {
            "user_id": result.usuario_rh,
            "nombre": nombre_completo,
            "email": result.correo_corporativo  # Correo corporativo real
        }
    }

@app.post("/api/auth/logout")
def logout(response: Response):
    """Destruye la cookie de sesión en el navegador"""
    response.delete_cookie(
        key="cmex_session",
        httponly=True,
        samesite="lax",
        secure=False  # Cambiar a True en producción con HTTPS
    )
    return {"status": "success", "message": "Sesión cerrada correctamente"}

@app.post("/api/auth/admin")
def login_admin(data: schemas.LoginAdminRequest, response: Response):
    """Acceso exclusivo para administradores: Super Admin local o credenciales AD con Cookie HttpOnly"""
    user_id_limpio = data.user_id.strip()

    # 1. EVALUACIÓN DE SUPER ADMIN GENERAL (Local y directo, NO pasa por LDAP)
    if SUPER_ADMIN_USER and user_id_limpio.lower() == SUPER_ADMIN_USER.lower():
        if data.password == SUPER_ADMIN_PASS:
            admin_data = {
                "user_id": SUPER_ADMIN_USER,
                "nombre": "Administrador General RH",
                "email": "admin.rh@corp.cmex.canon.com",
                "rol": "super_admin"
            }
            
            # 🛡️ Inyectar cookie HttpOnly para Super Admin
            response.set_cookie(
                key="cmex_admin_session",
                value=SUPER_ADMIN_USER,
                httponly=True,   # Protección contra lectura vía JavaScript (Anti-XSS)
                samesite="lax",  # Protección contra ataques CSRF
                secure=False,    # Cambiar a True en producción con HTTPS
                max_age=28800    # Duración de 8 horas (en segundos)
            )

            return {
                "status": "success",
                "user": admin_data
            }
        else:
            raise HTTPException(
                status_code=401, 
                detail="Contraseña de administrador general incorrecta."
            )

    # 2. EVALUACIÓN VÍA ACTIVE DIRECTORY / LDAP (Para el resto de administradores)
    admin = autenticar_admin_ldap(user_id_limpio, data.password)
    if not admin:
        raise HTTPException(
            status_code=401, 
            detail="Credenciales de administrador inválidas."
        )
    
    # 🛡️ Inyectar cookie HttpOnly para Admin autenticado por LDAP
    admin_id = admin.get("user_id", user_id_limpio)
    response.set_cookie(
        key="cmex_admin_session",
        value=admin_id,
        httponly=True,
        samesite="lax",
        secure=False,  # Cambiar a True en producción con HTTPS
        max_age=28800  # Duración de 8 horas
    )

    return {"status": "success", "user": admin}


@app.get("/api/auth/me")
def check_session(
    cmex_session: str = Cookie(None),
    cmex_admin_session: str = Cookie(None)
):
    """Verifica si el usuario tiene una cookie activa al recargar la página"""
    if cmex_admin_session:
        return {
            "authenticated": True,
            "role": "admin",
            "user_id": cmex_admin_session
        }
    elif cmex_session:
        return {
            "authenticated": True,
            "role": "colaborador",
            "user_id": cmex_session
        }
    
    raise HTTPException(status_code=401, detail="Sesión no válida o expirada")


# ==============================================================================
# --- MÉTODOS PÚBLICOS ---
# ==============================================================================

# --- Comunicados (Público) ---
@app.get("/api/comunicados", response_model=List[schemas.ComunicadoResponse])
def listar_comunicados(db: Session = Depends(get_db)):
    return crud.get_comunicados_activos(db)


@app.post("/api/comunicados/{comunicado_id}/like")
def dar_like(
    comunicado_id: int, 
    payload: schemas.ComunicadoReaccionCreate, 
    db: Session = Depends(get_db)
):
    comunicado, accion = crud.toggle_like_comunicado(
        db, comunicado_id, payload.usuario_email, payload.usuario_nombre
    )
    
    if accion == "invalidEmail":
        raise HTTPException(status_code=400, detail="El correo del usuario es obligatorio.")
    if accion == "notFound":
        raise HTTPException(status_code=404, detail="Comunicado no encontrado.")
        
    return {"status": accion, "id": comunicado_id, "likes": comunicado.likes}


@app.post("/api/comunicados/{comunicado_id}/confirmar")
def confirmar_lectura(
    comunicado_id: int, 
    payload: schemas.ComunicadoReaccionCreate, 
    db: Session = Depends(get_db)
):
    comunicado, accion = crud.confirmar_lectura_comunicado(
        db, comunicado_id, payload.usuario_email, payload.usuario_nombre
    )
    
    if accion == "invalidEmail":
        raise HTTPException(status_code=400, detail="El correo del usuario es obligatorio.")
    if accion == "notFound":
        raise HTTPException(status_code=404, detail="Comunicado no encontrado.")
    if accion == "already_confirmed":
        return {
            "status": "already_confirmed",
            "message": "Ya has confirmado la lectura de este comunicado anteriormente.",
            "confirmaciones": comunicado.confirmaciones
        }
        
    return {
        "status": "success",
        "message": "Confirmación registrada",
        "confirmaciones": comunicado.confirmaciones
    }

# --- Convenios (Público) ---
@app.get("/api/convenios", response_model=List[schemas.ConvenioResponse])
def listar_convenios(categoria: Optional[str] = None, db: Session = Depends(get_db)):
    return crud.get_convenios(db, categoria_nombre=categoria)


@app.get("/api/convenios/categorias", response_model=List[schemas.CategoriaConvenioResponse])
def listar_categorias_convenios(db: Session = Depends(get_db)):
    return crud.get_categorias_convenios(db)


# --- Galería de Eventos (Público) ---
@app.get("/api/galeria", response_model=List[schemas.GaleriaEventoResponse])
def listar_galeria_publica(db: Session = Depends(get_db)):
    eventos = db.query(models.GaleriaEvento).order_by(models.GaleriaEvento.id.desc()).all()
    resultado = []
    for e in eventos:
        fotos_list = [
            {"id": f.id, "evento_id": f.evento_id, "url": f.url, "es_portada": f.es_portada}
            for f in e.fotos
        ]
        resultado.append({
            "id": e.id,
            "titulo": e.titulo,
            "categoria": e.categoria,
            "categoria_etiqueta": e.categoria_etiqueta,
            "fecha": e.fecha,
            "descripcion": e.descripcion,
            "enlace_url": e.enlace_url,
            "fotos_count": len(fotos_list) if fotos_list else 1,
            "fotos": fotos_list,
            "creado_el": e.creado_el
        })
    return resultado


# --- Calendario Corporativo (Público) ---
@app.get("/api/calendario", response_model=List[schemas.CalendarioResponse])
def listar_calendario(db: Session = Depends(get_db)):
    return crud.get_calendario_eventos(db)

# GET Público: Formatos activos
@app.get("/api/formatos", response_model=List[FormatoOut])
def get_formatos_publicos(db: Session = Depends(get_db)):
    return (
        db.query(Formato)
        .filter(Formato.estado == "activo")
        .order_by(Formato.id.desc())
        .all()
    )

# --- Caja de ahorro ---
@app.get("/api/caja-ahorro", response_model=List[schemas.CajaAhorroResponse])
def obtener_caja_ahorro_publico(db: Session = Depends(get_db)):
    return db.query(models.CajaAhorroModel).all()

# --- Calendario Orienta PAE --- #
@app.get("/api/orienta-pae/config")
async def obtener_calendario_pae(request: Request):
    """Devuelve las URLs vigentes del PDF y la imagen de Orienta PAE"""
    base_url = str(request.base_url).rstrip("/")
    
    # Buscar PDF
    pdf_nombre = "calendario_orienta_pae.pdf"
    pdf_ruta = os.path.join(UPLOAD_DIR, pdf_nombre)
    pdf_url = f"{base_url}/uploads/{pdf_nombre}" if os.path.exists(pdf_ruta) else None

    # Buscar Imagen (revisando extensiones comunes)
    img_url = None
    for ext in [".jpg", ".jpeg", ".png", ".webp"]:
        img_nombre = f"calendario_orienta_pae_img{ext}"
        img_ruta = os.path.join(UPLOAD_DIR, img_nombre)
        if os.path.exists(img_ruta):
            img_url = f"{base_url}/uploads/{img_nombre}"
            break

    return {
        "status": "success",
        "url": pdf_url,
        "imagen_url": img_url
    }


# ==============================================================================
# --- MÓDULO DE ADMINISTRACIÓN (EXCLUSIVO ADMIN) ---
# ==============================================================================

# --- UPLOAD DE ARCHIVOS (ADMIN) ---
@app.post("/api/admin/upload")
async def subir_archivo(request: Request, file: UploadFile = File(...)):
    """Sube un archivo validando su extensión y tamaño máximo"""
    nombre_original = file.filename or "archivo_desconocido"
    extensiones_permitidas = {".jpg", ".jpeg", ".png", ".webp", ".pdf", ".doc", ".docx", ".gif"}
    ext = os.path.splitext(nombre_original)[1].lower()
    
    if ext not in extensiones_permitidas:
        raise HTTPException(
            status_code=400, 
            detail=f"Formato no permitido. Extensiones válidas: {', '.join(extensiones_permitidas)}"
        )

    contenido = await file.read()
    if len(contenido) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="El archivo excede el tamaño máximo permitido (10 MB)."
        )

    nombre_unico = f"{uuid.uuid4().hex}{ext}"
    ruta_guardado = os.path.join(UPLOAD_DIR, nombre_unico)

    try:
        with open(ruta_guardado, "wb") as f:
            f.write(contenido)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al guardar el archivo en el servidor: {str(e)}"
        )

    base_url = str(request.base_url).rstrip("/")
    url_archivo = f"{base_url}/uploads/{nombre_unico}"

    return {
        "status": "success",
        "filename": nombre_original,
        "url": url_archivo
    }


# --- Gestión de Comunicados (Admin) ---
@app.get("/api/admin/comunicados/todos", response_model=List[schemas.ComunicadoResponse], dependencies=[Depends(requerir_admin)])
@app.get("/api/admin/comunicados", response_model=List[schemas.ComunicadoResponse], dependencies=[Depends(requerir_admin)]) # Alias de compatibilidad
def listar_todos_los_comunicados(db: Session = Depends(get_db)):
    return crud.get_todos_comunicados(db)

# 1. Crear nuevo comunicado (POST)
@app.post(
    "/api/admin/comunicados", 
    response_model=schemas.ComunicadoResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(requerir_admin)]
)
def guardar_comunicado(
    comunicado: schemas.ComunicadoCreate, 
    db: Session = Depends(get_db)
):
    print("DEBUG - Payload recibido por FastAPI:", comunicado.model_dump())
    nuevo_comunicado = crud.create_comunicado(db, comunicado)
    return nuevo_comunicado


# 2. Actualizar comunicado completo (PUT)
@app.put(
    "/api/admin/comunicados/{comunicado_id}", 
    response_model=schemas.ComunicadoResponse,
    dependencies=[Depends(requerir_admin)]
)
def actualizar_comunicado(
    comunicado_id: int, 
    comunicado: schemas.ComunicadoCreate, 
    db: Session = Depends(get_db)
):
    updated = crud.update_comunicado(db, comunicado_id, comunicado)
    if not updated:
        raise HTTPException(status_code=404, detail="Comunicado no encontrado")
    return updated


# 3. Cambiar estado del comunicado (PUT / PATCH)
@app.put("/api/admin/comunicados/{comunicado_id}/estado", dependencies=[Depends(requerir_admin)])
def cambiar_estado_comunicado(
    comunicado_id: int, 
    estado: str = Body(..., embed=True), 
    db: Session = Depends(get_db)
):
    # Estandarizamos el estado a minúsculas ("activo", "programado", "inactivo")
    estado_limpio = estado.strip().lower()

    updated = crud.update_estado_comunicado(db, comunicado_id, estado_limpio)
    if not updated:
        raise HTTPException(status_code=404, detail="Comunicado no encontrado")

    return {
        "status": "success", 
        "comunicado_id": comunicado_id, 
        "nuevo_estado": estado_limpio
    }

@app.delete("/api/admin/comunicados/{comunicado_id}", dependencies=[Depends(requerir_admin)])
def eliminar_comunicado(comunicado_id: int, db: Session = Depends(get_db)):
    db_comunicado = db.query(models.Comunicado).filter(models.Comunicado.id == comunicado_id).first()
    if not db_comunicado:
        raise HTTPException(status_code=404, detail="Comunicado no encontrado")
    
    imagen_url = getattr(db_comunicado, "imagen_url", None)
    if imagen_url:
        eliminar_archivo_fisico(imagen_url)
        
    db.delete(db_comunicado)
    db.commit()
    return {"status": "success", "message": "Comunicado eliminado correctamente"}

@app.get("/api/admin/comunicados/reacciones", dependencies=[Depends(requerir_admin)])
def obtener_reacciones_admin(db: Session = Depends(get_db)):
    """Endpoint para proveer el reporte de interacciones al panel de administración"""
    return crud.get_todas_reacciones_admin(db)


# ==============================================================================
# --- GESTIÓN DE CONVENIOS (ADMIN) ---
# ==============================================================================

@app.get("/api/admin/convenios/todos", response_model=List[schemas.ConvenioResponse], dependencies=[Depends(requerir_admin)])
def listar_todos_los_convenios(db: Session = Depends(get_db)):
    """Obtiene todos los convenios (activos y archivados) para el panel de administración"""
    return crud.get_todos_convenios_admin(db)


@app.post("/api/admin/convenios", response_model=schemas.ConvenioResponse, dependencies=[Depends(requerir_admin)])
def guardar_convenio(convenio: schemas.ConvenioCreate, db: Session = Depends(get_db)):
    """Crea un nuevo convenio e inserta su arreglo de contactos dinámicos"""
    try:
        return crud.create_convenio(db, convenio)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Error de integridad: La categoría seleccionada no existe o hay conflicto de claves."
        )


@app.put("/api/admin/convenios/{convenio_id}", response_model=schemas.ConvenioResponse, dependencies=[Depends(requerir_admin)])
def actualizar_convenio(convenio_id: int, convenio: schemas.ConvenioCreate, db: Session = Depends(get_db)):
    """Actualiza datos del convenio, elimina logos huérfanos y sincroniza contactos"""
    db_convenio = db.query(models.Convenio).filter(models.Convenio.id == convenio_id).first()
    if not db_convenio:
        raise HTTPException(status_code=404, detail="Convenio no encontrado")

    convenio_data = convenio.model_dump() if hasattr(convenio, "model_dump") else convenio.dict()
    logo_viejo = getattr(db_convenio, "logo_url", None)
    logo_nuevo = convenio_data.get("logo_url")
    
    # Limpieza de archivo físico si se reemplazó la imagen/logo
    if logo_viejo and logo_nuevo and logo_viejo != logo_nuevo:
        eliminar_archivo_fisico(logo_viejo)

    convenio_actualizado = crud.update_convenio(db, convenio_id, convenio)
    if not convenio_actualizado:
        raise HTTPException(status_code=400, detail="Error al actualizar los datos del convenio")

    return convenio_actualizado


@app.delete("/api/admin/convenios/{convenio_id}", dependencies=[Depends(requerir_admin)])
def eliminar_convenio(convenio_id: int, db: Session = Depends(get_db)):
    """Archiva el convenio cambiando su estado a 'archivado'"""
    exito = crud.archivar_convenio(db, convenio_id)
    if not exito:
        raise HTTPException(status_code=404, detail="Convenio no encontrado")
    return {"status": "success", "message": "Convenio archivado correctamente"}


@app.patch("/api/admin/convenios/{convenio_id}/reactivar", response_model=schemas.ConvenioResponse, dependencies=[Depends(requerir_admin)])
def reactivar_convenio(convenio_id: int, db: Session = Depends(get_db)):
    """Reactiva un convenio archivado devolviendo su estado a 'activo'"""
    db_convenio = db.query(models.Convenio).filter(models.Convenio.id == convenio_id).first()
    if not db_convenio:
        raise HTTPException(status_code=404, detail="Convenio no encontrado")
    
    crud.reactivar_convenio(db, convenio_id)
    db.refresh(db_convenio)
    return db_convenio


# --- Gestión de Galería de Eventos (Admin) ---
@app.get("/api/admin/galeria", response_model=List[schemas.GaleriaEventoResponse], dependencies=[Depends(requerir_admin)])
def listar_galeria_admin(db: Session = Depends(get_db)):
    return listar_galeria_publica(db)


@app.post("/api/admin/galeria", response_model=schemas.GaleriaEventoResponse, dependencies=[Depends(requerir_admin)])
def crear_evento_galeria(evento: schemas.GaleriaEventoCreate, db: Session = Depends(get_db)):
    return crud.create_galeria_evento(db, evento)


@app.put("/api/admin/galeria/{evento_id}", response_model=schemas.GaleriaEventoResponse, dependencies=[Depends(requerir_admin)])
def actualizar_evento_galeria(evento_id: int, evento: schemas.GaleriaEventoCreate, db: Session = Depends(get_db)):
    db_evento = db.query(models.GaleriaEvento).filter(models.GaleriaEvento.id == evento_id).first()
    if not db_evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    # Actualización de campos
    db_evento.titulo = evento.titulo  # type: ignore
    db_evento.categoria = evento.categoria  # type: ignore
    db_evento.categoria_etiqueta = evento.categoria_etiqueta  # type: ignore
    db_evento.fecha = evento.fecha  # type: ignore
    db_evento.descripcion = evento.descripcion  # type: ignore
    db_evento.enlace_url = evento.enlace_url  # 🟢 CAMBIO: Se asigna la actualización de la URL externa

    # Limpieza de archivos físicos eliminados del álbum
    fotos_viejas = {f.url: f for f in db_evento.fotos}
    fotos_nuevas_urls = {f.url for f in evento.fotos}

    for url_vieja, foto_obj in fotos_viejas.items():
        if url_vieja not in fotos_nuevas_urls:
            eliminar_archivo_fisico(url_vieja)

    # Reemplazar fotos asociadas en la base de datos
    db.query(models.GaleriaFoto).filter(models.GaleriaFoto.evento_id == evento_id).delete()

    for foto in evento.fotos:
        db_foto = models.GaleriaFoto(
            evento_id=evento_id,
            url=foto.url,
            es_portada=foto.es_portada
        )
        db.add(db_foto)

    db.commit()
    db.refresh(db_evento)
    return db_evento


@app.delete("/api/admin/galeria/{evento_id}", dependencies=[Depends(requerir_admin)])
def eliminar_evento_galeria(evento_id: int, db: Session = Depends(get_db)):
    db_evento = db.query(models.GaleriaEvento).filter(models.GaleriaEvento.id == evento_id).first()
    if not db_evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    for foto in db_evento.fotos:
        eliminar_archivo_fisico(foto.url)

    db.delete(db_evento)
    db.commit()
    return {"status": "success", "message": "Evento y sus fotos eliminados correctamente"}


# --- Gestión de Categorías de Convenios (Admin) ---
@app.post("/api/admin/convenios/categorias", response_model=schemas.CategoriaConvenioResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(requerir_admin)])
def crear_categoria_convenio(categoria: schemas.CategoriaConvenioCreate, db: Session = Depends(get_db)):
    return crud.create_categoria_convenio(db, categoria)


@app.put("/api/admin/convenios/categorias/{categoria_id}", response_model=schemas.CategoriaConvenioResponse, dependencies=[Depends(requerir_admin)])
def actualizar_categoria_convenio(categoria_id: int, categoria: schemas.CategoriaConvenioCreate, db: Session = Depends(get_db)):
    db_categoria = db.query(models.CategoriaConvenio).filter(models.CategoriaConvenio.id == categoria_id).first()
    if not db_categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    db_categoria.nombre = categoria.nombre  # type: ignore
    db.commit()
    db.refresh(db_categoria)
    return db_categoria


@app.delete("/api/admin/convenios/categorias/{categoria_id}", dependencies=[Depends(requerir_admin)])
def eliminar_categoria_convenio(categoria_id: int, db: Session = Depends(get_db)):
    db_categoria = db.query(models.CategoriaConvenio).filter(models.CategoriaConvenio.id == categoria_id).first()
    if not db_categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    try:
        db.delete(db_categoria)
        db.commit()
        return {"status": "success", "message": "Categoría eliminada correctamente"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400, 
            detail="No se puede eliminar la categoría porque hay convenios asociados a ella."
        )


# --- Gestión de Calendario Corporativo (Admin) ---
@app.post("/api/admin/calendario", response_model=schemas.CalendarioResponse, dependencies=[Depends(requerir_admin)])
def crear_evento_calendario(evento: schemas.CalendarioCreate, db: Session = Depends(get_db)):
    return crud.create_calendario_evento(db, evento)


@app.put("/api/admin/calendario/{evento_id}", response_model=schemas.CalendarioResponse, dependencies=[Depends(requerir_admin)])
def actualizar_evento_calendario(evento_id: int, evento: schemas.CalendarioCreate, db: Session = Depends(get_db)):
    db_evento = db.query(models.CalendarioEvento).filter(models.CalendarioEvento.id == evento_id).first()
    if not db_evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    evento_data = evento.model_dump()
    for key, value in evento_data.items():
        setattr(db_evento, key, value)
    
    db.commit()
    db.refresh(db_evento)
    return db_evento


@app.delete("/api/admin/calendario/{evento_id}", dependencies=[Depends(requerir_admin)])
def eliminar_evento_calendario(evento_id: int, db: Session = Depends(get_db)):
    success = crud.delete_calendario_evento(db, evento_id)
    if not success:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return {"status": "success", "message": "Evento eliminado correctamente"}


# --- Métricas y Reportes del Dashboard (Admin) ---
@app.get("/api/admin/metricas", dependencies=[Depends(requerir_admin)])
def obtener_metricas_dashboard(db: Session = Depends(get_db)):
    total_avisos = db.query(models.Comunicado).count()
    total_likes = db.query(models.Comunicado).with_entities(models.Comunicado.likes).all()
    total_confirmaciones = db.query(models.Comunicado).with_entities(models.Comunicado.confirmaciones).all()
    total_convenios = db.query(models.Convenio).filter(models.Convenio.estado == "activo").count()
    total_galeria = db.query(models.GaleriaEvento).count()

    return {
        "total_comunicados": total_avisos,
        "total_likes": sum(l[0] for l in total_likes if l[0]),
        "total_confirmaciones": sum(c[0] for c in total_confirmaciones if c[0]),
        "total_convenios_activos": total_convenios,
        "total_galeria": total_galeria
    }

# --- Carga de calendario OrientaPAE ---
@app.post("/api/admin/orienta-pae/upload", dependencies=[Depends(requerir_admin)])
async def subir_calendario_pae(request: Request, file: UploadFile = File(...)):
    """Sube el PDF de Orienta PAE y lo guarda con nombre fijo en uploads"""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF.")
    
    contenido = await file.read()
    if len(contenido) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="El archivo excede el tamaño máximo permitido (10 MB).")

    # Nombre fijo para que siempre sea el mismo archivo vigente en el portal
    nombre_archivo = "calendario_orienta_pae.pdf"
    ruta_guardado = os.path.join(UPLOAD_DIR, nombre_archivo)

    try:
        with open(ruta_guardado, "wb") as f:
            f.write(contenido)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar el archivo: {str(e)}")

    base_url = str(request.base_url).rstrip("/")
    url_archivo = f"{base_url}/uploads/{nombre_archivo}"

    return {
        "status": "success",
        "url": url_archivo
    }

# --- Carga de imagen de vista previa para Calendario OrientaPAE ---
@app.post("/api/admin/orienta-pae/upload-image", dependencies=[Depends(requerir_admin)])
async def subir_imagen_calendario_pae(request: Request, file: UploadFile = File(...)):
    """Sube la imagen de vista previa de Orienta PAE y la guarda con nombre fijo en uploads"""
    if not file.filename or not file.filename.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos de imagen (.png, .jpg, .jpeg, .webp).")
    
    contenido = await file.read()
    if len(contenido) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="El archivo excede el tamaño máximo permitido (10 MB).")

    # Detectar la extensión original del archivo para mantenerla
    _, ext = os.path.splitext(file.filename.lower())
    nombre_archivo = f"calendario_orienta_pae_img{ext}"
    ruta_guardado = os.path.join(UPLOAD_DIR, nombre_archivo)

    try:
        with open(ruta_guardado, "wb") as f:
            f.write(contenido)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar la imagen: {str(e)}")

    base_url = str(request.base_url).rstrip("/")
    url_archivo = f"{base_url}/uploads/{nombre_archivo}"

    return {
        "status": "success",
        "url": url_archivo
    }


# GET Admin: Todos los formatos
@app.get("/api/admin/formatos", response_model=List[FormatoOut], dependencies=[Depends(requerir_admin)])
def get_formatos_admin(db: Session = Depends(get_db)):
    return db.query(Formato).order_by(Formato.id.desc()).all()

# POST Admin: Crear Formato
@app.post("/api/admin/formatos", response_model=FormatoOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(requerir_admin)])
def crear_formato(formato: FormatoCreate, db: Session = Depends(get_db)):
    nuevo_formato = Formato(
        titulo=formato.titulo.strip(),
        categoria=formato.categoria.strip(),
        descripcion=formato.descripcion.strip() if formato.descripcion else None,
        extension=formato.extension.upper().strip(),
        archivo_url=formato.archivo_url.strip(),
        peso_bytes=formato.peso_bytes,
        estado=formato.estado or "activo",
        creado_el=obtener_ahora_mexico(),
        actualizado_el=obtener_ahora_mexico()
    )
    db.add(nuevo_formato)
    db.commit()
    db.refresh(nuevo_formato)
    return nuevo_formato

# PUT Admin: Actualizar Formato
@app.put("/api/admin/formatos/{formato_id}", response_model=FormatoOut, dependencies=[Depends(requerir_admin)])
def actualizar_formato(formato_id: int, formato: FormatoUpdate, db: Session = Depends(get_db)):
    db_formato = db.query(Formato).filter(Formato.id == formato_id).first()
    if not db_formato:
        raise HTTPException(status_code=404, detail="Formato no encontrado")

    update_data = formato.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            if isinstance(value, str):
                value = value.strip()
            setattr(db_formato, key, value)

    db_formato.actualizado_el = obtener_ahora_mexico()
    db.commit()
    db.refresh(db_formato)
    return db_formato

# DELETE Admin: Eliminar Formato
@app.delete("/api/admin/formatos/{formato_id}", dependencies=[Depends(requerir_admin)])
def eliminar_formato(formato_id: int, db: Session = Depends(get_db)):
    db_formato = db.query(Formato).filter(Formato.id == formato_id).first()
    if not db_formato:
        raise HTTPException(status_code=404, detail="Formato no encontrado")

    db.delete(db_formato)
    db.commit()
    return {"status": "success", "message": "Formato eliminado correctamente"}

@app.get("/api/admin/caja-ahorro/todos", response_model=List[schemas.CajaAhorroResponse], dependencies=[Depends(requerir_admin)])
def listar_caja_ahorro(db: Session = Depends(get_db)):
    return crud.get_caja_ahorro_todos(db)

@app.put("/api/admin/caja-ahorro/{item_id}", response_model=schemas.CajaAhorroResponse, dependencies=[Depends(requerir_admin)])
def modificar_caja_ahorro(item_id: int, payload: schemas.CajaAhorroCreate, db: Session = Depends(get_db)):
    item = crud.actualizar_caja_ahorro(db, item_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="Documento de caja de ahorro no encontrado")
    return item