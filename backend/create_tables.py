from app.core.database import Base, engine
from app.models import User, ClinicalCase

print("Criando tabelas...")
Base.metadata.create_all(bind=engine)
print("Tabelas criadas com sucesso.")