import os
from typing import Optional, Dict, Any
from ldap3 import Server, Connection, ALL, SUBTREE
from ldap3.core.exceptions import LDAPException

# Configuración corporativa basada en el entorno
LDAP_SERVER: str = os.getenv("LDAP_SERVER", "192.168.3.164")
LDAP_PORT: int = int(os.getenv("LDAP_PORT", "389"))
LDAP_DOMAIN: str = os.getenv("LDAP_DOMAIN", "corp.cmex.canon.com")
LDAP_BASE_DN: str = os.getenv("LDAP_BASE_DN", "dc=corp,dc=cmex,dc=canon,dc=com")

def validar_usuario_colaborador(user_id: str, password: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Valida al colaborador en Active Directory replicando el comportamiento 
    de autenticación directa (bind con user@DOMAIN).
    """
    try:
        server = Server(f"ldap://{LDAP_SERVER}:{LDAP_PORT}", get_info=ALL)
        user_dn = f"{user_id.strip()}@{LDAP_DOMAIN}"
        
        service_user: Optional[str] = os.getenv("LDAP_SERVICE_USER")
        service_pass: Optional[str] = os.getenv("LDAP_SERVICE_PASSWORD")

        if not password and service_user and service_pass:
            conn = Connection(server, user=service_user, password=service_pass, auto_bind=True)
            search_filter = f"(&(sAMAccountName={user_id})(objectClass=user))"
            
            conn.search(
                search_base=LDAP_BASE_DN,
                search_filter=search_filter,
                search_scope=SUBTREE,
                attributes=['sAMAccountName', 'displayName', 'mail', 'userAccountControl']
            )
            
            if not conn.entries:
                conn.unbind()
                return None
                
            entry = conn.entries[0]
            conn.unbind()
            
            return {
                "user_id": str(entry.sAMAccountName.value) if entry.sAMAccountName else user_id,
                "nombre": str(entry.displayName.value) if hasattr(entry, 'displayName') and entry.displayName else user_id,
                "email": str(entry.mail.value) if hasattr(entry, 'mail') and entry.mail else None
            }
        
        else:
            pwd_str = password if password is not None else ""
            conn = Connection(server, user=user_dn, password=pwd_str, auto_bind=False)
            
            if conn.bind():
                search_filter = f"(&(sAMAccountName={user_id})(objectClass=user))"
                conn.search(
                    search_base=LDAP_BASE_DN,
                    search_filter=search_filter,
                    search_scope=SUBTREE,
                    attributes=['sAMAccountName', 'displayName', 'mail']
                )
                
                resultado: Optional[Dict[str, Any]] = None
                if conn.entries:
                    entry = conn.entries[0]
                    resultado = {
                        "user_id": str(entry.sAMAccountName.value) if entry.sAMAccountName else user_id,
                        "nombre": str(entry.displayName.value) if hasattr(entry, 'displayName') and entry.displayName else user_id,
                        "email": str(entry.mail.value) if hasattr(entry, 'mail') and entry.mail else None
                    }
                else:
                    resultado = {"user_id": user_id, "nombre": user_id, "email": None}
                
                conn.unbind()
                return resultado
            else:
                return None

    except LDAPException as e:
        print(f"Error de conexión LDAP: {e}")
        return None


def autenticar_admin_ldap(user_id: str, password: str) -> Optional[Dict[str, Any]]:
    """
    Autentica a un administrador utilizando el esquema de bind directo por dominio.
    """
    return validar_usuario_colaborador(user_id, password)