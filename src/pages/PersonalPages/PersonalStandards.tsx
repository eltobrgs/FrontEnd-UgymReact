import { FC, useState } from "react";
import { FaDumbbell, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import AlunosTabs from "../../components/PersonalComponents/AlunosTabs/AlunosTabs";
import { connectionUrl } from "../../config/connection";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rest: string;
  mediaType?: "youtube" | "upload";
  media?: string;
}

interface TrainingDay {
  day: number;
  exercises: Exercise[];
}

interface TrainingPlan {
  title: string;
  frequency: 3 | 5;
  gender: "Masculino" | "Feminino";
  days: TrainingDay[];
  image?: string;
}

const defaultExercise: Exercise = { name: "", sets: 3, reps: 12, rest: "60s" };

const TreinosPadroes: FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [exerciseForm, setExerciseForm] = useState<Exercise>({ ...defaultExercise });
  const [savedPlans, setSavedPlans] = useState<TrainingPlan[]>([]);
  const [mediaType, setMediaType] = useState<"youtube" | "upload">("youtube");
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  // Estados para modal de atribuir treino
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [planToAssignIndex, setPlanToAssignIndex] = useState<number | null>(null);

  function startPlan(frequency: 3 | 5, gender: "Masculino" | "Feminino") {
    setPlan({
      title: "",
      frequency,
      gender,
      days: [],
      image: "",
    });
    setCurrentDay(1);
    setExerciseForm({ ...defaultExercise });
    setShowForm(true);
  }

  function addExercise(exercise: Exercise) {
    setPlan((p) => {
      if (!p) return p;
      const days = [...p.days];
      const dayIndex = days.findIndex((d) => d.day === currentDay);

      if (dayIndex >= 0) {
        days[dayIndex] = {
          ...days[dayIndex],
          exercises: [...days[dayIndex].exercises, exercise],
        };
      } else {
        days.push({ day: currentDay, exercises: [exercise] });
      }
      return { ...p, days };
    });
  }

  function changeDay(day: number) {
    setCurrentDay(day);
    setExerciseForm({ ...defaultExercise });
  }

  function removeExercise(day: number, index: number) {
    if (!plan) return;
    const days = [...plan.days];
    const dayIndex = days.findIndex((d) => d.day === day);
    if (dayIndex === -1) return;

    days[dayIndex] = {
      ...days[dayIndex],
      exercises: days[dayIndex].exercises.filter((_, i) => i !== index),
    };

    setPlan({ ...plan, days });
  }

  function savePlan() {
    if (!plan) return alert("Nada para salvar");
    if (!plan.title.trim()) return alert("Dê um título ao treino");

    for (let d = 1; d <= plan.frequency; d++) {
      const day = plan.days.find((day) => day.day === d);
      if (!day || day.exercises.length === 0) {
        alert(`Complete os exercícios do dia ${d}`);
        return;
      }
    }

    setSavedPlans((prev) => [...prev, { ...plan }]);
    alert("Treino salvo!");
    setShowForm(false);
    setPlan(null);
  }

  // Função para abrir modal de atribuição
  function openAssignModal(index: number) {
    setPlanToAssignIndex(index);
    setShowAssignModal(true);
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto p-6">
      <div className="flex-1 min-w-[320px]">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <FaDumbbell /> Treinos Padrões
        </h1>
        <p className="mb-4 text-gray-700">Escolha o tipo de treino para criar:</p>

        <div className="flex justify-center mb-6">
          <img
            src="/icons/image-removebg-preview.png"
            alt="Instrutora decorativa"
            className="w-40 h-auto pointer-events-none select-none"
            draggable={false}
          />
        </div>

        {!showForm && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => startPlan(3, "Masculino")}
              className="bg-red-600 text-white py-3 rounded hover:bg-red-700"
            >
              Treino 3x Semana Masculino
            </button>
            <button
              onClick={() => startPlan(3, "Feminino")}
              className="bg-pink-600 text-white py-3 rounded hover:bg-pink-700"
            >
              Treino 3x Semana Feminino
            </button>
            <button
              onClick={() => startPlan(5, "Masculino")}
              className="bg-red-600 text-white py-3 rounded hover:bg-red-700"
            >
              Treino 5x Semana Masculino
            </button>
            <button
              onClick={() => startPlan(5, "Feminino")}
              className="bg-pink-600 text-white py-3 rounded hover:bg-pink-700"
            >
              Treino 5x Semana Feminino
            </button>
          </div>
        )}

        {showForm && (
          <>
            <label className="block mb-4">
              <span className="font-semibold">Título do treino:</span>
              <input
                type="text"
                value={plan?.title}
                onChange={(e) =>
                  setPlan((p) => (p ? { ...p, title: e.target.value } : p))
                }
                className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ex: Hipertrofia 3x Masculino"
              />
            </label>

            <div className="flex gap-2 mb-6">
              {Array.from({ length: plan?.frequency || 0 }, (_, i) => i + 1).map(
                (d) => (
                  <button
                    key={d}
                    onClick={() => changeDay(d)}
                    className={`px-4 py-2 rounded ${
                      d === currentDay ? "bg-red-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    Dia {d}
                  </button>
                )
              )}
            </div>

            <div className="mb-6">
              <button
                onClick={() => {
                  setExerciseForm({ ...defaultExercise });
                  setShowExerciseModal(true);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Adicionar Exercício
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Exercícios do Dia {currentDay}</h2>
              <ul className="list-disc list-inside space-y-2">
                {(plan?.days.find((d) => d.day === currentDay)?.exercises.map(
                  (ex, i) => (
                    <li key={i} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span>
                          <strong>{ex.name}</strong> — {ex.sets}x{ex.reps}, descanso: {ex.rest}
                        </span>
                        <button
                          onClick={() => removeExercise(currentDay, i)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTimes />
                        </button>
                      </div>
                      {ex.mediaType === "youtube" && ex.media && (
                        <a
                          href={ex.media}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm underline"
                        >
                          Ver vídeo
                        </a>
                      )}
                      {ex.mediaType === "upload" && ex.media && (
                        <img
                          src={ex.media}
                          alt="Exercício"
                          className="w-24 h-auto rounded border"
                        />
                      )}
                    </li>
                  )
                )) || <p className="text-gray-600">Nenhum exercício adicionado.</p>}
              </ul>
            </div>

            <button
              onClick={savePlan}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
            >
              Salvar Treino Padrão
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setPlan(null);
              }}
              className="ml-4 bg-gray-300 px-6 py-3 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </>
        )}

        {showExerciseModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Adicionar Exercício</h2>

              <input
                className="border p-2 w-full mb-2"
                placeholder="Nome"
                value={exerciseForm.name}
                onChange={(e) =>
                  setExerciseForm((f) => ({ ...f, name: e.target.value }))
                }
              />
              <input
                className="border p-2 w-full mb-2"
                placeholder="Séries"
                type="number"
                value={exerciseForm.sets}
                onChange={(e) =>
                  setExerciseForm((f) => ({ ...f, sets: Number(e.target.value) }))
                }
              />
              <input
                className="border p-2 w-full mb-2"
                placeholder="Repetições"
                type="number"
                value={exerciseForm.reps}
                onChange={(e) =>
                  setExerciseForm((f) => ({ ...f, reps: Number(e.target.value) }))
                }
              />
              <input
                className="border p-2 w-full mb-2"
                placeholder="Descanso"
                value={exerciseForm.rest}
                onChange={(e) =>
                  setExerciseForm((f) => ({ ...f, rest: e.target.value }))
                }
              />

              <div className="mb-4">
                <label className="mr-4">
                  <input
                    type="radio"
                    checked={mediaType === "youtube"}
                    onChange={() => setMediaType("youtube")}
                  />{" "}
                  Link YouTube
                </label>
                <label>
                  <input
                    type="radio"
                    checked={mediaType === "upload"}
                    onChange={() => setMediaType("upload")}
                  />{" "}
                  Upload Imagem/GIF
                </label>
              </div>

              {mediaType === "youtube" && (
                <input
                  className="border p-2 w-full mb-2"
                  placeholder="URL do vídeo"
                  value={exerciseForm.mediaType === "youtube" ? exerciseForm.media || "" : ""}
                  onChange={(e) =>
                    setExerciseForm((f) => ({ ...f, mediaType: "youtube", media: e.target.value }))
                  }
                />
              )}

              {mediaType === "upload" && (
                <input
                  type="file"
                  accept="image/gif,image/png,image/jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setExerciseForm((f) => ({
                        ...f,
                        mediaType: "upload",
                        media: url,
                      }));
                    }
                  }}
                />
              )}

              <div className="flex justify-end gap-4 mt-4">
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  onClick={() => setShowExerciseModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  onClick={() => {
                    if (!exerciseForm.name.trim()) {
                      alert("Informe o nome do exercício");
                      return;
                    }
                    addExercise(exerciseForm);
                    setShowExerciseModal(false);
                  }}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-[320px]">
        <h2 className="text-2xl font-semibold mb-4">Treinos Salvos</h2>
        {savedPlans.length === 0 && <p className="text-gray-600">Nenhum treino salvo</p>}

        <ul className="space-y-3 max-h-[600px] overflow-auto">
          {savedPlans.map((plan, index) => (
            <li
              key={index}
              className="border rounded p-4 shadow-sm flex justify-between items-center hover:bg-gray-100 cursor-pointer"
            >
              <span>
                <strong>{plan.title}</strong> - {plan.frequency}x/semana ({plan.gender})
              </span>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                onClick={() => openAssignModal(index)}
              >
                Atribuir a um aluno
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal de atribuir treino */}
      {showAssignModal && planToAssignIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded p-6 max-w-3xl w-full max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">
              Atribuir treino: {savedPlans[planToAssignIndex].title}
            </h2>
            <AlunosTabs
              onSelectStudent={async (student) => {
                try {
                  const token = localStorage.getItem("token");
                  const response = await fetch(`${connectionUrl}/treinos/atribuir`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      alunoId: student.id,
                      treino: savedPlans[planToAssignIndex],
                    }),
                  });

                  if (!response.ok) throw new Error("Falha ao atribuir treino");

                  Swal.fire(
                    "Sucesso",
                    `Treino atribuído ao aluno ${student.name}`,
                    "success"
                  );
                  setShowAssignModal(false);
                  setPlanToAssignIndex(null);
                } catch (error) {
                  Swal.fire("Erro", "Não foi possível atribuir o treino", "error");
                }
              }}
              containerClassName=""
            />
            <button
              className="mt-4 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              onClick={() => {
                setShowAssignModal(false);
                setPlanToAssignIndex(null);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreinosPadroes;
