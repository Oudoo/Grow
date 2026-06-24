"use client";

import { useEffect, useState } from "react";
import { useVacancyStore } from "@/stores/producer/vacancy-store";
import type { Vacancy } from "@/types/producer/vacancy";

/* ─── NewVacancyModal ─── */
function NewVacancyModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const addVacancy = useVacancyStore((s) => s.addVacancy);

  if (!isOpen) return null;

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".md")) {
      setError("Only .md (Markdown) files are accepted");
      return;
    }
    setFile(selectedFile);
    setError(null);
    const text = await selectedFile.text();
    setPreview(text.slice(0, 500) + (text.length > 500 ? "\n..." : ""));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("blueprint", file);

      const res = await fetch("/api/producer/vacancies", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create vacancy");
        return;
      }

      addVacancy(data);
      onClose();
      setFile(null);
      setPreview(null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Open New Vacancy
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{
              background: "var(--color-bg-surface)",
              color: "var(--color-text-muted)",
            }}
          >
            ✕
          </button>
        </div>

        <p
          className="text-sm mb-4"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Upload a <strong>Global Hiring Blueprint</strong> (.md file) to
          create a new vacancy with auto-extracted competencies and scoring
          criteria.
        </p>

        {/* Dropzone */}
        <div
          className={`dropzone ${isDragOver ? "active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".md";
            input.onchange = (e) => {
              const f = (e.target as HTMLInputElement).files?.[0];
              if (f) handleFileSelect(f);
            };
            input.click();
          }}
        >
          {file ? (
            <div>
              <div className="text-2xl mb-2">📄</div>
              <p
                className="font-medium text-sm"
                style={{ color: "var(--color-text-primary)" }}
              >
                {file.name}
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                {(file.size / 1024).toFixed(1)} KB — Click to change
              </p>
            </div>
          ) : (
            <div>
              <div className="text-3xl mb-3">📋</div>
              <p
                className="font-medium text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Drop your Blueprint .md file here
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                or click to browse
              </p>
            </div>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <div className="mt-4">
            <p
              className="text-xs font-medium mb-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              PREVIEW
            </p>
            <pre
              className="text-xs p-3 rounded-lg overflow-x-auto max-h-40 overflow-y-auto"
              style={{
                background: "var(--color-bg-primary)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {preview}
            </pre>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="mt-4 p-3 rounded-lg text-sm"
            style={{
              background: "var(--color-danger-dim)",
              color: "var(--color-danger)",
            }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary flex-1"
            onClick={handleSubmit}
            disabled={!file || isUploading}
          >
            {isUploading ? "Parsing Blueprint..." : "Create Vacancy"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── VacancyCard ─── */
function VacancyCard({ vacancy }: { vacancy: Vacancy }) {
  const candidateCount = vacancy._count?.candidates ?? 0;
  const competencyCount = vacancy.competencies?.length ?? 0;

  return (
    <a
      href={`/producer/vacancies/${vacancy.id}`}
      className="glass-card block p-6 group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3
            className="text-lg font-semibold mb-1 group-hover:text-[var(--color-accent)] transition-colors"
            style={{ color: "var(--color-text-primary)" }}
          >
            {vacancy.title}
          </h3>
          <div
            className="flex items-center gap-3 text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            {vacancy.department && <span>{vacancy.department}</span>}
            {vacancy.location && (
              <>
                <span>•</span>
                <span>{vacancy.location}</span>
              </>
            )}
          </div>
        </div>
        <span className={`badge badge-${vacancy.status}`}>
          {vacancy.status}
        </span>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-6 mb-4">
        <div>
          <p
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-primary)",
            }}
          >
            {candidateCount}
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            Candidates
          </p>
        </div>
        <div>
          <p
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-primary)",
            }}
          >
            {competencyCount}
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            Competencies
          </p>
        </div>
        <div>
          <p
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-accent)",
            }}
          >
            {vacancy.acceptanceScore}
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            Min Score
          </p>
        </div>
      </div>

      {/* Competency Tags */}
      {vacancy.competencies && vacancy.competencies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {vacancy.competencies.slice(0, 6).map((comp) => (
            <span
              key={comp.id}
              className={`badge ${comp.category === "hard" ? "badge-hard" : "badge-soft"}`}
            >
              {comp.name}
            </span>
          ))}
        </div>
      )}

      {/* Salary Range */}
      {vacancy.salaryBudgetMin && vacancy.salaryBudgetMax && (
        <div
          className="mt-4 pt-4 text-xs flex items-center gap-2"
          style={{
            borderTop: "1px solid var(--color-border-subtle)",
            color: "var(--color-text-muted)",
          }}
        >
          <span>💰</span>
          <span>
            ${vacancy.salaryBudgetMin.toLocaleString()} — $
            {vacancy.salaryBudgetMax.toLocaleString()}
          </span>
        </div>
      )}
    </a>
  );
}

/* ─── Dashboard Page ─── */
export default function DashboardPage() {
  const {
    vacancies,
    setVacancies,
    isLoading,
    setLoading,
    isModalOpen,
    openModal,
    closeModal,
  } = useVacancyStore();

  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVacancies() {
      setLoading(true);
      try {
        const res = await fetch("/api/producer/vacancies");
        if (res.ok) {
          const data = await res.json();
          setVacancies(data);
        } else {
          setFetchError("Failed to load vacancies");
        }
      } catch {
        setFetchError("Network error");
      } finally {
        setLoading(false);
      }
    }
    loadVacancies();
  }, [setVacancies, setLoading]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Vacancy Dashboard
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {vacancies.length} active{" "}
            {vacancies.length === 1 ? "vacancy" : "vacancies"}
          </p>
        </div>
        <button className="btn-primary pulse-glow" onClick={openModal}>
          + Open New Vacancy
        </button>
      </div>

      {/* Error State */}
      {fetchError && (
        <div
          className="p-4 rounded-lg mb-6 text-sm"
          style={{
            background: "var(--color-danger-dim)",
            color: "var(--color-danger)",
          }}
        >
          {fetchError}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-card p-6 animate-pulse"
              style={{ height: "14rem" }}
            >
              <div
                className="h-5 rounded w-3/4 mb-4"
                style={{ background: "var(--color-bg-elevated)" }}
              />
              <div
                className="h-3 rounded w-1/2 mb-6"
                style={{ background: "var(--color-bg-elevated)" }}
              />
              <div className="flex gap-6">
                <div
                  className="h-12 w-12 rounded"
                  style={{ background: "var(--color-bg-elevated)" }}
                />
                <div
                  className="h-12 w-12 rounded"
                  style={{ background: "var(--color-bg-elevated)" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && vacancies.length === 0 && !fetchError && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📋</div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            No Vacancies Yet
          </h2>
          <p
            className="text-sm mb-6 max-w-md mx-auto"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Upload a Global Hiring Blueprint to create your first vacancy with
            auto-extracted competencies and scoring criteria.
          </p>
          <button className="btn-primary" onClick={openModal}>
            + Open New Vacancy
          </button>
        </div>
      )}

      {/* Vacancy Grid */}
      {!isLoading && vacancies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vacancies.map((vacancy) => (
            <VacancyCard key={vacancy.id} vacancy={vacancy} />
          ))}
        </div>
      )}

      {/* Modal */}
      <NewVacancyModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
