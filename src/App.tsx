import React, { useEffect, useState } from "react";
import { login, logout } from "./services/auth";
import { registerUser } from "./services/users";
import {
  createCase,
  listMyCases,
  submitCase,
  getCaseDetail,
} from "./services/cases";
import {
  listTeleconsultorCases,
  respondCase,
} from "./services/teleconsultor";
import {
  listRegulatorCases,
  createFollowup,
  listFollowups,
  updateFollowup,
} from "./services/telerregulador";

type Screen =
  | "login"
  | "cadastro"
  | "profissional"
  | "teleconsultor"
  | "telerregulador";

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
  municipality: "",
  state: "",
  address: "",
  health_unit: "",
  specialty: "",
  professional_council: "",
  academic_background: "",
};

const initialCase = {
  patient_name: "",
  patient_age: "",
  patient_sex: "",
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
  lesion_description: "",
  diagnostic_hypothesis: "",
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
  followup_3m_date: "",
  followup_6m_date: "",
  treatments_done: "",
  clinical_status: "",
  notes: "",
};

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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
      />
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
  const [regulatorCases, setRegulatorCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [selectedResponseCaseId, setSelectedResponseCaseId] = useState<string>("");
  const [selectedFollowupCaseId, setSelectedFollowupCaseId] = useState<string>("");
  const [caseDetail, setCaseDetail] = useState<any>(null);
  const [followups, setFollowups] = useState<any[]>([]);
  const [followupIdToEdit, setFollowupIdToEdit] = useState<string>("");

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
      showSuccess("Login realizado com sucesso.");
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    clearMessage();
    try {
      await registerUser({
        ...registerForm,
        age: registerForm.age ? Number(registerForm.age) : null,
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
      await createCase({
        ...caseForm,
        patient_age: caseForm.patient_age ? Number(caseForm.patient_age) : null,
      });
      showSuccess("Caso criado com sucesso.");
      setCaseForm(initialCase);
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
      showSuccess("Lista do teleconsultor carregada.");
      setTeleCases([]);
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

  async function handleLoadRegulatorCases() {
    clearMessage();
    try {
      const data = await listRegulatorCases();
      setRegulatorCases(data);
    } catch (error: any) {
      showError(error.message);
    }
  }

  async function handleCreateFollowup(e: React.FormEvent) {
    e.preventDefault();
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

  async function handleUpdateFollowup(e: React.FormEvent) {
    e.preventDefault();
    clearMessage();
    try {
      await updateFollowup(Number(followupIdToEdit), followupForm);
      showSuccess("Seguimento atualizado com sucesso.");
      await handleLoadFollowups();
    } catch (error: any) {
      showError(error.message);
    }
  }

  useEffect(() => {
    setCaseDetail(null);
  }, [selectedCaseId]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Telestomatologia no SUS</h1>
            <p className="text-sm text-slate-600">
              Integração completa entre frontend React e backend FastAPI.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setScreen("login")} className="px-4 py-2 rounded-xl bg-slate-900 text-white">
              Login
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
            <button onClick={() => setScreen("telerregulador")} className="px-4 py-2 rounded-xl border border-slate-300">
              Telerregulador
            </button>
            <button
              onClick={() => {
                logout();
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
          <SectionCard title="Login">
            <form onSubmit={handleLogin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="E-mail" value={loginEmail} onChange={setLoginEmail} type="email" />
              <Input label="Senha" value={loginPassword} onChange={setLoginPassword} type="password" />
              <div className="md:col-span-2">
                <button type="submit" className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold">
                  Entrar
                </button>
              </div>
            </form>
          </SectionCard>
        )}

        {screen === "cadastro" && (
          <SectionCard title="Cadastro de usuário">
            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Input label="Nome completo" value={registerForm.full_name} onChange={(v) => setRegisterForm({ ...registerForm, full_name: v })} />
              <Input label="E-mail" value={registerForm.email} onChange={(v) => setRegisterForm({ ...registerForm, email: v })} type="email" />
              <Input label="Senha" value={registerForm.password} onChange={(v) => setRegisterForm({ ...registerForm, password: v })} type="password" />
              <Input label="Idade" value={registerForm.age} onChange={(v) => setRegisterForm({ ...registerForm, age: v })} />
              <Input label="Sexo" value={registerForm.sex} onChange={(v) => setRegisterForm({ ...registerForm, sex: v })} />
              <Input label="Município" value={registerForm.municipality} onChange={(v) => setRegisterForm({ ...registerForm, municipality: v })} />
              <Input label="Estado" value={registerForm.state} onChange={(v) => setRegisterForm({ ...registerForm, state: v })} />
              <Input label="Endereço" value={registerForm.address} onChange={(v) => setRegisterForm({ ...registerForm, address: v })} />
              <Input label="Unidade de atendimento" value={registerForm.health_unit} onChange={(v) => setRegisterForm({ ...registerForm, health_unit: v })} />
              <Input label="Especialidade" value={registerForm.specialty} onChange={(v) => setRegisterForm({ ...registerForm, specialty: v })} />
              <Input label="Conselho profissional" value={registerForm.professional_council} onChange={(v) => setRegisterForm({ ...registerForm, professional_council: v })} />
              <Input label="Formação acadêmica" value={registerForm.academic_background} onChange={(v) => setRegisterForm({ ...registerForm, academic_background: v })} />
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Perfil</label>
                <select
                  value={registerForm.role}
                  onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="PROFESSIONAL">PROFESSIONAL</option>
                  <option value="TELECONSULTOR">TELECONSULTOR</option>
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
                <Input label="Telefone" value={caseForm.patient_phone} onChange={(v) => setCaseForm({ ...caseForm, patient_phone: v })} />
                <Input label="Cartão SUS" value={caseForm.sus_card} onChange={(v) => setCaseForm({ ...caseForm, sus_card: v })} />
                <Input label="Unidade" value={caseForm.health_unit} onChange={(v) => setCaseForm({ ...caseForm, health_unit: v })} />
                <Input label="Município" value={caseForm.municipality} onChange={(v) => setCaseForm({ ...caseForm, municipality: v })} />
                <Input label="Estado" value={caseForm.state} onChange={(v) => setCaseForm({ ...caseForm, state: v })} />
                <div className="md:col-span-2"><TextArea label="Queixa principal" value={caseForm.chief_complaint} onChange={(v) => setCaseForm({ ...caseForm, chief_complaint: v })} /></div>
                <div className="md:col-span-2"><TextArea label="História da doença atual" value={caseForm.history_present_illness} onChange={(v) => setCaseForm({ ...caseForm, history_present_illness: v })} /></div>
                <div className="md:col-span-2"><TextArea label="História médica" value={caseForm.medical_history} onChange={(v) => setCaseForm({ ...caseForm, medical_history: v })} /></div>
                <div className="md:col-span-2"><TextArea label="História odontológica" value={caseForm.dental_history} onChange={(v) => setCaseForm({ ...caseForm, dental_history: v })} /></div>
                <div className="md:col-span-2"><TextArea label="Medicamentos" value={caseForm.medications} onChange={(v) => setCaseForm({ ...caseForm, medications: v })} /></div>
                <div className="md:col-span-2"><TextArea label="Exame físico extraoral" value={caseForm.extraoral_exam} onChange={(v) => setCaseForm({ ...caseForm, extraoral_exam: v })} /></div>
                <div className="md:col-span-2"><TextArea label="Descrição da lesão" value={caseForm.lesion_description} onChange={(v) => setCaseForm({ ...caseForm, lesion_description: v })} /></div>
                <div className="md:col-span-2"><TextArea label="Hipótese diagnóstica" value={caseForm.diagnostic_hypothesis} onChange={(v) => setCaseForm({ ...caseForm, diagnostic_hypothesis: v })} /></div>
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
                    <div className="font-semibold">Caso #{item.id} — {item.patient_name}</div>
                    <div className="text-sm text-slate-600">Status: {item.status}</div>
                    <div className="text-sm text-slate-600">Estado: {item.state}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSubmitCase(item.id)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm"
                      >
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
                  <pre className="mt-4 bg-slate-900 text-slate-100 rounded-xl p-4 overflow-auto text-xs">
                    {JSON.stringify(caseDetail, null, 2)}
                  </pre>
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
                    <div className="font-semibold">Caso #{item.id} — {item.patient_name}</div>
                    <div className="text-sm text-slate-600">Estado: {item.state}</div>
                    <div className="text-sm text-slate-600">Status: {item.status}</div>
                    <div className="text-sm text-slate-600">Hipótese: {item.diagnostic_hypothesis}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Responder caso">
              <form onSubmit={handleRespondCase} className="space-y-4">
                <Input label="ID do caso" value={selectedResponseCaseId} onChange={setSelectedResponseCaseId} />
                <TextArea label="Descrição clínica" value={teleResponseForm.clinical_description} onChange={(v) => setTeleResponseForm({ ...teleResponseForm, clinical_description: v })} />
                <TextArea label="Hipóteses justificadas" value={teleResponseForm.justified_hypotheses} onChange={(v) => setTeleResponseForm({ ...teleResponseForm, justified_hypotheses: v })} />
                <TextArea label="Conduta" value={teleResponseForm.conduct} onChange={(v) => setTeleResponseForm({ ...teleResponseForm, conduct: v })} />
                <TextArea label="Coordenação do cuidado" value={teleResponseForm.care_coordination} onChange={(v) => setTeleResponseForm({ ...teleResponseForm, care_coordination: v })} />
                <TextArea label="Referências" value={teleResponseForm.references} onChange={(v) => setTeleResponseForm({ ...teleResponseForm, references: v })} />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={teleResponseForm.marked_as_suspected}
                    onChange={(e) =>
                      setTeleResponseForm({
                        ...teleResponseForm,
                        marked_as_suspected: e.target.checked,
                      })
                    }
                  />
                  Marcar como suspeito
                </label>
                <button type="submit" className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold">
                  Enviar resposta
                </button>
              </form>
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
                    <div className="font-semibold">Caso #{item.id} — {item.patient_name}</div>
                    <div className="text-sm text-slate-600">Estado: {item.state}</div>
                    <div className="text-sm text-slate-600">Status: {item.status}</div>
                    <div className="text-sm text-slate-600">Suspeito: {String(item.is_suspected)}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Criar / editar seguimento">
              <div className="space-y-4">
                <Input label="ID do caso" value={selectedFollowupCaseId} onChange={setSelectedFollowupCaseId} />
                <Input label="ID do followup para editar" value={followupIdToEdit} onChange={setFollowupIdToEdit} />
                <Input label="Data do laudo microscópico" value={followupForm.microscopic_report_date} onChange={(v) => setFollowupForm({ ...followupForm, microscopic_report_date: v })} type="date" />
                <Input label="Consulta cabeça e pescoço / oncologia" value={followupForm.head_neck_or_oncology_visit_date} onChange={(v) => setFollowupForm({ ...followupForm, head_neck_or_oncology_visit_date: v })} type="date" />
                <Input label="Início do tratamento" value={followupForm.treatment_start_date} onChange={(v) => setFollowupForm({ ...followupForm, treatment_start_date: v })} type="date" />
                <Input label="Acompanhamento 3 meses" value={followupForm.followup_3m_date} onChange={(v) => setFollowupForm({ ...followupForm, followup_3m_date: v })} type="date" />
                <Input label="Acompanhamento 6 meses" value={followupForm.followup_6m_date} onChange={(v) => setFollowupForm({ ...followupForm, followup_6m_date: v })} type="date" />
                <TextArea label="Tratamentos realizados" value={followupForm.treatments_done} onChange={(v) => setFollowupForm({ ...followupForm, treatments_done: v })} />
                <TextArea label="Situação clínica" value={followupForm.clinical_status} onChange={(v) => setFollowupForm({ ...followupForm, clinical_status: v })} />
                <TextArea label="Observações" value={followupForm.notes} onChange={(v) => setFollowupForm({ ...followupForm, notes: v })} />

                <div className="flex flex-wrap gap-2">
                  <button onClick={handleLoadFollowups} className="px-4 py-2 rounded-xl border border-slate-300">
                    Ver seguimentos
                  </button>
                  <button onClick={handleCreateFollowup} className="px-4 py-2 rounded-xl bg-emerald-600 text-white">
                    Criar seguimento
                  </button>
                  <button onClick={handleUpdateFollowup} className="px-4 py-2 rounded-xl bg-blue-600 text-white">
                    Editar seguimento
                  </button>
                </div>

                {followups.length > 0 && (
                  <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-auto text-xs">
                    {JSON.stringify(followups, null, 2)}
                  </pre>
                )}
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}