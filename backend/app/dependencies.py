from fastapi import Cookie, HTTPException, status

def requerir_admin(cmex_admin_session: str = Cookie(None)):
    """
    Dependencia de seguridad que lee la cookie HttpOnly 'cmex_admin_session'.
    Si no existe o está vacía, rechaza la petición con HTTP 401 Unauthorized.
    """
    if not cmex_admin_session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Acceso no autorizado. Debe iniciar sesión como administrador.",
        )
    
    # Retorna el ID del administrador autenticado por si necesitas usarlo en el endpoint
    return cmex_admin_session