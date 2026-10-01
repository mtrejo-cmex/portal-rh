from sqlalchemy import Column, String
from .qa_database import QABase

class EmpleadoQA(QABase):
    __tablename__ = "empleado"
    __table_args__ = {'schema': 'dbo'}
    
    # Asegúrate de que estos nombres coincidan exactamente con la DB de QA
    id_empleado = Column(String, primary_key=True, name="id_empleado")
    nombre = Column(String, name="nombre")
    email = Column(String, name="email")