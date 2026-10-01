from sqlalchemy.orm import Session, joinedload
from sqlalchemy import text, func, case, or_, and_
from datetime import datetime
from zoneinfo import ZoneInfo
from . import models, schemas
from . utils import obtener_ahora_mexico

# ==============================================================================
# --- CRUD COMUNICADOS ---
# ==============================================================================

def recalcular_contadores_comunicado(db: Session, comunicado: models.Comunicado):
    """
    Sincroniza y calcula los contadores reales 'likes' y 'confirmaciones' 
    directamente desde la tabla comunicado_reacciones.
    """
    if not comunicado:
        return comunicado

    # 1. Contar Likes reales
    likes_count = (
        db.query(func.count(models.ComunicadoReaccion.id))
        .filter(
            models.ComunicadoReaccion.comunicado_id == comunicado.id,
            models.ComunicadoReaccion.tipo_reaccion == "like"
        )
        .scalar() or 0
    )

    # 2. Contar Confirmaciones / Enterados reales
    confirmaciones_count = (
        db.query(func.count(models.ComunicadoReaccion.id))
        .filter(
            models.ComunicadoReaccion.comunicado_id == comunicado.id,
            models.ComunicadoReaccion.tipo_reaccion == "enterado"
        )
        .scalar() or 0
    )

    # 3. Asignar contadores al objeto
    comunicado.likes = likes_count
    comunicado.confirmaciones = confirmaciones_count
    return comunicado

def get_comunicados_activos(db: Session):
    """
    Obtiene comunicados activos calculando likes y enterados en UNA SOLA consulta SQL.
    """
    ahora = obtener_ahora_mexico()

    # 1. Subconsulta: Agrupa por comunicado_id y cuenta 'like' y 'enterado'
    reacciones_subquery = (
        db.query(
            models.ComunicadoReaccion.comunicado_id,
            func.count(case((models.ComunicadoReaccion.tipo_reaccion == "like", 1))).label("total_likes"),
            func.count(case((models.ComunicadoReaccion.tipo_reaccion == "enterado", 1))).label("total_confirmaciones")
        )
        .group_by(models.ComunicadoReaccion.comunicado_id)
        .subquery()
    )

    # 2. Consulta principal: LEFT JOIN de Comunicados con la Subconsulta
    resultados = (
        db.query(
            models.Comunicado,
            func.coalesce(reacciones_subquery.c.total_likes, 0).label("likes_count"),
            func.coalesce(reacciones_subquery.c.total_confirmaciones, 0).label("confirmaciones_count")
        )
        .outerjoin(reacciones_subquery, models.Comunicado.id == reacciones_subquery.c.comunicado_id)
        .filter(
            or_(
                models.Comunicado.estado == "activo",
                and_(
                    models.Comunicado.estado == "programado",
                    models.Comunicado.fecha_publicacion <= ahora
                )
            )
        )
        .order_by(models.Comunicado.fecha_publicacion.desc())
        .all()
    )

    # 3. Asignación rápida en memoria a los objetos de respuesta
    comunicados = []
    for comunicado, likes, confirmaciones in resultados:
        comunicado.likes = likes
        comunicado.confirmaciones = confirmaciones
        comunicados.append(comunicado)

    return comunicados


def get_todos_comunicados(db: Session):
    """
    Obtiene todos los comunicados para el panel de administración con sus reacciones calculadas en 1 consulta.
    """
    reacciones_subquery = (
        db.query(
            models.ComunicadoReaccion.comunicado_id,
            func.count(case((models.ComunicadoReaccion.tipo_reaccion == "like", 1))).label("total_likes"),
            func.count(case((models.ComunicadoReaccion.tipo_reaccion == "enterado", 1))).label("total_confirmaciones")
        )
        .group_by(models.ComunicadoReaccion.comunicado_id)
        .subquery()
    )

    resultados = (
        db.query(
            models.Comunicado,
            func.coalesce(reacciones_subquery.c.total_likes, 0).label("likes_count"),
            func.coalesce(reacciones_subquery.c.total_confirmaciones, 0).label("confirmaciones_count")
        )
        .outerjoin(reacciones_subquery, models.Comunicado.id == reacciones_subquery.c.comunicado_id)
        .order_by(models.Comunicado.fecha_publicacion.desc())
        .all()
    )

    comunicados = []
    for comunicado, likes, confirmaciones in resultados:
        comunicado.likes = likes
        comunicado.confirmaciones = confirmaciones
        comunicados.append(comunicado)

    return comunicados

def create_comunicado(db: Session, comunicado: schemas.ComunicadoCreate):
    ahora = obtener_ahora_mexico()
    
    # Manejar zona horaria / naive datetime
    if comunicado.fecha_publicacion:
        fecha_pub = comunicado.fecha_publicacion.replace(tzinfo=None)
    else:
        fecha_pub = ahora

    # Si la fecha es futura se programa, de lo contrario pasa a activo
    estado_inicial = "programado" if fecha_pub > ahora else "activo"

    db_comunicado = models.Comunicado(
        titulo=comunicado.titulo.strip(),
        categoria=comunicado.categoria.strip() if comunicado.categoria else "General",
        autor=comunicado.autor.strip() if comunicado.autor else "Recursos Humanos",
        resumen=comunicado.resumen.strip() if comunicado.resumen else None,
        contenido=comunicado.contenido.strip() if comunicado.contenido else None,
        imagen_url=comunicado.imagen_url.strip() if comunicado.imagen_url else None,
        documento_url=comunicado.documento_url.strip() if comunicado.documento_url else None,
        enlace_url=comunicado.enlace_url.strip() if comunicado.enlace_url else None,
        fecha_publicacion=fecha_pub,
        estado=estado_inicial,
        creado_el=ahora
    )
    db.add(db_comunicado)
    db.commit()
    db.refresh(db_comunicado)
    
    # Inicializar contadores en memoria para la respuesta Pydantic
    db_comunicado.likes = 0
    db_comunicado.confirmaciones = 0
    return db_comunicado


def update_comunicado(db: Session, comunicado_id: int, comunicado: schemas.ComunicadoCreate):
    db_comunicado = db.query(models.Comunicado).filter(models.Comunicado.id == comunicado_id).first()
    if not db_comunicado:
        return None

    ahora = obtener_ahora_mexico()
    
    # Extraer únicamente los campos recibidos en la petición
    datos = comunicado.model_dump(exclude_unset=True) if hasattr(comunicado, "model_dump") else comunicado.dict(exclude_unset=True)

    # Manejar fecha de publicación si fue proporcionada
    fecha_pub = datos.get("fecha_publicacion")
    if fecha_pub:
        if isinstance(fecha_pub, datetime):
            fecha_pub = fecha_pub.replace(tzinfo=None)
        datos["fecha_publicacion"] = fecha_pub
    else:
        datos["fecha_publicacion"] = db_comunicado.fecha_publicacion or ahora

    # Lógica de estados
    if db_comunicado.estado == "activo":
        datos["estado"] = "activo"
    elif datos["fecha_publicacion"] > ahora:
        datos["estado"] = "programado"
    else:
        datos["estado"] = "activo"

    # Actualizar dinámicamente los atributos
    for key, value in datos.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(db_comunicado, key, value)

    db.commit()
    db.refresh(db_comunicado)
    
    # Reutilizar la subconsulta o mantener contadores actuales
    db_comunicado.likes = getattr(db_comunicado, "likes", 0)
    db_comunicado.confirmaciones = getattr(db_comunicado, "confirmaciones", 0)
    return db_comunicado


def update_estado_comunicado(db: Session, comunicado_id: int, nuevo_estado: str):
    db_comunicado = db.query(models.Comunicado).filter(models.Comunicado.id == comunicado_id).first()
    if not db_comunicado:
        return None
    
    db_comunicado.estado = nuevo_estado
    
    # Si se activa manualmente un comunicado programado, se actualiza su fecha a 'ahora'
    if nuevo_estado == "activo":
        db_comunicado.fecha_publicacion = obtener_ahora_mexico()
        
    db.commit()
    db.refresh(db_comunicado)
    return db_comunicado

def delete_comunicado(db: Session, comunicado_id: int):
    """Elimina el registro del comunicado de la base de datos"""
    db_comunicado = db.query(models.Comunicado).filter(models.Comunicado.id == comunicado_id).first()
    if db_comunicado:
        db.delete(db_comunicado)
        db.commit()
        return True
    return False


def toggle_like_comunicado(db: Session, comunicado_id: int, usuario_email: str, usuario_nombre: str = None):
    """
    Registra o quita el Like de un colaborador en la tabla comunicado_reacciones.
    Recalcula automáticamente los totales reales.
    """
    email_limpio = (usuario_email or "").strip().lower()
    if not email_limpio:
        return None, "invalidEmail"

    comunicado = db.query(models.Comunicado).filter(models.Comunicado.id == comunicado_id).first()
    if not comunicado:
        return None, "notFound"

    # Buscar reacción previa
    reaccion = db.query(models.ComunicadoReaccion).filter(
        models.ComunicadoReaccion.comunicado_id == comunicado_id,
        models.ComunicadoReaccion.usuario_email == email_limpio,
        models.ComunicadoReaccion.tipo_reaccion == "like"
    ).first()

    if reaccion:
        # Toggle OFF: Quitar Like
        db.delete(reaccion)
        accion = "unliked"
    else:
        # Toggle ON: Dar Like
        nueva_reaccion = models.ComunicadoReaccion(
            comunicado_id=comunicado_id,
            usuario_email=email_limpio,
            usuario_nombre=usuario_nombre,
            tipo_reaccion="like",
            creado_el=obtener_ahora_mexico()
        )
        db.add(nueva_reaccion)
        accion = "liked"

    db.commit()

    # Recalcular conteo real desde SQL Server y actualizar la tabla principal
    recalcular_contadores_comunicado(db, comunicado)
    db.commit()
    db.refresh(comunicado)
    return comunicado, accion


def confirmar_lectura_comunicado(db: Session, comunicado_id: int, usuario_email: str, usuario_nombre: str = None):
    """
    Registra la lectura ('enterado') de un colaborador en la tabla comunicado_reacciones.
    Recalcula automáticamente los totales reales.
    """
    email_limpio = (usuario_email or "").strip().lower()
    if not email_limpio:
        return None, "invalidEmail"

    comunicado = db.query(models.Comunicado).filter(models.Comunicado.id == comunicado_id).first()
    if not comunicado:
        return None, "notFound"

    # Buscar si ya confirmó
    reaccion = db.query(models.ComunicadoReaccion).filter(
        models.ComunicadoReaccion.comunicado_id == comunicado_id,
        models.ComunicadoReaccion.usuario_email == email_limpio,
        models.ComunicadoReaccion.tipo_reaccion == "enterado"
    ).first()

    if reaccion:
        recalcular_contadores_comunicado(db, comunicado)
        return comunicado, "already_confirmed"

    # Registrar confirmación única
    nueva_reaccion = models.ComunicadoReaccion(
        comunicado_id=comunicado_id,
        usuario_email=email_limpio,
        usuario_nombre=usuario_nombre,
        tipo_reaccion="enterado",
        creado_el=obtener_ahora_mexico()
    )
    db.add(nueva_reaccion)
    db.commit()

    # Recalcular conteo real desde SQL Server y actualizar la tabla principal
    recalcular_contadores_comunicado(db, comunicado)
    db.commit()
    db.refresh(comunicado)
    return comunicado, "confirmed"


def get_todas_reacciones_admin(db: Session):
    """
    Obtiene el historial completo de reacciones y confirmaciones de los comunicados
    para el panel de administración.
    """
    query = text("""
        SELECT 
            R.id,
            R.comunicado_id,
            C.titulo AS comunicado_titulo,
            R.usuario_email,
            R.usuario_nombre,
            R.tipo_reaccion,
            R.creado_el
        FROM dbo.comunicado_reacciones R
        LEFT JOIN dbo.comunicados C ON C.id = R.comunicado_id
        ORDER BY R.creado_el DESC
    """)
    result = db.execute(query).fetchall()
    
    return [
        {
            "id": row.id,
            "comunicado_id": row.comunicado_id,
            "comunicado_titulo": row.comunicado_titulo or "Comunicado Eliminado",
            "usuario_email": row.usuario_email,
            "usuario_nombre": row.usuario_nombre or "Colaborador",
            "tipo_reaccion": row.tipo_reaccion,
            "creado_el": row.creado_el.strftime("%Y-%m-%d %H:%M:%S") if row.creado_el else None
        }
        for row in result
    ]

# ==============================================================================
# --- CRUD CATEGORÍAS DE CONVENIOS ---
# ==============================================================================

def get_categorias_convenios(db: Session):
    """Obtiene todas las categorías activas para el filtro de convenios"""
    return db.query(models.CategoriaConvenio).filter(
        models.CategoriaConvenio.estado == "activo"
    ).order_by(models.CategoriaConvenio.nombre.asc()).all()


def create_categoria_convenio(db: Session, categoria: schemas.CategoriaConvenioCreate):
    """Crea una nueva categoría de convenio"""
    db_cat = models.CategoriaConvenio(
        nombre=categoria.nombre,
        estado=categoria.estado if hasattr(categoria, 'estado') else "activo"
    )
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat


# ==============================================================================
# --- CRUD CONVENIOS Y CONTACTOS ---
# ==============================================================================

def get_convenios(db: Session, categoria_id: int = None, categoria_nombre: str = None):  # type: ignore
    """
    Obtiene convenios ACTIVOS para el portal público haciendo JOIN con categorías y contactos.
    """
    query = db.query(models.Convenio).options(
        joinedload(models.Convenio.categoria_rel),
        joinedload(models.Convenio.contactos)
    ).filter(models.Convenio.estado == "activo")

    if categoria_id:
        query = query.filter(models.Convenio.categoria_id == categoria_id)
    elif categoria_nombre and categoria_nombre.lower() != "todos":
        query = query.join(models.Convenio.categoria_rel).filter(
            models.CategoriaConvenio.nombre == categoria_nombre
        )

    return query.order_by(models.Convenio.destacado.desc(), models.Convenio.id.desc()).all()


def get_todos_convenios_admin(db: Session):
    """
    Obtiene TODOS los convenios (activos y archivados) para la vista del panel de administración.
    """
    return db.query(models.Convenio).options(
        joinedload(models.Convenio.categoria_rel),
        joinedload(models.Convenio.contactos)
    ).order_by(models.Convenio.id.desc()).all()


def create_convenio(db: Session, convenio: schemas.ConvenioCreate):
    """Crea un nuevo convenio e inserta sus contactos dinámicos."""
    datos = convenio.model_dump() if hasattr(convenio, "model_dump") else convenio.dict()
    
    # 1. Extraer los contactos dinámicos para procesarlos por separado
    contactos_data = datos.pop("contactos", [])
    
    # 2. Eliminar campos sobrantes que no existen como columnas en models.Convenio
    datos.pop("categoria", None)
    
    # 3. Crear la instancia del convenio (incluye automáticamente el campo 'titulo' si viene en el dict)
    db_convenio = models.Convenio(**datos)
    db.add(db_convenio)
    db.commit()
    db.refresh(db_convenio)
    
    # 4. Insertar la lista de contactos asociados
    for c in contactos_data:
        db_contacto = models.ConvenioContacto(
            convenio_id=db_convenio.id,
            nombre=c.get("nombre"),
            email=c.get("email"),
            telefono=c.get("telefono"),
            puesto=c.get("puesto")
        )
        db.add(db_contacto)
        
    if contactos_data:
        db.commit()
        db.refresh(db_convenio)
        
    return db_convenio


def update_convenio(db: Session, convenio_id: int, convenio: schemas.ConvenioCreate):
    """Actualiza los datos de un convenio y reemplaza sus contactos asociados."""
    db_convenio = db.query(models.Convenio).filter(models.Convenio.id == convenio_id).first()
    if not db_convenio:
        return None

    datos = convenio.model_dump() if hasattr(convenio, "model_dump") else convenio.dict()
    contactos_data = datos.pop("contactos", [])
    datos.pop("categoria", None)

    # Actualizar campos simples (empresa, titulo, descuento, etc.)
    for key, value in datos.items():
        setattr(db_convenio, key, value)

    # Limpiar contactos anteriores y reinsertar los nuevos
    db.query(models.ConvenioContacto).filter(models.ConvenioContacto.convenio_id == convenio_id).delete()
    
    for c in contactos_data:
        db_contacto = models.ConvenioContacto(
            convenio_id=convenio_id,
            nombre=c.get("nombre"),
            email=c.get("email"),
            telefono=c.get("telefono"),
            puesto=c.get("puesto")
        )
        db.add(db_contacto)

    db.commit()
    db.refresh(db_convenio)
    return db_convenio


def archivar_convenio(db: Session, convenio_id: int):
    """Cambia el estado del convenio a 'archivado' en lugar de borrarlo físicamente."""
    db_convenio = db.query(models.Convenio).filter(models.Convenio.id == convenio_id).first()
    if not db_convenio:
        return False
    
    db_convenio.estado = "archivado"
    db.commit()
    return True


def reactivar_convenio(db: Session, convenio_id: int):
    """Restaura un convenio archivado a estado 'activo'."""
    db_convenio = db.query(models.Convenio).filter(models.Convenio.id == convenio_id).first()
    if not db_convenio:
        return False
    
    db_convenio.estado = "activo"
    db.commit()
    return True

# ==============================================================================
# --- CRUD GALERÍA DE EVENTOS ---
# ==============================================================================

def get_galeria_eventos(db: Session):
    """Obtiene todos los eventos/álbumes con sus respectivas fotos relacionadas"""
    return db.query(models.GaleriaEvento).order_by(models.GaleriaEvento.id.desc()).all()


def create_galeria_evento(db: Session, evento: schemas.GaleriaEventoCreate):
    """Crea un nuevo evento y sus fotos asociadas en la base de datos relacional"""
    db_evento = models.GaleriaEvento(
        titulo=evento.titulo,
        categoria=evento.categoria,
        categoria_etiqueta=evento.categoria_etiqueta,
        fecha=evento.fecha,
        descripcion=evento.descripcion,
        enlace_url=evento.enlace_url
    )
    db.add(db_evento)
    db.commit()
    db.refresh(db_evento)

    # Insertar cada foto asociada al evento
    for foto in evento.fotos:
        db_foto = models.GaleriaFoto(
            evento_id=db_evento.id,
            url=foto.url,
            es_portada=foto.es_portada
        )
        db.add(db_foto)

    db.commit()
    db.refresh(db_evento)
    return db_evento

def update_galeria_evento(db: Session, evento_id: int, evento: schemas.GaleriaEventoCreate):
    """Actualiza un evento existente y reemplaza sus fotos asociadas"""
    db_evento = db.query(models.GaleriaEvento).filter(models.GaleriaEvento.id == evento_id).first()
    if not db_evento:
        return None

    # Actualizar campos informativos
    db_evento.titulo = evento.titulo
    db_evento.categoria = evento.categoria
    db_evento.categoria_etiqueta = evento.categoria_etiqueta
    db_evento.fecha = evento.fecha
    db_evento.descripcion = evento.descripcion
    db_evento.enlace_url = evento.enlace_url  # 🟢 CAMBIO: Actualiza el enlace externo

    # Reemplazar fotos asociadas
    db.query(models.GaleriaFoto).filter(models.GaleriaFoto.evento_id == evento_id).delete()
    
    for foto in evento.fotos:
        db_foto = models.GaleriaFoto(
            evento_id=db_evento.id,
            url=foto.url,
            es_portada=foto.es_portada
        )
        db.add(db_foto)

    db.commit()
    db.refresh(db_evento)
    return db_evento

# ==============================================================================
# --- CRUD CALENDARIO CORPORATIVO ---
# ==============================================================================

def get_calendario_eventos(db: Session):
    """
    Obtiene todos los eventos del calendario ordenados por fecha de inicio y hora de inicio.
    """
    return db.query(models.CalendarioEvento).order_by(
        models.CalendarioEvento.fecha_inicio.asc(),
        models.CalendarioEvento.hora_inicio.asc()
    ).all()


def create_calendario_evento(db: Session, evento: schemas.CalendarioCreate):
    """
    Crea un nuevo evento en el calendario corporativo incluyendo rango de fechas y horarios opcionales.
    """
    datos = evento.model_dump() if hasattr(evento, "model_dump") else evento.dict()
    
    db_evento = models.CalendarioEvento(**datos)
    db.add(db_evento)
    db.commit()
    db.refresh(db_evento)
    return db_evento


def update_calendario_evento(db: Session, evento_id: int, evento: schemas.CalendarioCreate):
    """
    Actualiza los datos de un evento existente en el calendario corporativo.
    """
    db_evento = db.query(models.CalendarioEvento).filter(models.CalendarioEvento.id == evento_id).first()
    if not db_evento:
        return None
    
    evento_data = evento.model_dump() if hasattr(evento, "model_dump") else evento.dict()
    for key, value in evento_data.items():
        setattr(db_evento, key, value)
    
    db.commit()
    db.refresh(db_evento)
    return db_evento


def delete_calendario_evento(db: Session, evento_id: int):
    """
    Elimina físicamente un evento del calendario por su ID.
    """
    db_evento = db.query(models.CalendarioEvento).filter(models.CalendarioEvento.id == evento_id).first()
    if db_evento:
        db.delete(db_evento)
        db.commit()
        return True
    return False

# ==============================================================================
# --- CRUD CAJA DE AHORRO ---
# ==============================================================================

def get_caja_ahorro_todos(db: Session):
    """Obtiene todos los documentos de la caja de ahorro para el administrador y colaboradores."""
    return db.query(models.CajaAhorroModel).all()

def actualizar_caja_ahorro(db: Session, item_id: int, payload: schemas.CajaAhorroCreate):
    """Actualiza los datos y la URL de Google Drive de un documento de la caja de ahorro."""
    item = db.query(models.CajaAhorroModel).filter(models.CajaAhorroModel.id == item_id).first()
    if not item:
        return None
    
    item.titulo = payload.titulo
    item.descripcion = payload.descripcion
    item.categoria = payload.categoria
    item.extension = payload.extension
    item.archivo_url = payload.archivo_url
    item.peso_bytes = payload.peso_bytes
    item.fecha_actualizacion = obtener_ahora_mexico()
    
    db.commit()
    db.refresh(item)
    return item