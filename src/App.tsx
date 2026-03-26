import React, { useMemo, useState } from "react";

type ScreenKey =
  | "inicio"
  | "cadastroProfissional"
  | "caso"
  | "teleconsultor"
  | "chat"
  | "telerregulador"
  | "dashboard";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

type FieldProps = {
  label: string;
  placeholder?: string;
  type?: string;
};

function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-3xl shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function InputField({
  label,
  placeholder = "",
  type = "text",
}: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}

function TextAreaField({ label, placeholder = "" }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <textarea
        rows={4}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}

function UploadBox({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center">
      <div className="text-sm font-medium text-slate-700">{title}</div>
      <div className="text-xs text-slate-500 mt-1">
        Selecionar imagem, exame ou documento
      </div>
      <button
        type="button"
        className="mt-3 rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-medium"
      >
        Enviar arquivo
      </button>
    </div>
  );
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("inicio");
  const [cadastroConcluido, setCadastroConcluido] = useState(false);

  const menuItems: { key: ScreenKey; label: string }[] = useMemo(
    () => [
      { key: "inicio", label: "Início" },
      { key: "cadastroProfissional", label: "Cadastro profissional" },
      { key: "caso", label: "Relato de caso" },
      { key: "teleconsultor", label: "Teleconsultor" },
      { key: "chat", label: "Chat" },
      { key: "telerregulador", label: "Telerregulador" },
      { key: "dashboard", label: "Dashboard" },
    ],
    []
  );

  const liberarEnvio = () => {
    setCadastroConcluido(true);
    setActiveScreen("caso");
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case "inicio":
        return (
          <div className="space-y-6">
            <SectionHeader
              title="Telestomatologia no SUS"
              subtitle="Teleconsultoria em estomatologia para apoio aos profissionais da Atenção Básica"
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <Card className="p-6 xl:col-span-2 bg-gradient-to-br from-emerald-700 to-emerald-600 text-white border-0">
                <div className="text-sm uppercase tracking-wide opacity-80">
                  Plataforma de apoio clínico
                </div>
                <h3 className="text-3xl font-bold mt-2 leading-tight">
                  Avaliação remota de casos de doenças da boca com fluxo
                  assistencial estruturado
                </h3>
                <p className="mt-4 text-sm text-emerald-50 max-w-2xl">
                  O profissional de saúde faz seu cadastro, envia o caso clínico
                  e o sistema distribui automaticamente para um teleconsultor do
                  mesmo estado. Casos suspeitos seguem para acompanhamento por
                  telerreguladores estaduais.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveScreen("cadastroProfissional")}
                    className="rounded-2xl bg-white text-emerald-700 px-5 py-3 text-sm font-semibold"
                  >
                    Criar conta
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveScreen("caso")}
                    className="rounded-2xl border border-white/40 px-5 py-3 text-sm font-semibold"
                  >
                    Acessar plataforma
                  </button>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-sm font-semibold text-slate-900">
                  Acesso rápido
                </div>
                <div className="mt-4 space-y-3">
                  <InputField
                    label="E-mail"
                    placeholder="profissional@saude.gov.br"
                    type="email"
                  />
                  <InputField
                    label="Senha"
                    placeholder="••••••••"
                    type="password"
                  />
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-emerald-600 text-white py-3 text-sm font-semibold"
                  >
                    Entrar
                  </button>
                </div>
              </Card>
            </div>
          </div>
        );

      case "cadastroProfissional":
        return (
          <div className="space-y-6">
            <SectionHeader
              title="Cadastro do profissional de saúde"
              subtitle="Registro para acesso ao envio de casos e recebimento das respostas"
            />

            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <InputField label="Nome" placeholder="Nome completo" />
                <InputField label="Idade" placeholder="Ex.: 35" />
                <InputField label="Sexo" placeholder="Selecionar" />
                <InputField
                  label="E-mail"
                  placeholder="email@exemplo.com"
                  type="email"
                />
                <InputField
                  label="Endereço completo"
                  placeholder="Rua, número, bairro"
                />
                <InputField label="Município" placeholder="Município" />
                <InputField label="Estado" placeholder="UF" />
                <InputField
                  label="Unidade de atendimento 1"
                  placeholder="Nome da unidade"
                />
                <InputField
                  label="Unidade de atendimento 2"
                  placeholder="Adicionar outra unidade"
                />
                <InputField
                  label="Área profissional"
                  placeholder="Odontologia, Medicina, Enfermagem..."
                />
                <InputField
                  label="Especialidade"
                  placeholder="Ex.: Saúde da Família"
                />
                <InputField
                  label="Número do conselho profissional"
                  placeholder="CRO / CRM / COREN"
                />
                <InputField
                  label="Senha"
                  placeholder="Criar senha"
                  type="password"
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={liberarEnvio}
                  className="rounded-2xl bg-emerald-600 text-white px-5 py-3 text-sm font-semibold"
                >
                  Concluir cadastro
                </button>
                <button
                  type="button"
                  onClick={() => setActiveScreen("inicio")}
                  className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Voltar
                </button>
              </div>

              {cadastroConcluido && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  Cadastro concluído com sucesso. O envio de casos foi liberado.
                </div>
              )}
            </Card>
          </div>
        );

      case "caso":
        return (
          <div className="space-y-6">
            <SectionHeader
              title="Relato de caso e acompanhamento"
              subtitle="Tela do profissional para envio do caso clínico e acesso à resposta do teleconsultor"
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <Card className="p-6 xl:col-span-2">
                <div className="text-lg font-bold text-slate-900 mb-4">
                  Novo caso
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Nome do paciente"
                    placeholder="Nome completo"
                  />
                  <InputField label="Idade" placeholder="Ex.: 58" />
                  <InputField label="Sexo" placeholder="Selecionar" />
                  <InputField
                    label="Telefone"
                    placeholder="(00) 00000-0000"
                  />
                  <InputField
                    label="Cartão do SUS"
                    placeholder="000 0000 0000 0000"
                  />
                  <InputField
                    label="Unidade de atendimento"
                    placeholder="Selecionar unidade"
                  />
                  <InputField label="Município" placeholder="Município" />
                  <InputField label="Estado" placeholder="UF" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <TextAreaField
                    label="Queixa principal"
                    placeholder="Descreva a principal queixa"
                  />
                  <TextAreaField
                    label="História da doença atual"
                    placeholder="Tempo de evolução, sintomas, fatores associados"
                  />
                  <TextAreaField
                    label="História médica"
                    placeholder="Doenças sistêmicas relevantes"
                  />
                  <TextAreaField
                    label="História odontológica"
                    placeholder="Informações odontológicas relevantes"
                  />
                  <TextAreaField
                    label="Uso de medicamentos"
                    placeholder="Medicamentos em uso"
                  />
                  <TextAreaField
                    label="Exame físico extraoral"
                    placeholder="Achados extraorais"
                  />
                  <TextAreaField
                    label="Descrição clínica da(s) lesão(ões)"
                    placeholder="Localização, cor, forma, tamanho, superfície, limites"
                  />
                  <TextAreaField
                    label="Hipóteses de diagnóstico"
                    placeholder="Hipóteses clínicas iniciais"
                  />
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                  <UploadBox title="Foto clínica 1" />
                  <UploadBox title="Foto clínica 2" />
                  <UploadBox title="Foto clínica 3" />
                  <UploadBox title="Exame complementar" />
                  <UploadBox title="TCLE" />
                </div>

                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="text-sm font-semibold text-amber-800">
                    Validação de cadastro
                  </div>
                  <p className="mt-1 text-sm text-amber-700">
                    O envio do caso só é permitido após o cadastro completo do
                    profissional e acesso autenticado no sistema.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={!cadastroConcluido}
                      className={`rounded-2xl px-5 py-3 text-sm font-semibold ${
                        cadastroConcluido
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-300 text-slate-600 cursor-not-allowed"
                      }`}
                    >
                      Enviar caso
                    </button>

                    <button
                      type="button"
                      className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
                    >
                      Salvar rascunho
                    </button>

                    {!cadastroConcluido && (
                      <button
                        type="button"
                        onClick={() => setActiveScreen("cadastroProfissional")}
                        className="rounded-2xl bg-emerald-600 text-white px-5 py-3 text-sm font-semibold"
                      >
                        Fazer cadastro para liberar envio
                      </button>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-lg font-bold text-slate-900">
                  Meus casos
                </div>

                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-slate-800">
                        Caso #2026-018
                      </div>
                      <span className="rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-semibold">
                        Em análise
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 mt-2">
                      Paciente, 61 anos • Lesão em borda lateral de língua
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-slate-800">
                        Caso #2026-011
                      </div>
                      <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold">
                        Respondido
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 mt-2">
                      Hipótese principal: líquen plano oral
                    </div>
                    <button
                      type="button"
                      className="mt-3 text-sm font-semibold text-emerald-700"
                    >
                      Ver resposta do teleconsultor
                    </button>
                  </div>

                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-slate-800">
                        Caso #2026-004
                      </div>
                      <span className="rounded-full bg-rose-100 text-rose-700 px-3 py-1 text-xs font-semibold">
                        Suspeito
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 mt-2">
                      Acompanhado por telerregulador estadual
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case "teleconsultor":
        return (
          <div className="space-y-6">
            <SectionHeader
              title="Painel do teleconsultor"
              subtitle="Recebimento automático de casos por estado e resposta técnica especializada"
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <Card className="p-6">
                <div className="text-lg font-bold text-slate-900 mb-4">
                  Cadastro do teleconsultor
                </div>

                <div className="space-y-3">
                  <InputField label="Nome" placeholder="Nome completo" />
                  <InputField label="Idade" placeholder="Ex.: 44" />
                  <InputField label="Sexo" placeholder="Selecionar" />
                  <InputField
                    label="E-mail"
                    placeholder="teleconsultor@saude.gov.br"
                    type="email"
                  />
                  <InputField label="Município" placeholder="Município" />
                  <InputField label="Estado" placeholder="UF" />
                  <InputField
                    label="Formação profissional"
                    placeholder="Graduação, especialização, mestrado e doutorado"
                  />
                  <InputField
                    label="Número do conselho profissional"
                    placeholder="CRO"
                  />
                  <InputField
                    label="Senha"
                    placeholder="Criar senha"
                    type="password"
                  />
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-emerald-600 text-white py-3 text-sm font-semibold"
                  >
                    Cadastrar teleconsultor
                  </button>
                </div>
              </Card>

              <Card className="p-6 xl:col-span-2">
                <div className="flex items-center justify-between mb-4 gap-3">
                  <div>
                    <div className="text-lg font-bold text-slate-900">
                      Caso distribuído automaticamente
                    </div>
                    <div className="text-sm text-slate-500">
                      Distribuição por estado do profissional solicitante
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold">
                    PB • Prioridade moderada
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Nome do consultor"
                    placeholder="Preenchido automaticamente"
                  />
                  <InputField
                    label="E-mail do consultor"
                    placeholder="Preenchido automaticamente"
                  />
                  <TextAreaField
                    label="Descrição clínica"
                    placeholder="Síntese dos achados clínicos"
                  />
                  <TextAreaField
                    label="Hipóteses diagnósticas justificadas"
                    placeholder="Descrever hipóteses com justificativa"
                  />
                  <TextAreaField
                    label="Conduta no caso"
                    placeholder="Orientações e encaminhamentos"
                  />
                  <TextAreaField
                    label="Coordenação do cuidado"
                    placeholder="Fluxo assistencial e seguimento"
                  />
                  <TextAreaField
                    label="Referências bibliográficas"
                    placeholder="Inserir referências utilizadas"
                  />

                  <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                    <div className="text-sm font-semibold text-slate-800">
                      Classificação do caso
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="suspeito" />
                        Caso não suspeito
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="suspeito" />
                        Marcar como lesão suspeita
                      </label>
                    </div>
                    <div className="text-xs text-slate-500 mt-3">
                      Ao marcar como suspeita, o caso é enviado ao
                      telerregulador estadual.
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-2xl bg-emerald-600 text-white px-5 py-3 text-sm font-semibold"
                  >
                    Enviar resposta
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveScreen("chat")}
                    className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
                  >
                    Abrir chat do caso
                  </button>
                </div>
              </Card>
            </div>
          </div>
        );

      case "chat":
        return (
          <div className="space-y-6">
            <SectionHeader
              title="Chat do caso"
              subtitle="Troca de mensagens, imagens e áudios entre profissional e teleconsultor"
            />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
              <Card className="p-4 xl:col-span-1">
                <div className="text-sm font-semibold text-slate-900">
                  Casos com conversa ativa
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3">
                    <div className="font-semibold text-slate-800">
                      Caso #2026-011
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Atualização clínica enviada hoje
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-3">
                    <div className="font-semibold text-slate-800">
                      Caso #2026-018
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Aguardando resposta do teleconsultor
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-0 overflow-hidden xl:col-span-3">
                <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-3 bg-slate-50">
                  <div>
                    <div className="font-bold text-slate-900">
                      Chat do Caso #2026-011
                    </div>
                    <div className="text-sm text-slate-500">
                      Profissional solicitante ↔ Teleconsultor estadual
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold">
                    Conversa armazenada no caso
                  </span>
                </div>

                <div className="p-6 space-y-4 bg-slate-50 min-h-[430px]">
                  <div className="flex justify-start">
                    <div className="max-w-xl rounded-2xl rounded-tl-sm bg-white border border-slate-200 p-4 text-sm text-slate-700 shadow-sm">
                      Poderia informar se houve aumento de tamanho da lesão nas
                      últimas semanas?
                      <div className="text-xs text-slate-400 mt-2">
                        Teleconsultor • 09:14
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-xl rounded-2xl rounded-tr-sm bg-emerald-600 text-white p-4 text-sm shadow-sm">
                      Sim. Também estou anexando nova foto clínica e um áudio
                      com atualização do caso.
                      <div className="text-xs text-emerald-100 mt-2">
                        Profissional • 09:18
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 flex-wrap">
                    <div className="rounded-2xl bg-white border border-slate-200 p-3 text-sm text-slate-600">
                      🖼️ imagem_lesao_03.jpg
                    </div>
                    <div className="rounded-2xl bg-white border border-slate-200 p-3 text-sm text-slate-600">
                      🎤 audio_atualizacao.m4a
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 p-4 bg-white">
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Escreva uma mensagem sobre a evolução do caso..."
                    />
                    <button
                      type="button"
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold"
                    >
                      Imagem
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold"
                    >
                      Áudio
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl bg-emerald-600 text-white px-5 py-3 text-sm font-semibold"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case "telerregulador":
        return (
          <div className="space-y-6">
            <SectionHeader
              title="Painel do telerregulador estadual"
              subtitle="Acompanhamento longitudinal dos casos suspeitos sinalizados pelo teleconsultor"
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <Card className="p-6">
                <div className="text-lg font-bold text-slate-900 mb-4">
                  Cadastro e login
                </div>

                <div className="space-y-3">
                  <InputField label="Nome" placeholder="Nome completo" />
                  <InputField label="Idade" placeholder="Ex.: 40" />
                  <InputField label="Sexo" placeholder="Selecionar" />
                  <InputField
                    label="E-mail"
                    placeholder="telerregulador@saude.gov.br"
                    type="email"
                  />
                  <InputField label="Município" placeholder="Município" />
                  <InputField label="Estado" placeholder="UF" />
                  <InputField
                    label="Formação profissional"
                    placeholder="Graduação, especialização, mestrado e doutorado"
                  />
                  <InputField
                    label="Número do conselho profissional"
                    placeholder="CRO"
                  />
                  <InputField
                    label="Senha"
                    placeholder="Criar senha"
                    type="password"
                  />
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-emerald-600 text-white py-3 text-sm font-semibold"
                  >
                    Acessar painel
                  </button>
                </div>
              </Card>

              <Card className="p-6 xl:col-span-2">
                <div className="flex items-center justify-between mb-4 gap-3">
                  <div>
                    <div className="text-lg font-bold text-slate-900">
                      Caso suspeito em acompanhamento
                    </div>
                    <div className="text-sm text-slate-500">
                      Encaminhado pelo teleconsultor estadual
                    </div>
                  </div>
                  <span className="rounded-full bg-rose-100 text-rose-700 px-3 py-1 text-xs font-semibold">
                    Suspeita de malignidade
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Laudo microscópico — data de entrega"
                    placeholder="dd/mm/aaaa"
                  />
                  <InputField
                    label="Consulta com cirurgia de cabeça e pescoço / oncologia"
                    placeholder="dd/mm/aaaa"
                  />
                  <InputField
                    label="Início do tratamento"
                    placeholder="dd/mm/aaaa"
                  />
                  <InputField
                    label="Acompanhamento em 3 meses"
                    placeholder="dd/mm/aaaa"
                  />
                  <InputField
                    label="Acompanhamento em 6 meses"
                    placeholder="dd/mm/aaaa"
                  />
                  <InputField
                    label="Situação clínica atual"
                    placeholder="Em investigação, em tratamento, concluído..."
                  />
                  <TextAreaField
                    label="Tratamentos realizados"
                    placeholder="Cirurgia, biópsia, radioterapia, quimioterapia, suporte clínico..."
                  />
                  <TextAreaField
                    label="Observações do seguimento"
                    placeholder="Descrição da evolução clínica do paciente"
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-2xl bg-emerald-600 text-white px-5 py-3 text-sm font-semibold"
                  >
                    Salvar acompanhamento
                  </button>
                  <button
                    type="button"
                    className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
                  >
                    Ver histórico do caso
                  </button>
                </div>
              </Card>
            </div>
          </div>
        );

      case "dashboard":
        return (
          <div className="space-y-6">
            <SectionHeader
              title="Dashboard de gestão da telestomatologia"
              subtitle="Monitoramento dos casos, respostas técnicas e seguimento estadual"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
              {[
                ["1.248", "Casos relatados"],
                ["972", "Teleconsultorias feitas"],
                ["184", "Casos suspeitos"],
                ["6,2 dias", "Tempo médio de resposta"],
                ["138", "Casos acompanhados"],
                ["15", "Estados ativos"],
              ].map(([value, label]) => (
                <Card key={label} className="p-5">
                  <div className="text-2xl font-bold text-slate-900">
                    {value}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">{label}</div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <Card className="p-6 xl:col-span-2">
                <div className="text-lg font-bold text-slate-900 mb-5">
                  Casos por estado
                </div>

                <div className="space-y-4">
                  {[
                    ["Paraíba", 88],
                    ["Ceará", 73],
                    ["Pernambuco", 61],
                    ["Rio Grande do Norte", 49],
                    ["Bahia", 36],
                  ].map(([state, pct]) => (
                    <div key={state}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700 font-medium">
                          {state}
                        </span>
                        <span className="text-slate-500">{pct} casos</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-600"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-lg font-bold text-slate-900">
                  Casos suspeitos por estado
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  {[
                    ["PB", "42"],
                    ["CE", "31"],
                    ["PE", "24"],
                    ["RN", "19"],
                    ["BA", "11"],
                  ].map(([uf, n]) => (
                    <div
                      key={uf}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 p-3"
                    >
                      <span className="font-semibold text-slate-700">
                        {uf}
                      </span>
                      <span className="rounded-full bg-rose-100 text-rose-700 px-3 py-1 text-xs font-semibold">
                        {n} suspeitos
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card className="p-6">
                <div className="text-lg font-bold text-slate-900">
                  Tempo para teleconsultoria realizada
                </div>

                <div className="mt-5 flex items-end gap-3 h-56">
                  {[5, 7, 4, 8, 6, 5, 3].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-full rounded-t-2xl bg-emerald-500"
                        style={{ height: `${h * 24}px` }}
                      />
                      <span className="text-xs text-slate-500">S{i + 1}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-lg font-bold text-slate-900">
                  Casos acompanhados por telerreguladores
                </div>

                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Em investigação diagnóstica
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        52
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Em tratamento
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        41
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Acompanhamento 3 meses
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        28
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Acompanhamento 6 meses
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        17
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex flex-col xl:flex-row">
        <aside className="xl:w-80 bg-slate-950 text-white p-6 xl:min-h-screen">
          <div className="rounded-3xl bg-white p-5 shadow-lg border border-slate-200">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <img
                src="/brasil-sorridente.png"
                alt="Brasil Sorridente"
                className="h-16 w-auto object-contain rounded-xl bg-white"
              />
              <img
                src="/logolab.png"
                alt="LABODIGIT"
                className="h-16 w-auto object-contain rounded-xl bg-white"
              />
            </div>

            <div className="text-center mt-4">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Teleconsultoria em Estomatologia
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                Plataforma para cadastro de profissionais, teleconsultoria, chat
                clínico, regulação estadual e monitoramento por indicadores.
              </p>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveScreen(item.key)}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition ${
                  activeScreen === item.key
                    ? "bg-white text-slate-900"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-3xl border border-slate-800 p-5">
            <div className="text-sm font-semibold">Fluxo assistencial</div>
            <ol className="mt-3 space-y-2 text-sm text-slate-300 list-decimal list-inside">
              <li>Cadastro do profissional</li>
              <li>Envio do caso clínico</li>
              <li>Distribuição automática por estado</li>
              <li>Resposta do teleconsultor</li>
              <li>Chat para atualização do caso</li>
              <li>Acionamento do telerregulador</li>
              <li>Acompanhamento por dashboard</li>
            </ol>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-5">
              <h1 className="text-3xl font-bold text-slate-900">
                {menuItems.find((item) => item.key === activeScreen)?.label}
              </h1>
            </div>

            {renderScreen()}
          </div>
        </main>
      </div>
    </div>
  );
}