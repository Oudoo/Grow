"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

/* ─── Types (inline for self-contained page) ─── */
interface Competency {
  id: string;
  name: string;
  category: string;
  weight: number;
  order: number;
}

interface ScoreRecord {
  id: string;
  competencyId: string;
  value: number;
  notes: string | null;
}

interface ScorecardRecord {
  id: string;
  managerName: string;
  submittedAt: string;
  scores: ScoreRecord[];
}

interface OfferRecord {
  id: string;
  offeredSalary: number;
  firstWorkingDate: string;
  contractType: string;
  itEquipment: string | null;
  status: string;
}

interface CandidateRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  yearsExperience: number | null;
  expectedSalary: number | null;
  portfolioUrl: string | null;
  portfolioTitle: string | null;
  portfolioImage: string | null;
  portfolioDesc: string | null;
  compositeScore: number | null;
  status: string;
  scorecards: ScorecardRecord[];
  offer: OfferRecord | null;
}

interface VacancyDetail {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  salaryBudgetMin: number | null;
  salaryBudgetMax: number | null;
  acceptanceScore: number;
  jobPostingHtml: string;
  status: string;
  competencies: Competency[];
  candidates: CandidateRecord[];
}

interface VarianceResult {
  competencyId: string;
  competencyName: string;
  scores: { manager: string; value: number }[];
  maxVariance: number;
  requiresConsensus: boolean;
}

/* ─── StatusBadge ─── */
function StatusBadge({ status }: { status: string }) {
  const badgeClass =
    status === "passed"
      ? "badge-passed"
      : status === "rejected"
        ? "badge-rejected"
        : status === "scoring"
          ? "badge-scoring"
          : status === "offer_sent" || status === "hired"
            ? "badge-open"
            : "badge-pending";
  return (
    <span className={`badge ${badgeClass}`}>
      {status.replace("_", " ")}
    </span>
  );
}

/* ─── AddCandidateModal ─── */
function AddCandidateModal({
  isOpen,
  onClose,
  vacancyId,
  onAdded,
}: {
  isOpen: boolean;
  onClose: () => void;
  vacancyId: string;
  onAdded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".md")) {
      setError("Only .md files are accepted");
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("cv", file);
      formData.append("vacancyId", vacancyId);
      if (portfolioUrl) formData.append("portfolioUrl", portfolioUrl);

      const res = await fetch("/api/producer/candidates", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add candidate");
        return;
      }
      onAdded();
      onClose();
      setFile(null);
      setPortfolioUrl("");
    } catch {
      setError("Network error");
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
            Add Candidate
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
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
          Upload a <strong>Standardized CV</strong> (.md with YAML frontmatter)
          and optionally provide a portfolio URL.
        </p>

        {/* CV Upload */}
        <div
          className={`dropzone mb-4 ${isDragOver ? "active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFileSelect(f);
          }}
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
            </div>
          ) : (
            <div>
              <div className="text-3xl mb-3">👤</div>
              <p
                className="font-medium text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Drop Candidate CV (.md)
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                YAML frontmatter with name, email, expected_salary, etc.
              </p>
            </div>
          )}
        </div>

        {/* Portfolio URL */}
        <div className="mb-4">
          <label
            className="text-xs font-medium mb-1.5 block"
            style={{ color: "var(--color-text-muted)" }}
          >
            Portfolio URL (optional)
          </label>
          <input
            type="url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://portfolio.example.com"
            className="input-field"
          />
        </div>

        {error && (
          <div
            className="p-3 rounded-lg text-sm mb-4"
            style={{
              background: "var(--color-danger-dim)",
              color: "var(--color-danger)",
            }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary flex-1"
            onClick={handleSubmit}
            disabled={!file || isUploading}
          >
            {isUploading ? "Processing CV..." : "Add Candidate"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── ScorecardModal ─── */
function ScorecardModal({
  isOpen,
  onClose,
  candidateId,
  candidateName,
  competencies,
  onSubmitted,
}: {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  competencies: Competency[];
  onSubmitted: () => void;
}) {
  const [managerName, setManagerName] = useState("");
  const [scores, setScores] = useState<
    Record<string, { value: number; notes: string }>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize scores
    const initial: Record<string, { value: number; notes: string }> = {};
    competencies.forEach((c) => {
      initial[c.id] = { value: 3, notes: "" };
    });
    setScores(initial);
  }, [competencies]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!managerName.trim()) {
      setError("Manager name is required");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/producer/scorecards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          managerName: managerName.trim(),
          scores: Object.entries(scores).map(([competencyId, s]) => ({
            competencyId,
            value: s.value,
            notes: s.notes,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit scorecard");
        return;
      }

      onSubmitted();
      onClose();
      setManagerName("");
    } catch {
      setError("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scoreLabels = ["", "Poor", "Below Avg", "Average", "Good", "Exceptional"];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: "52rem" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Score: {candidateName}
            </h2>
            <p
              className="text-sm mt-0.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              Rate each competency from 1 (Poor) to 5 (Exceptional)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--color-bg-surface)",
              color: "var(--color-text-muted)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Manager Name */}
        <div className="mb-6">
          <label
            className="text-xs font-medium mb-1.5 block"
            style={{ color: "var(--color-text-muted)" }}
          >
            YOUR NAME (MANAGER)
          </label>
          <input
            type="text"
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
            placeholder="e.g., Sarah Johnson"
            className="input-field"
          />
        </div>

        {/* Competency Scoring */}
        <div className="space-y-6">
          {competencies.map((comp) => (
            <div
              key={comp.id}
              className="p-4 rounded-xl"
              style={{
                background: "var(--color-bg-primary)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm" style={{ color: "var(--color-text-primary)" }}>
                    {comp.name}
                  </span>
                  <span
                    className={`badge ${comp.category === "hard" ? "badge-hard" : "badge-soft"}`}
                  >
                    {comp.category}
                  </span>
                </div>
                <span
                  className="text-xs"
                  style={{
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Weight: {(comp.weight * 100).toFixed(0)}%
                </span>
              </div>

              {/* Slider */}
              <div className="mb-2">
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={scores[comp.id]?.value ?? 3}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [comp.id]: {
                          ...prev[comp.id],
                          value: parseInt(e.target.value),
                        },
                      }))
                    }
                    className="score-slider flex-1"
                  />
                  <div
                    className="w-16 text-center py-1 rounded-lg text-sm font-bold"
                    style={{
                      background: "var(--color-accent-dim)",
                      color: "var(--color-accent)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {scores[comp.id]?.value ?? 3}/5
                  </div>
                </div>
                <div
                  className="flex justify-between text-xs mt-1 px-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n}>{scoreLabels[n]}</span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <textarea
                value={scores[comp.id]?.notes ?? ""}
                onChange={(e) =>
                  setScores((prev) => ({
                    ...prev,
                    [comp.id]: {
                      ...prev[comp.id],
                      notes: e.target.value,
                    },
                  }))
                }
                placeholder="Manager notes for this competency..."
                className="textarea-field mt-2"
                style={{ minHeight: "3rem" }}
              />
            </div>
          ))}
        </div>

        {error && (
          <div
            className="p-3 rounded-lg text-sm mt-4"
            style={{
              background: "var(--color-danger-dim)",
              color: "var(--color-danger)",
            }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary flex-1"
            onClick={handleSubmit}
            disabled={isSubmitting || !managerName.trim()}
          >
            {isSubmitting ? "Submitting..." : "Submit Scorecard"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── VarianceResolutionModal ─── */
function VarianceResolutionModal({
  isOpen,
  onClose,
  candidateId,
  candidateName,
  varianceResults,
  onResolved,
}: {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  varianceResults: VarianceResult[];
  onResolved: () => void;
}) {
  const flagged = varianceResults.filter((v) => v.requiresConsensus);
  const [consensusScores, setConsensusScores] = useState<
    Record<string, number>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initial: Record<string, number> = {};
    flagged.forEach((v) => {
      initial[v.competencyId] = 3;
    });
    setConsensusScores(initial);
  }, [varianceResults]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen || flagged.length === 0) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/producer/scorecards/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          consensusScores: Object.entries(consensusScores).map(
            ([competencyId, value]) => ({ competencyId, value })
          ),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to finalize");
        return;
      }
      onResolved();
      onClose();
    } catch {
      setError("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            ⚠️ Variance Alert — {candidateName}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--color-bg-surface)",
              color: "var(--color-text-muted)",
            }}
          >
            ✕
          </button>
        </div>

        <div className="variance-alert mb-4">
          <p className="text-sm font-medium" style={{ color: "var(--color-danger)" }}>
            Score variance ≥ 2 detected on {flagged.length} competenc
            {flagged.length === 1 ? "y" : "ies"}. Managers must agree on a
            consensus score to proceed.
          </p>
        </div>

        <div className="space-y-4">
          {flagged.map((v) => (
            <div
              key={v.competencyId}
              className="p-4 rounded-xl"
              style={{
                background: "var(--color-bg-primary)",
                border: "1px solid oklch(0.65 0.22 25 / 0.2)",
              }}
            >
              <p
                className="font-medium text-sm mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                {v.competencyName}{" "}
                <span
                  className="text-xs"
                  style={{
                    color: "var(--color-danger)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  (Δ{v.maxVariance})
                </span>
              </p>

              {/* Manager scores comparison */}
              <div className="flex gap-3 mb-3">
                {v.scores.map((s) => (
                  <div
                    key={s.manager}
                    className="flex-1 text-center p-2 rounded-lg"
                    style={{ background: "var(--color-bg-surface)" }}
                  >
                    <p
                      className="text-xs mb-1"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {s.manager}
                    </p>
                    <p
                      className="text-lg font-bold"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {s.value}/5
                    </p>
                  </div>
                ))}
              </div>

              {/* Consensus input */}
              <div className="flex items-center gap-3">
                <label
                  className="text-xs font-medium"
                  style={{ color: "var(--color-warning)" }}
                >
                  Consensus:
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() =>
                        setConsensusScores((prev) => ({
                          ...prev,
                          [v.competencyId]: n,
                        }))
                      }
                      className="w-9 h-9 rounded-lg text-sm font-bold transition-all"
                      style={{
                        background:
                          consensusScores[v.competencyId] === n
                            ? "var(--color-accent)"
                            : "var(--color-bg-surface)",
                        color:
                          consensusScores[v.competencyId] === n
                            ? "oklch(0.1 0.02 260)"
                            : "var(--color-text-secondary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div
            className="p-3 rounded-lg text-sm mt-4"
            style={{
              background: "var(--color-danger-dim)",
              color: "var(--color-danger)",
            }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary flex-1"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Finalizing..." : "Submit Consensus & Finalize"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── OfferModal ─── */
function OfferModal({
  isOpen,
  onClose,
  candidate,
  salaryBudgetMin,
  salaryBudgetMax,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateRecord;
  salaryBudgetMin: number | null;
  salaryBudgetMax: number | null;
  onCreated: () => void;
}) {
  const [offeredSalary, setOfferedSalary] = useState(
    candidate.expectedSalary?.toString() ?? ""
  );
  const [firstWorkingDate, setFirstWorkingDate] = useState("");
  const [contractType, setContractType] = useState("full-time");
  const [itEquipment, setItEquipment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const offered = parseFloat(offeredSalary) || 0;
  const expected = candidate.expectedSalary ?? 0;
  const maxBudget = salaryBudgetMax ?? Infinity;
  const minBudget = salaryBudgetMin ?? 0;

  // Salary comparison logic
  const getSalaryStatus = () => {
    if (expected <= maxBudget) return { color: "var(--color-success)", label: "Within Budget" };
    if (expected <= maxBudget * 1.1) return { color: "var(--color-warning)", label: "Slightly Over (+10%)" };
    return { color: "var(--color-danger)", label: "Over Budget" };
  };
  const salaryStatus = getSalaryStatus();

  const handleSubmit = async () => {
    if (!offeredSalary || !firstWorkingDate) {
      setError("Salary and first working date are required");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/producer/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: candidate.id,
          offeredSalary: parseFloat(offeredSalary),
          firstWorkingDate,
          contractType,
          itEquipment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create offer");
        return;
      }
      onCreated();
      onClose();
    } catch {
      setError("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate bar widths for visualization
  const maxVal = Math.max(expected, maxBudget, offered) * 1.15;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Generate Offer — {candidate.name}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--color-bg-surface)",
              color: "var(--color-text-muted)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Salary Comparison */}
        <div
          className="p-4 rounded-xl mb-6"
          style={{
            background: "var(--color-bg-primary)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <p
            className="text-xs font-medium mb-3"
            style={{ color: "var(--color-text-muted)" }}
          >
            SALARY COMPARISON
          </p>

          {/* Budget Range Bar */}
          <div className="mb-3">
            <p
              className="text-xs mb-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Vacancy Budget
            </p>
            <div className="salary-bar" style={{
              width: `${((maxBudget || 0) / maxVal) * 100}%`,
              background: "linear-gradient(90deg, var(--color-accent-dim), var(--color-accent-dim))",
              color: "var(--color-accent)",
              minWidth: "120px",
            }}>
              ${minBudget.toLocaleString()} — ${(maxBudget === Infinity ? "∞" : maxBudget.toLocaleString())}
            </div>
          </div>

          {/* Expected Salary Bar */}
          <div className="mb-3">
            <p
              className="text-xs mb-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Candidate Expected
            </p>
            <div className="salary-bar" style={{
              width: `${(expected / maxVal) * 100}%`,
              background: salaryStatus.color === "var(--color-success)"
                ? "var(--color-success-dim)"
                : salaryStatus.color === "var(--color-warning)"
                  ? "var(--color-warning-dim)"
                  : "var(--color-danger-dim)",
              color: salaryStatus.color,
              minWidth: "100px",
            }}>
              ${expected.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: salaryStatus.color }}
            />
            <span className="text-xs font-medium" style={{ color: salaryStatus.color }}>
              {salaryStatus.label}
            </span>
          </div>
        </div>

        {/* Offer Form */}
        <div className="space-y-4">
          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              OFFERED SALARY ($)
            </label>
            <input
              type="number"
              value={offeredSalary}
              onChange={(e) => setOfferedSalary(e.target.value)}
              placeholder="e.g., 95000"
              className="input-field"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </div>

          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              FIRST WORKING DATE
            </label>
            <input
              type="date"
              value={firstWorkingDate}
              onChange={(e) => setFirstWorkingDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              CONTRACT TYPE
            </label>
            <select
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
              className="input-field"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
            </select>
          </div>

          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              IT EQUIPMENT REQUIRED
            </label>
            <input
              type="text"
              value={itEquipment}
              onChange={(e) => setItEquipment(e.target.value)}
              placeholder="e.g., MacBook Pro 16&quot;, Monitor, Keyboard"
              className="input-field"
            />
          </div>
        </div>

        {error && (
          <div
            className="p-3 rounded-lg text-sm mt-4"
            style={{
              background: "var(--color-danger-dim)",
              color: "var(--color-danger)",
            }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary flex-1"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Offer..." : "Generate Offer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── CandidateRow ─── */
function CandidateRow({
  candidate,
  competencies,
  salaryBudgetMin,
  salaryBudgetMax,
  onRefresh,
}: {
  candidate: CandidateRecord;
  competencies: Competency[];
  salaryBudgetMin: number | null;
  salaryBudgetMax: number | null;
  onRefresh: () => void;
}) {
  const [showScorecard, setShowScorecard] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [showVariance, setShowVariance] = useState(false);
  const [varianceData, setVarianceData] = useState<VarianceResult[]>([]);
  const [scorecardInfo, setScorecardInfo] = useState<{
    compositeScore: number | null;
    hasVariance: boolean;
    scorecardCount: number;
  }>({ compositeScore: null, hasVariance: false, scorecardCount: 0 });

  const loadScorecardInfo = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/producer/scorecards?candidateId=${candidate.id}`
      );
      if (res.ok) {
        const data = await res.json();
        setScorecardInfo({
          compositeScore: data.compositeScore,
          hasVariance: data.hasVariance,
          scorecardCount: data.scorecards?.length ?? 0,
        });
        if (data.hasVariance) {
          setVarianceData(data.varianceResults);
        }
      }
    } catch {
      // silently fail
    }
  }, [candidate.id]);

  useEffect(() => {
    if (candidate.scorecards.length > 0) {
      loadScorecardInfo();
    }
  }, [candidate.scorecards.length, loadScorecardInfo]);

  const handleFinalizeWithoutVariance = async () => {
    try {
      const res = await fetch("/api/producer/scorecards/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidate.id }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch {
      // silently fail
    }
  };

  return (
    <>
      <div className="glass-card p-5 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Avatar */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold"
              style={{
                background: "var(--color-accent-dim)",
                color: "var(--color-accent)",
              }}
            >
              {candidate.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="font-semibold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {candidate.name}
                </span>
                <StatusBadge status={candidate.status} />
              </div>
              <div
                className="flex items-center gap-3 text-xs mt-0.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                <span>{candidate.email}</span>
                {candidate.yearsExperience && (
                  <>
                    <span>•</span>
                    <span>{candidate.yearsExperience} yrs exp</span>
                  </>
                )}
                {candidate.expectedSalary && (
                  <>
                    <span>•</span>
                    <span>${candidate.expectedSalary.toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>

            {/* Score */}
            {candidate.compositeScore !== null && (
              <div
                className="score-ring"
                style={{
                  color:
                    candidate.compositeScore >= 3.8
                      ? "var(--color-success)"
                      : "var(--color-danger)",
                  borderColor:
                    candidate.compositeScore >= 3.8
                      ? "var(--color-success)"
                      : "var(--color-danger)",
                }}
              >
                {candidate.compositeScore.toFixed(1)}
              </div>
            )}

            {/* Portfolio Card */}
            {candidate.portfolioUrl && (
              <a
                href={candidate.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-xs"
                style={{
                  background: "var(--color-bg-surface)",
                  color: "var(--color-text-secondary)",
                  border: "1px solid var(--color-border-subtle)",
                }}
              >
                {candidate.portfolioImage && (
                  <img
                    src={candidate.portfolioImage}
                    alt="Portfolio"
                    className="w-8 h-8 rounded object-cover"
                  />
                )}
                <span>{candidate.portfolioTitle || "Portfolio"} ↗</span>
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            {/* Score button */}
            <button
              className="btn-secondary text-xs px-3 py-1.5"
              onClick={() => setShowScorecard(true)}
            >
              📝 Score
            </button>

            {/* Variance resolution */}
            {scorecardInfo.hasVariance && (
              <button
                className="btn-danger text-xs px-3 py-1.5"
                onClick={() => setShowVariance(true)}
              >
                ⚠️ Resolve Variance
              </button>
            )}

            {/* Finalize without variance */}
            {scorecardInfo.scorecardCount > 0 &&
              !scorecardInfo.hasVariance &&
              candidate.status === "scoring" && (
                <button
                  className="btn-primary text-xs px-3 py-1.5"
                  onClick={handleFinalizeWithoutVariance}
                >
                  ✓ Finalize
                </button>
              )}

            {/* Generate Offer */}
            {candidate.status === "passed" && !candidate.offer && (
              <button
                className="btn-primary text-xs px-3 py-1.5"
                onClick={() => setShowOffer(true)}
              >
                📄 Generate Offer
              </button>
            )}

            {/* Offer sent indicator */}
            {candidate.offer && (
              <span
                className="badge badge-open"
              >
                Offer: ${candidate.offer.offeredSalary.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ScorecardModal
        isOpen={showScorecard}
        onClose={() => setShowScorecard(false)}
        candidateId={candidate.id}
        candidateName={candidate.name}
        competencies={competencies}
        onSubmitted={() => {
          loadScorecardInfo();
          onRefresh();
        }}
      />

      <VarianceResolutionModal
        isOpen={showVariance}
        onClose={() => setShowVariance(false)}
        candidateId={candidate.id}
        candidateName={candidate.name}
        varianceResults={varianceData}
        onResolved={onRefresh}
      />

      {showOffer && (
        <OfferModal
          isOpen={showOffer}
          onClose={() => setShowOffer(false)}
          candidate={candidate}
          salaryBudgetMin={salaryBudgetMin}
          salaryBudgetMax={salaryBudgetMax}
          onCreated={onRefresh}
        />
      )}
    </>
  );
}

/* ─── VacancyDetailPage ─── */
export default function VacancyDetailPage() {
  const params = useParams();
  const vacancyId = params.id as string;
  const [vacancy, setVacancy] = useState<VacancyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddCandidate, setShowAddCandidate] = useState(false);

  const loadVacancy = useCallback(async () => {
    try {
      const res = await fetch(`/api/producer/vacancies/${vacancyId}`);
      if (res.ok) {
        const data = await res.json();
        setVacancy(data);
      } else {
        setError("Vacancy not found");
      }
    } catch {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  }, [vacancyId]);

  useEffect(() => {
    loadVacancy();
  }, [loadVacancy]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div
          className="h-8 rounded w-1/3"
          style={{ background: "var(--color-bg-surface)" }}
        />
        <div
          className="h-4 rounded w-1/2"
          style={{ background: "var(--color-bg-surface)" }}
        />
        <div
          className="h-64 rounded-xl"
          style={{ background: "var(--color-bg-surface)" }}
        />
      </div>
    );
  }

  if (error || !vacancy) {
    return (
      <div className="text-center py-20">
        <p style={{ color: "var(--color-danger)" }}>{error || "Not found"}</p>
        <a href="/" className="btn-secondary inline-block mt-4">
          ← Back to Dashboard
        </a>
      </div>
    );
  }

  // Group candidates by status for pipeline view
  const pipeline: Record<string, CandidateRecord[]> = {
    pending: [],
    scoring: [],
    passed: [],
    rejected: [],
    offer_sent: [],
    hired: [],
  };
  vacancy.candidates.forEach((c) => {
    if (pipeline[c.status]) pipeline[c.status].push(c);
  });

  const pipelineStages = [
    { key: "pending", label: "Pending", icon: "⏳" },
    { key: "scoring", label: "Scoring", icon: "📝" },
    { key: "passed", label: "Passed", icon: "✅" },
    { key: "rejected", label: "Rejected", icon: "❌" },
    { key: "offer_sent", label: "Offer Sent", icon: "📄" },
    { key: "hired", label: "Hired", icon: "🎉" },
  ];

  return (
    <div>
      {/* Back link */}
      <a
        href="/"
        className="inline-flex items-center gap-1 text-sm mb-6 transition-colors"
        style={{ color: "var(--color-text-muted)" }}
      >
        ← Dashboard
      </a>

      {/* Vacancy Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            {vacancy.title}
          </h1>
          <div
            className="flex items-center gap-3 text-sm mt-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {vacancy.department && <span>{vacancy.department}</span>}
            {vacancy.location && (
              <>
                <span>•</span>
                <span>{vacancy.location}</span>
              </>
            )}
            <span>•</span>
            <StatusBadge status={vacancy.status} />
          </div>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowAddCandidate(true)}
        >
          + Add Candidate
        </button>
      </div>

      {/* Competency Framework */}
      <div className="glass-card p-6 mb-8">
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          Competency Framework
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {vacancy.competencies.map((comp) => (
            <div
              key={comp.id}
              className="p-3 rounded-xl text-center"
              style={{
                background: "var(--color-bg-primary)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <span
                className={`badge ${comp.category === "hard" ? "badge-hard" : "badge-soft"} mb-2`}
              >
                {comp.category}
              </span>
              <p
                className="text-sm font-medium mt-1"
                style={{ color: "var(--color-text-primary)" }}
              >
                {comp.name}
              </p>
              <p
                className="text-lg font-bold mt-1"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-accent)",
                }}
              >
                {(comp.weight * 100).toFixed(0)}%
              </p>
            </div>
          ))}
        </div>
        <div
          className="mt-4 pt-4 flex items-center gap-4 text-sm"
          style={{
            borderTop: "1px solid var(--color-border-subtle)",
            color: "var(--color-text-muted)",
          }}
        >
          <span>
            Min Score:{" "}
            <strong style={{ color: "var(--color-accent)", fontFamily: "var(--font-mono)" }}>
              {vacancy.acceptanceScore}
            </strong>
          </span>
          {vacancy.salaryBudgetMin && vacancy.salaryBudgetMax && (
            <span>
              Budget: ${vacancy.salaryBudgetMin.toLocaleString()} — $
              {vacancy.salaryBudgetMax.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="mb-6">
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          Pipeline
        </h2>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {pipelineStages.map((stage) => (
            <div
              key={stage.key}
              className="flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap"
              style={{
                background:
                  pipeline[stage.key].length > 0
                    ? "var(--color-bg-surface)"
                    : "var(--color-bg-primary)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <span>{stage.icon}</span>
              <span
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {stage.label}
              </span>
              <span
                className="text-sm font-bold"
                style={{
                  fontFamily: "var(--font-mono)",
                  color:
                    pipeline[stage.key].length > 0
                      ? "var(--color-accent)"
                      : "var(--color-text-muted)",
                }}
              >
                {pipeline[stage.key].length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate List */}
      <div>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          Candidates ({vacancy.candidates.length})
        </h2>

        {vacancy.candidates.length === 0 ? (
          <div
            className="text-center py-12 rounded-xl"
            style={{
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-subtle)",
            }}
          >
            <div className="text-4xl mb-3">👤</div>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              No candidates yet.{" "}
              <button
                onClick={() => setShowAddCandidate(true)}
                className="underline"
                style={{ color: "var(--color-accent)" }}
              >
                Add your first candidate
              </button>
            </p>
          </div>
        ) : (
          <div>
            {vacancy.candidates.map((candidate) => (
              <CandidateRow
                key={candidate.id}
                candidate={candidate}
                competencies={vacancy.competencies}
                salaryBudgetMin={vacancy.salaryBudgetMin}
                salaryBudgetMax={vacancy.salaryBudgetMax}
                onRefresh={loadVacancy}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Candidate Modal */}
      <AddCandidateModal
        isOpen={showAddCandidate}
        onClose={() => setShowAddCandidate(false)}
        vacancyId={vacancy.id}
        onAdded={loadVacancy}
      />
    </div>
  );
}
