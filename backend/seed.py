from datetime import date

from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models import (
    CaseMessage,
    ClinicalCase,
    PathologyReport,
    RegulatorFollowUp,
    TeleconsultResponse,
    User,
)
from app.models.case import CaseStatus
from app.models.message import MessageType
from app.models.user import UserRole


SEED_PASSWORD = "Teste@123"


def get_or_create_user(db, *, email: str, role: UserRole, full_name: str, **kwargs) -> User:
    user = db.query(User).filter(User.email == email).first()

    if user:
        return user

    user = User(
        full_name=full_name,
        email=email,
        password_hash=hash_password(SEED_PASSWORD),
        role=role,
        is_active=True,
        **kwargs,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_or_create_case(db, *, patient_name: str, professional: User, **kwargs) -> ClinicalCase:
    case = (
        db.query(ClinicalCase)
        .filter(
            ClinicalCase.patient_name == patient_name,
            ClinicalCase.professional_id == professional.id,
        )
        .first()
    )

    if case:
        return case

    case = ClinicalCase(
        professional_id=professional.id,
        patient_name=patient_name,
        **kwargs,
    )

    db.add(case)
    db.commit()
    db.refresh(case)
    return case


def get_or_create_response(
    db,
    *,
    case: ClinicalCase,
    teleconsultor: User,
    marked_as_suspected: bool = False,
) -> TeleconsultResponse:
    response = (
        db.query(TeleconsultResponse)
        .filter(TeleconsultResponse.case_id == case.id)
        .first()
    )

    if response:
        return response

    response = TeleconsultResponse(
        case_id=case.id,
        teleconsultor_id=teleconsultor.id,
        clinical_description=(
            "Lesao ulcerada de bordas discretamente endurecidas, com relato de "
            "evolucao persistente e necessidade de avaliacao especializada."
        ),
        justified_hypotheses=(
            "Hipoteses: ulcera traumatica cronica, lesao potencialmente maligna "
            "e carcinoma espinocelular como diagnostico diferencial."
        ),
        conduct=(
            "Orientar remocao de fatores traumaticos, analgesia conforme protocolo "
            "local e encaminhamento para avaliacao presencial/biopsia."
        ),
        care_coordination=(
            "Manter acompanhamento pela unidade de origem e priorizar regulacao "
            "caso haja crescimento, sangramento ou perda ponderal."
        ),
        references="Dados ficticios para teste do fluxo TeleEstomato.",
        marked_as_suspected=marked_as_suspected,
    )

    db.add(response)
    db.commit()
    db.refresh(response)
    return response


def get_or_create_message(db, *, case: ClinicalCase, sender: User, content: str) -> CaseMessage:
    message = (
        db.query(CaseMessage)
        .filter(
            CaseMessage.case_id == case.id,
            CaseMessage.sender_id == sender.id,
            CaseMessage.content == content,
        )
        .first()
    )

    if message:
        return message

    message = CaseMessage(
        case_id=case.id,
        sender_id=sender.id,
        message_type=MessageType.TEXT,
        content=content,
    )

    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def get_or_create_pathology_report(
    db,
    *,
    case: ClinicalCase,
    pathologist: User,
    malignant_neoplasm: bool,
) -> PathologyReport:
    report = (
        db.query(PathologyReport)
        .filter(PathologyReport.case_id == case.id)
        .first()
    )

    if report:
        return report

    report = PathologyReport(
        case_id=case.id,
        pathologist_id=pathologist.id,
        diagnosis=(
            "Laudo anatomopatologico ficticio para teste: fragmento de mucosa "
            "oral com alteracoes epiteliais a correlacionar clinicamente."
        ),
        malignant_neoplasm=malignant_neoplasm,
    )

    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def get_or_create_followup(db, *, case: ClinicalCase, regulator: User) -> RegulatorFollowUp:
    followup = (
        db.query(RegulatorFollowUp)
        .filter(
            RegulatorFollowUp.case_id == case.id,
            RegulatorFollowUp.regulator_id == regulator.id,
        )
        .first()
    )

    if followup:
        return followup

    followup = RegulatorFollowUp(
        case_id=case.id,
        regulator_id=regulator.id,
        microscopic_report_date=date(2026, 5, 10),
        head_neck_or_oncology_visit_date=date(2026, 5, 20),
        treatment_start_date=date(2026, 6, 1),
        followup_1m_date=date(2026, 7, 1),
        followup_3m_date=date(2026, 9, 1),
        followup_6m_date=date(2026, 12, 1),
        followup_12m_date=date(2027, 6, 1),
        followup_1m_actions=["Contato telefonico", "Confirmacao de consulta"],
        followup_3m_actions=["Reavaliacao clinica"],
        followup_6m_actions=["Monitoramento de tratamento"],
        followup_12m_actions=["Encerramento ou manutencao do seguimento"],
        followup_1m_barriers=["Transporte"],
        followup_3m_barriers=[],
        followup_6m_barriers=[],
        followup_12m_barriers=[],
        treatments_done="Paciente ficticio encaminhado para rede especializada.",
        clinical_status="Em acompanhamento",
        notes="Registro de seguimento gerado pelo seed de demonstracao.",
    )

    db.add(followup)
    db.commit()
    db.refresh(followup)
    return followup


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        professional = get_or_create_user(
            db,
            email="profissional@teleestomato.local",
            full_name="Profissional Teste",
            role=UserRole.PROFESSIONAL,
            age=34,
            sex="Feminino",
            municipality="Joao Pessoa",
            state="PB",
            address="Endereco ficticio",
            health_unit="UBS Modelo",
            specialty="Cirurgiao Dentista",
            professional_council="CRO-PB 00000",
            academic_background="Odontologia",
        )
        teleconsultor = get_or_create_user(
            db,
            email="teleconsultor@teleestomato.local",
            full_name="Teleconsultor Teste",
            role=UserRole.TELECONSULTOR,
            municipality="Joao Pessoa",
            state="PB",
            specialty="Estomatologia",
            professional_council="CRO-PB 11111",
            academic_background="Especialista em Estomatologia",
        )
        pathologist = get_or_create_user(
            db,
            email="patologista@teleestomato.local",
            full_name="Patologista Teste",
            role=UserRole.PATOLOGISTA,
            municipality="Joao Pessoa",
            state="PB",
            specialty="Patologia Oral e Maxilofacial",
            professional_council="CRO-PB 22222",
            academic_background="Patologia Oral",
        )
        regulator = get_or_create_user(
            db,
            email="telerregulador@teleestomato.local",
            full_name="Telerregulador Teste",
            role=UserRole.TELERREGULADOR,
            municipality="Joao Pessoa",
            state="PB",
            specialty="Regulacao em Saude",
            professional_council="CRO-PB 33333",
            academic_background="Saude Coletiva",
        )
        admin = get_or_create_user(
            db,
            email="admin@teleestomato.local",
            full_name="Administrador Teste",
            role=UserRole.ADMIN,
            municipality="Joao Pessoa",
            state="PB",
        )

        draft_case = get_or_create_case(
            db,
            patient_name="Paciente Ficticio Rascunho",
            professional=professional,
            patient_age=42,
            patient_sex="Feminino",
            race_color="Parda",
            schooling="Ensino medio completo",
            health_unit="UBS Modelo",
            municipality="Joao Pessoa",
            state="PB",
            chief_complaint="Ardencia em mucosa jugal ha 2 semanas.",
            lesion_description="Area eritematosa discreta em mucosa jugal.",
            diagnostic_hypothesis="Lesao inflamatoria inespecifica.",
            objectives=["Necessidade de orientacao para o diagnostico"],
            anatomical_locations=["Mucosa jugal"],
            fundamental_lesions=["Mancha"],
            image_quality=["Boa"],
            care_units=["Unidade Basica de Saude (UBS)"],
            status=CaseStatus.DRAFT,
            is_suspected=False,
            sent_to_regulator=False,
        )

        assigned_case = get_or_create_case(
            db,
            patient_name="Paciente Ficticio Atribuido",
            professional=professional,
            assigned_teleconsultor_id=teleconsultor.id,
            patient_age=58,
            patient_sex="Masculino",
            race_color="Branca",
            schooling="Ensino fundamental completo",
            health_unit="UBS Centro",
            municipality="Campina Grande",
            state="PB",
            chief_complaint="Ulcera dolorosa em borda lateral de lingua.",
            history_present_illness="Evolucao aproximada de 30 dias.",
            medical_history="Hipertensao arterial sistemica controlada.",
            lesion_description="Ulcera em borda lateral de lingua, cerca de 1,2 cm.",
            diagnostic_hypothesis="Ulcera traumatica; investigar neoplasia.",
            objectives=[
                "Necessidade de orientacao para o diagnostico",
                "Necessidade de orientacao para encaminhamento",
            ],
            anatomical_locations=["Lingua"],
            fundamental_lesions=["Ulceracao"],
            habits_and_addictions=["Tabagismo"],
            lesion_sides=["Direita"],
            lesion_colors=["Vermelha"],
            lesion_sizes=["1cm ou mais"],
            lesion_symptomatologies=["Sim"],
            image_quality=["Regular"],
            care_units=["Unidade Basica de Saude (UBS)"],
            status=CaseStatus.ASSIGNED,
            is_suspected=False,
            sent_to_regulator=False,
        )

        suspected_case = get_or_create_case(
            db,
            patient_name="Paciente Ficticio Suspeito",
            professional=professional,
            assigned_teleconsultor_id=teleconsultor.id,
            patient_age=67,
            patient_sex="Masculino",
            race_color="Parda",
            schooling="Ensino fundamental incompleto",
            health_unit="UBS Litoral",
            municipality="Cabedelo",
            state="PB",
            chief_complaint="Ferida em assoalho bucal sem cicatrizacao.",
            history_present_illness="Lesao com evolucao superior a 45 dias.",
            medical_history="Ex-tabagista e etilista.",
            lesion_description="Ulcera endurecida em assoalho bucal.",
            diagnostic_hypothesis="Lesao suspeita para neoplasia maligna.",
            objectives=["Necessidade de orientacao para encaminhamento"],
            anatomical_locations=["Assoalho"],
            fundamental_lesions=["Ulceracao"],
            habits_and_addictions=["Ex-tabagista", "Ex-etilista"],
            lesion_sides=["Nao se aplica"],
            lesion_colors=["Vermelha"],
            lesion_consistencies=["Petrea"],
            lesion_symptomatologies=["Sim"],
            pre_existing_conditions=["Hipertensao"],
            image_quality=["Boa"],
            care_units=["Centro de Especialidade Odontologica (CEO)"],
            status=CaseStatus.SUSPECTED,
            is_suspected=True,
            sent_to_regulator=True,
        )

        followup_case = get_or_create_case(
            db,
            patient_name="Paciente Ficticio Seguimento",
            professional=professional,
            assigned_teleconsultor_id=teleconsultor.id,
            patient_age=61,
            patient_sex="Feminino",
            race_color="Preta",
            schooling="Ensino medio incompleto",
            health_unit="UBS Norte",
            municipality="Santa Rita",
            state="PB",
            chief_complaint="Acompanhamento apos biopsia incisional.",
            lesion_description="Placa eritroleucoplasica em rebordo alveolar.",
            diagnostic_hypothesis="Lesao potencialmente maligna.",
            objectives=["Necessidade de orientacao para o tratamento"],
            anatomical_locations=["Rebordo alveolar"],
            fundamental_lesions=["Placa"],
            lesion_colors=["Branca", "Vermelha"],
            image_quality=["Boa"],
            care_units=["Centro de Especialidade Odontologica (CEO)"],
            status=CaseStatus.IN_FOLLOWUP,
            is_suspected=True,
            sent_to_regulator=True,
        )

        get_or_create_response(db, case=assigned_case, teleconsultor=teleconsultor)
        get_or_create_response(
            db,
            case=suspected_case,
            teleconsultor=teleconsultor,
            marked_as_suspected=True,
        )
        get_or_create_response(
            db,
            case=followup_case,
            teleconsultor=teleconsultor,
            marked_as_suspected=True,
        )
        get_or_create_pathology_report(
            db,
            case=followup_case,
            pathologist=pathologist,
            malignant_neoplasm=True,
        )
        get_or_create_followup(db, case=followup_case, regulator=regulator)

        get_or_create_message(
            db,
            case=assigned_case,
            sender=professional,
            content="Mensagem ficticia: seguem informacoes complementares do caso.",
        )
        get_or_create_message(
            db,
            case=assigned_case,
            sender=teleconsultor,
            content="Mensagem ficticia: orientar retorno se houver piora clinica.",
        )
        get_or_create_message(
            db,
            case=draft_case,
            sender=admin,
            content="Mensagem ficticia administrativa para teste interno.",
        )

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
    print("Seed concluido com sucesso.")
    print("")
    print("Contas de teste:")
    print(f"- profissional@teleestomato.local / {SEED_PASSWORD}")
    print(f"- teleconsultor@teleestomato.local / {SEED_PASSWORD}")
    print(f"- patologista@teleestomato.local / {SEED_PASSWORD}")
    print(f"- telerregulador@teleestomato.local / {SEED_PASSWORD}")
    print(f"- admin@teleestomato.local / {SEED_PASSWORD}")
