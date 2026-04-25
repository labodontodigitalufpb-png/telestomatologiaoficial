import React, { useEffect, useMemo, useState } from "react";
import { getCurrentUserRole, login, logout } from "./services/auth";
import { registerUser } from "./services/users";
import {
  createCase,
  getCaseDetail,
  listMyCases,
  submitCase,
  uploadCaseMedia,
} from "./services/cases";
import { listTeleconsultorCases, respondCase } from "./services/teleconsultor";
import {
  createFollowup,
  listFollowups,
  listRegulatorCases,
  updateFollowup,
} from "./services/telerregulador";
import {
  getPathologistCaseDetail,
  listPathologistCases,
  upsertPathologyReport,
} from "./services/patologista";
import { listMessages, sendTextMessage, uploadChatFile } from "./services/chat";
import {
  getCasesByState,
  getDashboardSummary,
  getFollowupByState,
  getResponseTime,
  getSuspectedByState,
} from "./services/dashboard";

type Screen =
  | "login"
  | "cadastro"
  | "profissional"
  | "teleconsultor"
  | "patologista"
  | "telerregulador"
  | "dashboard";

type MessageState = {
  type: "success" | "error" | "";
  text: string;
};

const initialRegister = {
  full_name: "",
  email: "",
  password: "",
  role: "PROFESSIONAL",
  age: "",
  sex: "",
  race_color: "",
  schooling: "",
  patient_phone: "",
  sus_card: "",
  municipality: "",
  state: "",
  address: "",
  health_unit: "",
  specialty: [] as string[],
  professional_council: [] as string[],
  academic_background: "",
};

const initialCase = {
  patient_name: "",
  patient_age: "",
  patient_sex: "",
  race_color: "",
  schooling: "",
  patient_phone: "",
  sus_card: "",
  health_unit: "",
  municipality: "",
  state: "",
  chief_complaint: "",
  history_present_illness: "",
  medical_history: "",
  dental_history: "",
  medications: "",
  extraoral_exam: "",
  lymphadenopathy: "",
  lesion_description: "",
  diagnostic_hypothesis: "",
  objectives: [] as string[],
  anatomical_locations: [] as string[],
  fundamental_lesions: [] as string[],
  habits_and_addictions: [] as string[],
  lesion_sides: [] as string[],
  lesion_colors: [] as string[],
  lesion_insertions: [] as string[],
  lesion_sizes: [] as string[],
  lesion_surfaces: [] as string[],
  lesion_consistencies: [] as string[],
  lesion_symptomatologies: [] as string[],
  pre_existing_conditions: [] as string[],
  image_quality: [] as string[],
  care_units: [] as string[],
};

const specialtyOptions = [
  "Acupuntura",
  "Cirurgia e Traumatologia",
  "Dentística",
  "Disfunção Temporomandibular",
  "Endodontia",
  "Estomatologia",
  "Harmonização Orofacial",
  "Homeopatia",
  "Implantodontia",
  "Odontogeriatria",
  "Odontologia do Esporte",
  "Odontologia do Trabalho",
  "Odontologia Hospitalar",
  "Odontologia Legal",
  "Odontologia para Pacientes com Necessidades Especiais",
  "Odontopediatria",
  "Ortodontia",
  "Ortopedia Funcional dos Maxilares",
  "Patologia Oral e Maxilofacial",
  "Periodontia",
  "Outras especialidades odontológicas",
  "Médico Clínico Geral",
  "Cirurgião de Cabeça e Pescoço",
  "Outras especialidades médicas",
];

const professionalCouncilOptions = ["TSB", "ACD", "Enfermeiro", "Médico", "Cirurgião Dentista"];

const assetPath = (filename: string) => `${import.meta.env.BASE_URL}${filename}`;

const valuationOptions = {
  objectives: [
    "Necessidade de orientação para o diagnóstico",
    "Necessidade de orientação para o tratamento",
    "Necessidade de orientação para encaminhamento",
  ],
  anatomical_locations: [
    "Assoalho",
    "Extra-oral",
    "Intra-óssea",
    "Lábios",
    "Língua",
    "Mucosa jugal",
    "Palato",
    "Rebordo alveolar",
    "Não se aplica",
    "Outros",
  ],
  fundamental_lesions: [
    "Mancha",
    "Placa",
    "Erosão",
    "Ulceração",
    "Vesícula",
    "Bolha",
    "Pápula",
    "Nódulo",
    "Tumor",
    "Fístula",
    "Não sei",
  ],
  habits_and_addictions: ["Tabagismo", "Etilismo", "Ex-etilista", "Ex-tabagista", "Uso de drogas ilícitas", "Nenhum relato", "Outros"],
  lesion_sides: ["Esquerda", "Direita", "Bilateral", "Não se aplica"],
  lesion_colors: ["Branca", "Vermelha", "Amarela", "Azulada", "Sem alteração", "Outra"],
  lesion_insertions: ["Séssil", "Pediculada", "Não se aplica"],
  lesion_sizes: ["Menor que 1cm", "1cm ou mais", "Não se aplica"],
  lesion_surfaces: ["Lisa", "Rugosa", "Ulcerada", "Verrucosa", "Outra"],
  lesion_consistencies: ["Resiliente", "Fibrosa", "Pétrea", "Aspecto ósseo", "Outra"],
  lesion_symptomatologies: ["Sim", "Não", "Não sei"],
  pre_existing_conditions: [
    "Diabetes",
    "Hipertensão",
    "Doença Cardiovascular",
    "Doença óssea",
    "Doença Imune",
    "Nenhum relato",
    "Outras",
  ],
  image_quality: ["Boa", "Regular", "Ruim", "Não se aplica"],
  care_units: [
    "Centro de Especialidade Odontológica (CEO)",
    "Unidade Básica de Saúde (UBS)",
    "Unidade de Pronto Atendimento (UPA)",
    "Instituição de Ensino Superior (IES)",
    "Distrito Sanitário Especial Indígena (DSEI)",
    "Hospital",
    "Outra",
  ],
};

const initialResponse = {
  clinical_description: "",
  justified_hypotheses: "",
  conduct: "",
  care_coordination: "",
  references: "",
  marked_as_suspected: false,
};

const initialFollowup = {
  microscopic_report_date: "",
  head_neck_or_oncology_visit_date: "",
  treatment_start_date: "",
  followup_1m_date: "",
  followup_3m_date: "",
  followup_6m_date: "",
  followup_12m_date: "",
  followup_1m_actions: [] as string[],
  followup_3m_actions: [] as string[],
  followup_6m_actions: [] as string[],
  followup_12m_actions: [] as string[],
  followup_1m_barriers: [] as string[],
  followup_3m_barriers: [] as string[],
  followup_6m_barriers: [] as string[],
  followup_12m_barriers: [] as string[],
  treatments_done: "",
  clinical_status: "",
  notes: "",
};

const followupActionOptions = [
  "Consulta com oncologista/cabeça e pescoço",
  "Cirurgia realizada",
  "Realização do tratamento radioterápico",
  "Conclusão do tratamento radioterápico",
  "Realização de quimioterapia",
  "Conclusão da quimioterapia",
  "Realização de imunoterapia",
  "Conclusão da imunoterapia",
  "Óbito",
  "Abandono",
  "Tratamentos não convencionais",
  "Acompanhamento pós-tratamento",
];

const followupBarrierOptions = [
  "Está indo tudo bem",
  "Não consegue agendar",
  "Tem medo do tratamento",
  "Não tem dinheiro para viajar para tratar",
  "Não consegue agendar consulta",
  "Não tem radioterapia onde moro",
  "Está demorando para começar o tratamento",
  "Não tem o tratamento proposto",
  "Óbito",
  "Abandono",
  "Custo elevado dos medicamentos",
  "Questões familiares",
  "Outra dificuldade",
];

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
      />
    </div>
  );
}

function CheckboxGroup({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: string[];
  values: string[];
  onChange: (value: string[]) => void;
}) {
  function toggleOption(option: string) {
    onChange(
      values.includes(option)
        ? values.filter((item) => item !== option)
        : [...values, option]
    );
  }

  return (
    <fieldset className="space-y-2 rounded-xl border border-slate-200 p-3">
      <legend className="px-1 text-sm font-medium text-slate-700">{label}</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option) => (
          <label key={option} className="flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={values.includes(option)}
              onChange={() => toggleOption(option)}
              className="mt-1"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function caseIdentifier(item: any) {
  const userName = item.professional_name || `Usuário ${item.professional_id}`;
  const state = item.state || "Estado não informado";
  return `Caso #${item.id} - ${userName} - ${state}`;
}

function displayValue(value: any) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Não informado";
  if (value === true) return "Sim";
  if (value === false) return "Não";
  return value || "Não informado";
}

function DetailField({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{displayValue(value)}</div>
    </div>
  );
}

function ProfessionalCaseDetail({ detail }: { detail: any }) {
  const item = detail?.case || {};
  const response = detail?.response;
  const report = detail?.pathology_report;
  const followups = detail?.followups || [];
  const media = detail?.media || [];

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900">{caseIdentifier(item)}</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <DetailField label="Paciente" value={item.patient_name} />
          <DetailField label="Status" value={item.status} />
          <DetailField label="Objetivo" value={item.objectives} />
          <DetailField label="Hipóteses diagnósticas" value={item.diagnostic_hypothesis} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900">Resposta do teleconsultor</h3>
        {response ? (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <DetailField label="Descrição clínica" value={response.clinical_description} />
            <DetailField label="Hipóteses justificadas" value={response.justified_hypotheses} />
            <DetailField label="Conduta" value={response.conduct} />
            <DetailField label="Coordenação do cuidado" value={response.care_coordination} />
            <DetailField label="Referências" value={response.references} />
            <DetailField label="Marcado como suspeito" value={response.marked_as_suspected} />
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">Ainda não há resposta registrada.</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900">Laudo do patologista</h3>
        {report ? (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <DetailField label="Diagnóstico / laudo" value={report.diagnosis} />
            <DetailField label="Data" value={report.updated_at || report.created_at} />
            {report.report_file_path && (
              <a className="text-sm font-medium text-blue-700 underline" href={report.report_file_path} target="_blank" rel="noreferrer">
                {report.report_original_filename || "Abrir arquivo do laudo"}
              </a>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">Ainda não há laudo registrado.</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900">Acompanhamento do telerregulador</h3>
        {followups.length ? (
          <div className="mt-3 space-y-3">
            {followups.map((followup: any) => (
              <div key={followup.id} className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-slate-200 p-3">
                <DetailField label="Data do laudo microscópico" value={followup.microscopic_report_date} />
                <DetailField label="Consulta cabeça e pescoço/oncologia" value={followup.head_neck_or_oncology_visit_date} />
                <DetailField label="Início do tratamento" value={followup.treatment_start_date} />
                <DetailField label="Seguimento 3 meses" value={followup.followup_3m_date} />
                <DetailField label="Seguimento 6 meses" value={followup.followup_6m_date} />
                <DetailField label="Tratamentos realizados" value={followup.treatments_done} />
                <DetailField label="Estado clínico" value={followup.clinical_status} />
                <DetailField label="Observações" value={followup.notes} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">Ainda não há acompanhamento registrado.</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900">Arquivos do caso</h3>
        {media.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {media.map((file: any) => (
              <a key={file.id} href={file.file_path} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-blue-700 underline">
                {file.media_type} #{file.id}
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">Nenhum arquivo registrado.</p>
        )}
      </div>
    </div>
  );
}

function FollowupList({ items }: { items: any[] }) {
  return (
    <div className="space-y-3">
      {items.map((followup) => (
        <div key={followup.id} className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-xl border border-slate-200 p-4">
          <DetailField label="Data do laudo microscópico" value={followup.microscopic_report_date} />
          <DetailField label="Consulta cabeça e pescoço/oncologia" value={followup.head_neck_or_oncology_visit_date} />
          <DetailField label="Início do tratamento" value={followup.treatment_start_date} />
          <DetailField label="Acompanhamento 1 mês" value={followup.followup_1m_date} />
          <DetailField label="Eventos 1 mês" value={followup.followup_1m_actions} />
          <DetailField label="Barreiras 1 mês" value={followup.followup_1m_barriers} />
          <DetailField label="Acompanhamento 3 meses" value={followup.followup_3m_date} />
          <DetailField label="Eventos 3 meses" value={followup.followup_3m_actions} />
          <DetailField label="Barreiras 3 meses" value={followup.followup_3m_barriers} />
          <DetailField label="Acompanhamento 6 meses" value={followup.followup_6m_date} />
          <DetailField label="Eventos 6 meses" value={followup.followup_6m_actions} />
          <DetailField label="Barreiras 6 meses" value={followup.followup_6m_barriers} />
          <DetailField label="Acompanhamento 12 meses" value={followup.followup_12m_date} />
          <DetailField label="Eventos 12 meses" value={followup.followup_12m_actions} />
          <DetailField label="Barreiras 12 meses" value={followup.followup_12m_barriers} />
          <DetailField label="Tratamentos realizados" value={followup.treatments_done} />
          <DetailField label="Situação clínica" value={followup.clinical_status} />
          <DetailField label="Observações" value={followup.notes} />
        </div>
      ))}
    </div>
  );
}

function CaseReportView({ detail }: { detail: any }) {
  const item = detail?.case || detail || {};
  const media = detail?.media || [];

  return (
    <div className="mt-4 rounded-xl border border-slate-200 p-4">
      <h3 className="font-semibold text-slate-900">Relato de caso completo</h3>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <DetailField label="Identificação" value={caseIdentifier(item)} />
        <DetailField label="Data de registro" value={item.created_at} />
        <DetailField label="Paciente" value={item.patient_name} />
        <DetailField label="Idade" value={item.patient_age} />
        <DetailField label="Sexo" value={item.patient_sex} />
        <DetailField label="Escolaridade" value={item.schooling} />
        <DetailField label="Raça/cor" value={item.race_color} />
        <DetailField label="Cartão do SUS" value={item.sus_card} />
        <DetailField label="Telefone" value={item.patient_phone} />
        <DetailField label="Unidade" value={item.health_unit} />
        <DetailField label="Município" value={item.municipality} />
        <DetailField label="Estado" value={item.state} />
        <DetailField label="Objetivo" value={item.objectives} />
        <DetailField label="Unidade(s) de atendimento(s)" value={item.care_units} />
        <DetailField label="Dependências" value={item.habits_and_addictions} />
        <DetailField label="Queixa principal" value={item.chief_complaint} />
        <DetailField label="História da Doença Atual" value={item.history_present_illness} />
        <DetailField label="História Médica" value={item.medical_history} />
        <DetailField label="História Odontológica" value={item.dental_history} />
        <DetailField label="Exame Físico Extraoral" value={item.extraoral_exam} />
        <DetailField label="Linfoadenopatia" value={item.lymphadenopathy} />
        <DetailField label="Localização anatômica" value={item.anatomical_locations} />
        <DetailField label="Lesão fundamental" value={item.fundamental_lesions} />
        <DetailField label="Lado de acometimento" value={item.lesion_sides} />
        <DetailField label="Coloração" value={item.lesion_colors} />
        <DetailField label="Inserção" value={item.lesion_insertions} />
        <DetailField label="Tamanho" value={item.lesion_sizes} />
        <DetailField label="Superfície" value={item.lesion_surfaces} />
        <DetailField label="Consistência" value={item.lesion_consistencies} />
        <DetailField label="Sintomatologia" value={item.lesion_symptomatologies} />
        <DetailField label="Hipóteses diagnósticas" value={item.diagnostic_hypothesis} />
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-slate-800">Arquivos enviados</h4>
        {media.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {media.map((file: any) => (
              <a key={file.id} href={file.file_path} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-blue-700 underline">
                {file.media_type} #{file.id}
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">Nenhum arquivo registrado.</p>
        )}
      </div>
    </div>
  );
}

function SimpleBars({
  title,
  items,
  valueKey,
}: {
  title: string;
  items: any[];
  valueKey: string;
}) {
  const max = useMemo(() => {
    const values = items.map((item) => Number(item[valueKey] || 0));
    return values.length ? Math.max(...values) : 0;
  }, [items, valueKey]);

  return (
    <SectionCard title={title}>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-slate-600">Sem dados.</p>}
        {items.map((item, idx) => {
          const value = Number(item[valueKey] || 0);
          const pct = max > 0 ? Math.max((value / max) * 100, 6) : 0;
          const label = item.state || item.case_id || `Item ${idx + 1}`;
          return (
            <div key={`${label}-${idx}`} className="space-y-1">
              <div className="flex justify-between text-xs text-slate-700">
                <span>{label}</span>
                <span>{value}</span>
              </div>
              <div className="h-2 rounded bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function DashboardPanel({
  summary,
  casesByState,
  suspected,
  followup,
  responseTime,
  onLoad,
}: {
  summary: any;
  casesByState: any[];
  suspected: any[];
  followup: any[];
  responseTime: any[];
  onLoad: () => void;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Indicadores">
        <button onClick={onLoad} className="px-4 py-2 rounded-xl bg-slate-900 text-white">
          Carregar indicadores
        </button>
      </SectionCard>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <SectionCard title="Total de casos">
          <div className="text-3xl font-bold">{summary?.total_cases ?? "-"}</div>
        </SectionCard>
        <SectionCard title="Teleconsultorias feitas">
          <div className="text-3xl font-bold">{summary?.total_teleconsultorias ?? "-"}</div>
        </SectionCard>
        <SectionCard title="Casos suspeitos">
          <div className="text-3xl font-bold">{summary?.total_suspected_cases ?? "-"}</div>
        </SectionCard>
        <SectionCard title="Casos em acompanhamento">
          <div className="text-3xl font-bold">{summary?.total_followups ?? "-"}</div>
        </SectionCard>
        <SectionCard title="Estados ativos">
          <div className="text-3xl font-bold">{summary?.states_active ?? "-"}</div>
        </SectionCard>
        <SectionCard title="Tempo médio de resposta (dias)">
          <div className="text-3xl font-bold">{summary?.avg_response_days ?? "-"}</div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SimpleBars title="Casos por estado" items={casesByState} valueKey="total" />
        <SimpleBars title="Lesões suspeitas por estado" items={suspected} valueKey="total" />
        <SimpleBars title="Casos acompanhados por telerreguladores" items={followup} valueKey="total" />
        <SimpleBars title="Tempo de resposta por caso (dias)" items={responseTime} valueKey="response_time_days" />
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [message, setMessage] = useState<MessageState>({ type: "", text: "" });

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [caseForm, setCaseForm] = useState(initialCase);
  const [teleResponseForm, setTeleResponseForm] = useState(initialResponse);
  const [followupForm, setFollowupForm] = useState(initialFollowup);

  const [myCases, setMyCases] = useState<any[]>([]);
  const [teleCases, setTeleCases] = useState<any[]>([]);
  const [pathologistCases, setPathologistCases] = useState<any[]>([]);
  const [regulatorCases, setRegulatorCases] = useState<any[]>([]);

  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [selectedResponseCaseId, setSelectedResponseCaseId] = useState<string>("");
  const [selectedPathologistCaseId, setSelectedPathologistCaseId] = useState<string>("");
  const [selectedFollowupCaseId, setSelectedFollowupCaseId] = useState<string>("");
  const [caseDetail, setCaseDetail] = useState<any>(null);
  const [teleCaseDetail, setTeleCaseDetail] = useState<any>(null);
  const [pathologistCaseDetail, setPathologistCaseDetail] = useState<any>(null);
  const [regulatorCaseDetail, setRegulatorCaseDetail] = useState<any>(null);
  const [followups, setFollowups] = useState<any[]>([]);
  const [followupIdToEdit, setFollowupIdToEdit] = useState<string>("");

  const [pathologyDiagnosis, setPathologyDiagnosis] = useState("");
  const [pathologyMalignantNeoplasm, setPathologyMalignantNeoplasm] = useState(false);
  const [pathologyFile, setPathologyFile] = useState<File | null>(null);

  const [caseFiles, setCaseFiles] = useState<{
    attachment1: File | null;
    attachment2: File | null;
    attachment3: File | null;
    attachment4: File | null;
    consent: File | null;
  }>({
    attachment1: null,
    attachment2: null,
    attachment3: null,
    attachment4: null,
    consent: null,
  });

  const [chatCaseId, setChatCaseId] = useState("");
  const [chatText, setChatText] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatFileType, setChatFileType] = useState("IMAGE");
  const [chatFile, setChatFile] = useState<File | null>(null);

  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [dashboardCasesByState, setDashboardCasesByState] = useState<any[]>([]);
  const [dashboardSuspected, setDashboardSuspected] = useState<any[]>([]);
  const [dashboardFollowup, setDashboardFollowup] = useState<any[]>([]);
  const [dashboardResponseTime, setDashboardResponseTime] = useState<any[]>([]);

  function showSuccess(text: string) {
    setMessage({ type: "success", text });
  }

  function showError(text: string) {
    setMessage({ type: "error", text });
  }

  function clearMessage() {
    setMessage({ type: "", text: "" });
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    clearMessage();
    try {
      await login(loginEmail, loginPassword);
      const role = getCurrentUserRole();
      if (role === "TELECONSULTOR") setScreen("teleconsultor");
      else if (role === "PATOLOGISTA") setScreen("patologista");
      else if (role === "TELERREGULADOR") setScreen("telerregulador");
      else setScreen("profissional");
      showSuccess("Login realizado com sucesso.");
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    clearMessage();
    if (!registerForm.password || registerForm.password.length < 6) {
      showError("Informe uma senha de acesso com pelo menos 6 caracteres.");
      return;
    }
    try {
      await registerUser({
        ...registerForm,
        age: registerForm.age ? Number(registerForm.age) : null,
        specialty: registerForm.specialty.join(", "),
        professional_council: registerForm.professional_council.join(", "),
      });
      showSuccess("Usuário cadastrado com sucesso.");
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleCreateCase(e: React.FormEvent) {
    e.preventDefault();
    clearMessage();
    try {
      const createdCase = await createCase({
        ...caseForm,
        patient_age: caseForm.patient_age ? Number(caseForm.patient_age) : null,
      });

      const pendingUploads: Array<{ file: File | null; mediaType: string }> = [
        { file: caseFiles.attachment1, mediaType: "IMAGE" },
        { file: caseFiles.attachment2, mediaType: "IMAGE" },
        { file: caseFiles.attachment3, mediaType: "EXAM" },
        { file: caseFiles.attachment4, mediaType: "EXAM" },
        { file: caseFiles.consent, mediaType: "CONSENT" },
      ];

      let uploadedCount = 0;
      for (const item of pendingUploads) {
        if (item.file) {
          await uploadCaseMedia(createdCase.id, item.mediaType, item.file);
          uploadedCount += 1;
        }
      }

      setCaseForm(initialCase);
      setCaseFiles({
        attachment1: null,
        attachment2: null,
        attachment3: null,
        attachment4: null,
        consent: null,
      });

      showSuccess(
        uploadedCount > 0
          ? `Caso criado e ${uploadedCount} arquivo(s) enviado(s) com sucesso.`
          : "Caso criado com sucesso."
      );
      await handleLoadMyCases();
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleLoadMyCases() {
    clearMessage();
    try {
      const data = await listMyCases();
      setMyCases(data);
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleSubmitCase(caseId: number) {
    clearMessage();
    try {
      await submitCase(caseId);
      showSuccess("Caso submetido com sucesso.");
      await handleLoadMyCases();
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleLoadCaseDetail() {
    if (!selectedCaseId) return;
    clearMessage();
    try {
      const data = await getCaseDetail(Number(selectedCaseId));
      setCaseDetail(data);
      showSuccess("Detalhe do caso carregado.");
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleLoadTeleCases() {
    clearMessage();
    try {
      const data = await listTeleconsultorCases();
      setTeleCases(data);
    } catch (error: any) {
      setTeleCases([]);
      showError(error.message);
    }
  }

  async function handleSelectTeleCase(caseId: number) {
    clearMessage();
    try {
      const data = await getCaseDetail(caseId);
      setSelectedResponseCaseId(String(caseId));
      setTeleCaseDetail(data);
      showSuccess("Relato de caso carregado para parecer.");
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleRespondCase(e: React.FormEvent) {
    e.preventDefault();
    clearMessage();
    try {
      await respondCase(Number(selectedResponseCaseId), teleResponseForm);
      showSuccess("Resposta do teleconsultor registrada com sucesso.");
      setTeleResponseForm(initialResponse);
      await handleLoadTeleCases();
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleLoadPathologistCases() {
    clearMessage();
    try {
      const data = await listPathologistCases();
      setPathologistCases(data);
    } catch (error: any) {
      setPathologistCases([]);
      showError(error.message);
    }
  }

  async function handleLoadPathologistCaseDetail() {
    if (!selectedPathologistCaseId) return;
    clearMessage();
    try {
      const data = await getPathologistCaseDetail(Number(selectedPathologistCaseId));
      setPathologistCaseDetail(data);
      setPathologyMalignantNeoplasm(Boolean(data?.pathology_report?.malignant_neoplasm));
      showSuccess("Detalhe do caso carregado para o patologista.");
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleSavePathologyReport(e: React.FormEvent) {
    e.preventDefault();
    clearMessage();
    if (!selectedPathologistCaseId) {
      showError("Informe o ID do caso para salvar o laudo.");
      return;
    }

    try {
      await upsertPathologyReport(
        Number(selectedPathologistCaseId),
        pathologyDiagnosis,
        pathologyFile,
        pathologyMalignantNeoplasm
      );
      showSuccess("Laudo patológico salvo com sucesso.");
      await handleLoadPathologistCaseDetail();
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleLoadRegulatorCases() {
    clearMessage();
    try {
      const data = await listRegulatorCases();
      setRegulatorCases(data);
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleSelectRegulatorCase(caseId: number) {
    clearMessage();
    try {
      const data = await getCaseDetail(caseId);
      setSelectedFollowupCaseId(String(caseId));
      setRegulatorCaseDetail(data);
      showSuccess("Relato de caso carregado para acompanhamento.");
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleCreateFollowup(e?: any) {
    e?.preventDefault?.();
    clearMessage();
    try {
      await createFollowup(Number(selectedFollowupCaseId), followupForm);
      showSuccess("Seguimento criado com sucesso.");
      setFollowupForm(initialFollowup);
      await handleLoadFollowups();
      await handleLoadRegulatorCases();
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleLoadFollowups() {
    if (!selectedFollowupCaseId) return;
    clearMessage();
    try {
      const data = await listFollowups(Number(selectedFollowupCaseId));
      setFollowups(data);
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleUpdateFollowup(e?: any) {
    e?.preventDefault?.();
    clearMessage();
    try {
      await updateFollowup(Number(followupIdToEdit), followupForm);
      showSuccess("Seguimento atualizado com sucesso.");
      await handleLoadFollowups();
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleLoadChat() {
    if (!chatCaseId) return;
    clearMessage();
    try {
      const data = await listMessages(Number(chatCaseId));
      setChatMessages(data);
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleSendTextMessage(e: React.FormEvent) {
    e.preventDefault();
    clearMessage();
    try {
      await sendTextMessage(Number(chatCaseId), chatText);
      setChatText("");
      await handleLoadChat();
      showSuccess("Mensagem enviada com sucesso.");
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleUploadChatFile(e: React.FormEvent) {
    e.preventDefault();
    clearMessage();
    if (!chatFile) {
      showError("Selecione um arquivo para enviar no chat.");
      return;
    }

    try {
      await uploadChatFile(Number(chatCaseId), chatFileType, chatFile, "");
      setChatFile(null);
      await handleLoadChat();
      showSuccess("Arquivo enviado no chat com sucesso.");
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleLoadDashboard() {
    clearMessage();
    try {
      const [summary, byState, suspected, followup, responseTime] = await Promise.all([
        getDashboardSummary(),
        getCasesByState(),
        getSuspectedByState(),
        getFollowupByState(),
        getResponseTime(),
      ]);

      setDashboardSummary(summary);
      setDashboardCasesByState(byState);
      setDashboardSuspected(suspected);
      setDashboardFollowup(followup);
      setDashboardResponseTime(responseTime);
      showSuccess("Dashboard atualizado com sucesso.");
    } catch (error: any) {
      showError(error.message);
    }
  }

  useEffect(() => {
    setCaseDetail(null);
  }, [selectedCaseId]);

  useEffect(() => {
    setPathologistCaseDetail(null);
  }, [selectedPathologistCaseId]);

  const showCaseChat =
    screen === "profissional" ||
    screen === "teleconsultor" ||
    screen === "patologista" ||
    screen === "telerregulador";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Telestomatologia no SUS</h1>
            <p className="text-sm text-slate-600">
              Prática de apoio para envio e teleconsultoria de casos de doenças da boca.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setScreen("login")} className="px-4 py-2 rounded-xl bg-slate-900 text-white">
              Inicial / Login
            </button>
            <button onClick={() => setScreen("cadastro")} className="px-4 py-2 rounded-xl border border-slate-300">
              Cadastro
            </button>
            <button onClick={() => setScreen("profissional")} className="px-4 py-2 rounded-xl border border-slate-300">
              Profissional
            </button>
            <button onClick={() => setScreen("teleconsultor")} className="px-4 py-2 rounded-xl border border-slate-300">
              Teleconsultor
            </button>
            <button onClick={() => setScreen("patologista")} className="px-4 py-2 rounded-xl border border-slate-300">
              Patologista
            </button>
            <button onClick={() => setScreen("telerregulador")} className="px-4 py-2 rounded-xl border border-slate-300">
              Telerregulador
            </button>
            <button onClick={() => setScreen("dashboard")} className="px-4 py-2 rounded-xl border border-slate-300">
              Dashboard
            </button>
            <button
              onClick={() => {
                logout();
                setScreen("login");
                showSuccess("Logout realizado.");
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white"
            >
              Sair
            </button>
          </div>
        </div>

        {message.text && (
          <div
            className={`rounded-2xl p-4 text-sm ${
              message.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {screen === "login" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <img
                      src={assetPath("logo-teleestomatologia.jpg")}
                      alt="Telestomatologia"
                      className="w-full aspect-square object-cover rounded-xl border border-slate-200"
                    />
                    <img
                      src={assetPath("labodigit.jpeg")}
                      alt="LABODIGIT - Laboratório de Odontologia Digital"
                      className="w-full aspect-square object-cover rounded-xl border border-slate-200"
                    />
                  </div>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                    <img
                      src={assetPath("brasil-sorridente-logo.jpg")}
                      alt="Brasil Sorridente - Saúde Bucal no SUS"
                      className="mx-auto max-h-28 w-full object-contain"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SectionCard title="Prática de Auxílio">
                    <p className="text-sm text-slate-700">
                      Prática de auxílio para profissionais da Atenção Básica enviarem casos
                      de doenças de boca para avaliação em teleconsultoria de Estomatologia.
                    </p>
                  </SectionCard>

                  <SectionCard title="Base Legal e Institucional">
                    <p className="text-sm text-slate-700">
                      Prática apoiada pelo Conselho Federal de Odontologia, Secretaria de
                      Saúde Digital e Ministério da Saúde.
                    </p>
                  </SectionCard>
                </div>
              </div>

              <SectionCard title="Acesso">
                <form onSubmit={handleLogin} className="space-y-3">
                  <Input label="E-mail" value={loginEmail} onChange={setLoginEmail} type="email" />
                  <Input label="Senha" value={loginPassword} onChange={setLoginPassword} type="password" />
                  <div className="flex gap-2">
                    <button type="submit" className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold">
                      Entrar
                    </button>
                    <button type="button" onClick={() => setScreen("cadastro")} className="px-5 py-3 rounded-xl border border-slate-300">
                      Cadastrar
                    </button>
                  </div>
                </form>
              </SectionCard>
            </div>

            <DashboardPanel
              summary={dashboardSummary}
              casesByState={dashboardCasesByState}
              suspected={dashboardSuspected}
              followup={dashboardFollowup}
              responseTime={dashboardResponseTime}
              onLoad={handleLoadDashboard}
            />
          </div>
        )}

        {screen === "cadastro" && (
          <SectionCard title="Cadastro Profissional">
            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Input label="Nome completo" value={registerForm.full_name} onChange={(v) => setRegisterForm({ ...registerForm, full_name: v })} />
              <Input label="E-mail" value={registerForm.email} onChange={(v) => setRegisterForm({ ...registerForm, email: v })} type="email" />
              <Input label="Senha de acesso" value={registerForm.password} onChange={(v) => setRegisterForm({ ...registerForm, password: v })} type="password" />
              <Input label="Idade" value={registerForm.age} onChange={(v) => setRegisterForm({ ...registerForm, age: v })} />
              <Input label="Sexo" value={registerForm.sex} onChange={(v) => setRegisterForm({ ...registerForm, sex: v })} />
              <Input label="Raça/cor" value={registerForm.race_color} onChange={(v) => setRegisterForm({ ...registerForm, race_color: v })} />
              <Input label="Escolaridade" value={registerForm.schooling} onChange={(v) => setRegisterForm({ ...registerForm, schooling: v })} />
              <Input label="Telefone" value={registerForm.patient_phone} onChange={(v) => setRegisterForm({ ...registerForm, patient_phone: v })} />
              <Input label="CNS" value={registerForm.sus_card} onChange={(v) => setRegisterForm({ ...registerForm, sus_card: v })} />
              <Input label="Endereço" value={registerForm.address} onChange={(v) => setRegisterForm({ ...registerForm, address: v })} />
              <Input label="Município" value={registerForm.municipality} onChange={(v) => setRegisterForm({ ...registerForm, municipality: v })} />
              <Input label="Estado" value={registerForm.state} onChange={(v) => setRegisterForm({ ...registerForm, state: v })} />
              <Input label="Unidade(s) de atendimento(s)" value={registerForm.health_unit} onChange={(v) => setRegisterForm({ ...registerForm, health_unit: v })} />
              <div className="md:col-span-2 xl:col-span-3">
                <CheckboxGroup label="Conselho profissional" options={professionalCouncilOptions} values={registerForm.professional_council} onChange={(v) => setRegisterForm({ ...registerForm, professional_council: v })} />
              </div>
              <div className="md:col-span-2 xl:col-span-3">
                <CheckboxGroup label="Especialidades" options={specialtyOptions} values={registerForm.specialty} onChange={(v) => setRegisterForm({ ...registerForm, specialty: v })} />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Perfil</label>
                <select
                  value={registerForm.role}
                  onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="PROFESSIONAL">PROFISSIONAL</option>
                  <option value="TELECONSULTOR">TELECONSULTOR</option>
                  <option value="PATOLOGISTA">PATOLOGISTA</option>
                  <option value="TELERREGULADOR">TELERREGULADOR</option>
                </select>
              </div>

              <div className="xl:col-span-3">
                <button type="submit" className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold">
                  Cadastrar
                </button>
              </div>
            </form>
          </SectionCard>
        )}

        {screen === "profissional" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SectionCard title="Relato de caso">
              <form onSubmit={handleCreateCase} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nome do paciente" value={caseForm.patient_name} onChange={(v) => setCaseForm({ ...caseForm, patient_name: v })} />
                <Input label="Idade" value={caseForm.patient_age} onChange={(v) => setCaseForm({ ...caseForm, patient_age: v })} />
                <Input label="Sexo" value={caseForm.patient_sex} onChange={(v) => setCaseForm({ ...caseForm, patient_sex: v })} />
                <Input label="Escolaridade" value={caseForm.schooling} onChange={(v) => setCaseForm({ ...caseForm, schooling: v })} />
                <Input label="Raça/cor" value={caseForm.race_color} onChange={(v) => setCaseForm({ ...caseForm, race_color: v })} />
                <Input label="Telefone" value={caseForm.patient_phone} onChange={(v) => setCaseForm({ ...caseForm, patient_phone: v })} />
                <Input label="Cartão do SUS" value={caseForm.sus_card} onChange={(v) => setCaseForm({ ...caseForm, sus_card: v })} />
                <Input label="Unidade" value={caseForm.health_unit} onChange={(v) => setCaseForm({ ...caseForm, health_unit: v })} />
                <Input label="Município" value={caseForm.municipality} onChange={(v) => setCaseForm({ ...caseForm, municipality: v })} />
                <Input label="Estado" value={caseForm.state} onChange={(v) => setCaseForm({ ...caseForm, state: v })} />

                <div className="md:col-span-2">
                  <CheckboxGroup label="Objetivo" options={valuationOptions.objectives} values={caseForm.objectives} onChange={(v) => setCaseForm({ ...caseForm, objectives: v })} />
                </div>
                <CheckboxGroup label="Unidade(s) de atendimento(s)" options={valuationOptions.care_units} values={caseForm.care_units} onChange={(v) => setCaseForm({ ...caseForm, care_units: v })} />
                <CheckboxGroup label="Dependências" options={valuationOptions.habits_and_addictions} values={caseForm.habits_and_addictions} onChange={(v) => setCaseForm({ ...caseForm, habits_and_addictions: v })} />

                <div className="md:col-span-2"><TextArea label="Queixa principal" placeholder="Descreva, com as palavras do paciente, o principal motivo da consulta e há quanto tempo ocorre." value={caseForm.chief_complaint} onChange={(v) => setCaseForm({ ...caseForm, chief_complaint: v })} /></div>
                <div className="md:col-span-2"><TextArea label="História da Doença Atual" placeholder="Informe início, evolução, dor, sangramento, crescimento, fatores associados e tratamentos já realizados." value={caseForm.history_present_illness} onChange={(v) => setCaseForm({ ...caseForm, history_present_illness: v })} /></div>
                <div className="md:col-span-2"><TextArea label="História Médica" placeholder="Registre doenças sistêmicas, alergias, cirurgias, medicações em uso e condições relevantes." value={caseForm.medical_history} onChange={(v) => setCaseForm({ ...caseForm, medical_history: v })} /></div>
                <div className="md:col-span-2"><TextArea label="História Odontológica" placeholder="Descreva histórico odontológico, tratamentos prévios, próteses, trauma local e hábitos relacionados à saúde bucal." value={caseForm.dental_history} onChange={(v) => setCaseForm({ ...caseForm, dental_history: v })} /></div>
                <div className="md:col-span-2"><TextArea label="Exame Físico Extraoral" placeholder="Descreva assimetrias, alterações faciais, edema, dor à palpação ou outras alterações extraorais." value={caseForm.extraoral_exam} onChange={(v) => setCaseForm({ ...caseForm, extraoral_exam: v })} /></div>
                <div className="md:col-span-2"><TextArea label="Linfoadenopatia" placeholder="Informe presença ou ausência de linfonodos palpáveis, localização, tamanho, consistência, mobilidade e dor." value={caseForm.lymphadenopathy} onChange={(v) => setCaseForm({ ...caseForm, lymphadenopathy: v })} /></div>
                <div className="md:col-span-2">
                  <h3 className="text-base font-semibold text-slate-900">Exame Clínico</h3>
                </div>
                <CheckboxGroup label="Localização anatômica" options={valuationOptions.anatomical_locations} values={caseForm.anatomical_locations} onChange={(v) => setCaseForm({ ...caseForm, anatomical_locations: v })} />
                <CheckboxGroup label="Lesão fundamental" options={valuationOptions.fundamental_lesions} values={caseForm.fundamental_lesions} onChange={(v) => setCaseForm({ ...caseForm, fundamental_lesions: v })} />
                <CheckboxGroup label="Lado de acometimento" options={valuationOptions.lesion_sides} values={caseForm.lesion_sides} onChange={(v) => setCaseForm({ ...caseForm, lesion_sides: v })} />
                <CheckboxGroup label="Coloração" options={valuationOptions.lesion_colors} values={caseForm.lesion_colors} onChange={(v) => setCaseForm({ ...caseForm, lesion_colors: v })} />
                <CheckboxGroup label="Inserção" options={valuationOptions.lesion_insertions} values={caseForm.lesion_insertions} onChange={(v) => setCaseForm({ ...caseForm, lesion_insertions: v })} />
                <CheckboxGroup label="Tamanho" options={valuationOptions.lesion_sizes} values={caseForm.lesion_sizes} onChange={(v) => setCaseForm({ ...caseForm, lesion_sizes: v })} />
                <CheckboxGroup label="Superfície" options={valuationOptions.lesion_surfaces} values={caseForm.lesion_surfaces} onChange={(v) => setCaseForm({ ...caseForm, lesion_surfaces: v })} />
                <CheckboxGroup label="Consistência" options={valuationOptions.lesion_consistencies} values={caseForm.lesion_consistencies} onChange={(v) => setCaseForm({ ...caseForm, lesion_consistencies: v })} />
                <CheckboxGroup label="Sintomatologia" options={valuationOptions.lesion_symptomatologies} values={caseForm.lesion_symptomatologies} onChange={(v) => setCaseForm({ ...caseForm, lesion_symptomatologies: v })} />
                <div className="md:col-span-2"><TextArea label="Hipóteses diagnósticas" placeholder="Liste as principais hipóteses diagnósticas e a justificativa clínica para cada uma." value={caseForm.diagnostic_hypothesis} onChange={(v) => setCaseForm({ ...caseForm, diagnostic_hypothesis: v })} /></div>

                <div className="md:col-span-2">
                  <h3 className="text-base font-semibold text-slate-900">Upload de imagens</h3>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Imagem 1 (foto/exame)</label>
                  <input type="file" onChange={(e) => setCaseFiles({ ...caseFiles, attachment1: e.target.files?.[0] || null })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Imagem 2 (foto/exame)</label>
                  <input type="file" onChange={(e) => setCaseFiles({ ...caseFiles, attachment2: e.target.files?.[0] || null })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Imagem 3 (foto/exame)</label>
                  <input type="file" onChange={(e) => setCaseFiles({ ...caseFiles, attachment3: e.target.files?.[0] || null })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Imagem 4 (foto/exame)</label>
                  <input type="file" onChange={(e) => setCaseFiles({ ...caseFiles, attachment4: e.target.files?.[0] || null })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-slate-700">Termo de consentimento (TCLE)</label>
                  <input type="file" onChange={(e) => setCaseFiles({ ...caseFiles, consent: e.target.files?.[0] || null })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
                </div>

                <div className="md:col-span-2">
                  <button type="submit" className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold">
                    Criar caso
                  </button>
                </div>
              </form>
            </SectionCard>

            <SectionCard title="Meus casos">
              <div className="flex gap-2 mb-4">
                <button onClick={handleLoadMyCases} className="px-4 py-2 rounded-xl bg-slate-900 text-white">
                  Atualizar lista
                </button>
              </div>

              <div className="space-y-3">
                {myCases.map((item) => (
                  <div key={item.id} className="border border-slate-200 rounded-xl p-4">
                    <div className="font-semibold">{caseIdentifier(item)}</div>
                    <div className="text-sm text-slate-600">Paciente: {item.patient_name}</div>
                    <div className="text-sm text-slate-600">Status: {item.status}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => handleSubmitCase(item.id)} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm">
                        Submeter caso
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t pt-4">
                <Input label="ID do caso para detalhe" value={selectedCaseId} onChange={setSelectedCaseId} />
                <div className="mt-3">
                  <button onClick={handleLoadCaseDetail} className="px-4 py-2 rounded-xl border border-slate-300">
                    Ver detalhe do caso
                  </button>
                </div>

                {caseDetail && (
                  <ProfessionalCaseDetail detail={caseDetail} />
                )}
              </div>
            </SectionCard>
          </div>
        )}

        {screen === "teleconsultor" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SectionCard title="Casos do teleconsultor">
              <button onClick={handleLoadTeleCases} className="px-4 py-2 rounded-xl bg-slate-900 text-white mb-4">
                Atualizar casos atribuídos
              </button>

              <div className="space-y-3">
                {teleCases.map((item) => (
                  <div key={item.id} className="border border-slate-200 rounded-xl p-4">
	                    <div className="font-semibold">{caseIdentifier(item)}</div>
	                    <div className="text-sm text-slate-600">Paciente: {item.patient_name}</div>
	                    <div className="text-sm text-slate-600">Status: {item.status}</div>
	                    <div className="text-sm text-slate-600">Hipótese: {item.diagnostic_hypothesis}</div>
	                    <button onClick={() => handleSelectTeleCase(item.id)} className="mt-3 px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm">
	                      Selecionar para parecer
	                    </button>
	                  </div>
	                ))}
	              </div>
	            </SectionCard>

	            <SectionCard title="Responder caso">
	              <form onSubmit={handleRespondCase} className="space-y-4">
	                <Input label="ID do caso" value={selectedResponseCaseId} onChange={setSelectedResponseCaseId} />
	                <button type="button" onClick={() => selectedResponseCaseId && handleSelectTeleCase(Number(selectedResponseCaseId))} className="px-4 py-2 rounded-xl border border-slate-300">
	                  Ver relato completo
	                </button>
	                {teleCaseDetail && <CaseReportView detail={teleCaseDetail} />}
	                <TextArea label="Descrição clínica" placeholder="Sintetize os achados relevantes do relato, imagens e exame clínico que sustentam sua avaliação." value={teleResponseForm.clinical_description} onChange={(v) => setTeleResponseForm({ ...teleResponseForm, clinical_description: v })} />
	                <TextArea label="Hipóteses justificadas" placeholder="Liste as hipóteses diagnósticas consideradas e explique, de forma objetiva, os critérios clínicos que favorecem ou afastam cada uma." value={teleResponseForm.justified_hypotheses} onChange={(v) => setTeleResponseForm({ ...teleResponseForm, justified_hypotheses: v })} />
	                <TextArea label="Conduta" placeholder="Oriente a conduta recomendada: manejo inicial, exames complementares, necessidade de biópsia, urgência e encaminhamentos." value={teleResponseForm.conduct} onChange={(v) => setTeleResponseForm({ ...teleResponseForm, conduct: v })} />
	                <TextArea label="Coordenação do cuidado" placeholder="Indique como a equipe deve acompanhar o caso, prazos, rede de referência, retorno e responsabilidades entre os pontos de atenção." value={teleResponseForm.care_coordination} onChange={(v) => setTeleResponseForm({ ...teleResponseForm, care_coordination: v })} />
	                <TextArea label="Referências" placeholder="Informe referências clínicas, protocolos, diretrizes ou observações técnicas que embasam o parecer." value={teleResponseForm.references} onChange={(v) => setTeleResponseForm({ ...teleResponseForm, references: v })} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={teleResponseForm.marked_as_suspected} onChange={(e) => setTeleResponseForm({ ...teleResponseForm, marked_as_suspected: e.target.checked })} />
                  Marcar como suspeito
                </label>
                <button type="submit" className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold">
                  Enviar resposta
                </button>
              </form>
            </SectionCard>
          </div>
        )}

        {screen === "patologista" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SectionCard title="Casos para patologista">
              <button onClick={handleLoadPathologistCases} className="px-4 py-2 rounded-xl bg-slate-900 text-white mb-4">
                Atualizar casos
              </button>

              <div className="space-y-3">
                {pathologistCases.map((item) => (
                  <div key={item.id} className="border border-slate-200 rounded-xl p-4">
                    <div className="font-semibold">{caseIdentifier(item)}</div>
                    <div className="text-sm text-slate-600">Paciente: {item.patient_name}</div>
                    <div className="text-sm text-slate-600">Status: {item.status}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Laudo patológico">
              <Input label="ID do caso" value={selectedPathologistCaseId} onChange={setSelectedPathologistCaseId} />
              <div className="mt-3">
                <button onClick={handleLoadPathologistCaseDetail} className="px-4 py-2 rounded-xl border border-slate-300">
                  Ver detalhe do caso
                </button>
              </div>

              <form onSubmit={handleSavePathologyReport} className="space-y-3 mt-4">
                <TextArea label="Diagnóstico / Laudo" value={pathologyDiagnosis} onChange={setPathologyDiagnosis} />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={pathologyMalignantNeoplasm}
                    onChange={(e) => setPathologyMalignantNeoplasm(e.target.checked)}
                  />
                  Neoplasia maligna
                </label>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Arquivo do laudo (opcional)</label>
                  <input type="file" onChange={(e) => setPathologyFile(e.target.files?.[0] || null)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <button type="submit" className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold">
                  Salvar laudo
                </button>
              </form>

              {pathologistCaseDetail && (
                <pre className="mt-4 bg-slate-900 text-slate-100 rounded-xl p-4 overflow-auto text-xs">
                  {JSON.stringify(pathologistCaseDetail, null, 2)}
                </pre>
              )}
            </SectionCard>
          </div>
        )}

        {screen === "telerregulador" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SectionCard title="Casos do telerregulador">
              <button onClick={handleLoadRegulatorCases} className="px-4 py-2 rounded-xl bg-slate-900 text-white mb-4">
                Atualizar casos suspeitos
              </button>

              <div className="space-y-3">
                {regulatorCases.map((item) => (
                  <div key={item.id} className="border border-slate-200 rounded-xl p-4">
                    <div className="font-semibold">{caseIdentifier(item)}</div>
                    <div className="text-sm text-slate-600">Paciente: {item.patient_name}</div>
                    <div className="text-sm text-slate-600">Status: {item.status}</div>
                    <div className="text-sm text-slate-600">Suspeito: {String(item.is_suspected)}</div>
                    <button onClick={() => handleSelectRegulatorCase(item.id)} className="mt-3 px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm">
                      Selecionar para acompanhamento
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Criar / editar seguimento">
              <form className="space-y-4">
                <Input label="ID do caso" value={selectedFollowupCaseId} onChange={setSelectedFollowupCaseId} />
                <Input label="ID do followup para editar" value={followupIdToEdit} onChange={setFollowupIdToEdit} />
                <button type="button" onClick={() => selectedFollowupCaseId && handleSelectRegulatorCase(Number(selectedFollowupCaseId))} className="px-4 py-2 rounded-xl border border-slate-300">
                  Ver relato completo
                </button>
                {regulatorCaseDetail && <CaseReportView detail={regulatorCaseDetail} />}
                <Input label="Data do laudo microscópico" value={followupForm.microscopic_report_date} onChange={(v) => setFollowupForm({ ...followupForm, microscopic_report_date: v })} type="date" />
                <Input label="Consulta cabeça e pescoço / oncologia" value={followupForm.head_neck_or_oncology_visit_date} onChange={(v) => setFollowupForm({ ...followupForm, head_neck_or_oncology_visit_date: v })} type="date" />
                <Input label="Início do tratamento" value={followupForm.treatment_start_date} onChange={(v) => setFollowupForm({ ...followupForm, treatment_start_date: v })} type="date" />
                <Input label="Acompanhamento 1 mês" value={followupForm.followup_1m_date} onChange={(v) => setFollowupForm({ ...followupForm, followup_1m_date: v })} type="date" />
                <CheckboxGroup label="Eventos do acompanhamento de 1 mês" options={followupActionOptions} values={followupForm.followup_1m_actions} onChange={(v) => setFollowupForm({ ...followupForm, followup_1m_actions: v })} />
                <CheckboxGroup label="Que barreiras enfrentou até aqui - 1 mês" options={followupBarrierOptions} values={followupForm.followup_1m_barriers} onChange={(v) => setFollowupForm({ ...followupForm, followup_1m_barriers: v })} />
                <Input label="Acompanhamento 3 meses" value={followupForm.followup_3m_date} onChange={(v) => setFollowupForm({ ...followupForm, followup_3m_date: v })} type="date" />
                <CheckboxGroup label="Eventos do acompanhamento de 3 meses" options={followupActionOptions} values={followupForm.followup_3m_actions} onChange={(v) => setFollowupForm({ ...followupForm, followup_3m_actions: v })} />
                <CheckboxGroup label="Que barreiras enfrentou até aqui - 3 meses" options={followupBarrierOptions} values={followupForm.followup_3m_barriers} onChange={(v) => setFollowupForm({ ...followupForm, followup_3m_barriers: v })} />
                <Input label="Acompanhamento 6 meses" value={followupForm.followup_6m_date} onChange={(v) => setFollowupForm({ ...followupForm, followup_6m_date: v })} type="date" />
                <CheckboxGroup label="Eventos do acompanhamento de 6 meses" options={followupActionOptions} values={followupForm.followup_6m_actions} onChange={(v) => setFollowupForm({ ...followupForm, followup_6m_actions: v })} />
                <CheckboxGroup label="Que barreiras enfrentou até aqui - 6 meses" options={followupBarrierOptions} values={followupForm.followup_6m_barriers} onChange={(v) => setFollowupForm({ ...followupForm, followup_6m_barriers: v })} />
                <Input label="Acompanhamento 12 meses" value={followupForm.followup_12m_date} onChange={(v) => setFollowupForm({ ...followupForm, followup_12m_date: v })} type="date" />
                <CheckboxGroup label="Eventos do acompanhamento de 12 meses" options={followupActionOptions} values={followupForm.followup_12m_actions} onChange={(v) => setFollowupForm({ ...followupForm, followup_12m_actions: v })} />
                <CheckboxGroup label="Que barreiras enfrentou até aqui - 12 meses" options={followupBarrierOptions} values={followupForm.followup_12m_barriers} onChange={(v) => setFollowupForm({ ...followupForm, followup_12m_barriers: v })} />
                <TextArea label="Tratamentos realizados" value={followupForm.treatments_done} onChange={(v) => setFollowupForm({ ...followupForm, treatments_done: v })} />
                <TextArea label="Situação clínica" value={followupForm.clinical_status} onChange={(v) => setFollowupForm({ ...followupForm, clinical_status: v })} />
                <TextArea label="Observações" value={followupForm.notes} onChange={(v) => setFollowupForm({ ...followupForm, notes: v })} />

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={handleLoadFollowups} className="px-4 py-2 rounded-xl border border-slate-300">
                    Ver seguimentos
                  </button>
                  <button type="button" onClick={handleCreateFollowup} className="px-4 py-2 rounded-xl bg-emerald-600 text-white">
                    Criar seguimento
                  </button>
                  <button type="button" onClick={handleUpdateFollowup} className="px-4 py-2 rounded-xl bg-blue-600 text-white">
                    Editar seguimento
                  </button>
                </div>

                {followups.length > 0 && (
                  <FollowupList items={followups} />
                )}
              </form>
            </SectionCard>
          </div>
        )}

        {screen === "dashboard" && (
          <DashboardPanel
            summary={dashboardSummary}
            casesByState={dashboardCasesByState}
            suspected={dashboardSuspected}
            followup={dashboardFollowup}
            responseTime={dashboardResponseTime}
            onLoad={handleLoadDashboard}
          />
        )}

        {showCaseChat && (
          <SectionCard title="Chat do caso">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Input label="ID do caso para chat" value={chatCaseId} onChange={setChatCaseId} />
                <button onClick={handleLoadChat} className="px-4 py-2 rounded-xl border border-slate-300">
                  Atualizar mensagens
                </button>

                <form onSubmit={handleSendTextMessage} className="space-y-2">
                  <TextArea label="Nova mensagem" value={chatText} onChange={setChatText} />
                  <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white">
                    Enviar texto
                  </button>
                </form>

                <form onSubmit={handleUploadChatFile} className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Tipo de arquivo</label>
                    <select
                      value={chatFileType}
                      onChange={(e) => setChatFileType(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="IMAGE">IMAGE</option>
                      <option value="AUDIO">AUDIO</option>
                      <option value="VIDEO">VIDEO</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Arquivo</label>
                    <input type="file" onChange={(e) => setChatFile(e.target.files?.[0] || null)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
                  </div>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white">
                    Enviar arquivo
                  </button>
                </form>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Mensagens</h3>
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 h-80 overflow-auto space-y-2">
                  {chatMessages.length === 0 && <p className="text-sm text-slate-600">Sem mensagens para este caso.</p>}
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="bg-white border border-slate-200 rounded-lg p-2 text-sm">
                      <div className="text-xs text-slate-500">
                        Tipo: {msg.message_type} | Remetente: {msg.sender_id}
                      </div>
                      {msg.content && <div className="mt-1">{msg.content}</div>}
                      {msg.file_path && <div className="mt-1 text-xs text-blue-700">Arquivo: {msg.file_path}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
