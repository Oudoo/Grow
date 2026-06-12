/**
 * Blueprint Parser — Deterministic markdown parsing for Global Hiring Blueprints.
 * 
 * Uses remark (unified) to parse markdown into an AST and extract:
 * - Job Posting content (§1)
 * - Competency Framework with weights (§3)
 * - Acceptance Criteria (§4)
 * 
 * NO AI/LLM calls — purely regex + AST-based extraction.
 */

import { remark } from "remark";
import remarkHtml from "remark-html";
import type { Root, Heading, Content } from "mdast";
import type { ParsedBlueprint, CompetencyCategory } from "@/types/vacancy";

/**
 * Extract text content from an mdast node recursively.
 */
function extractText(node: Content): string {
  if ("value" in node) return node.value;
  if ("children" in node) {
    return (node.children as Content[]).map(extractText).join("");
  }
  return "";
}

/**
 * Find the index of a heading node matching a given pattern.
 */
function findHeadingIndex(
  children: Content[],
  depth: number,
  pattern: RegExp
): number {
  return children.findIndex(
    (node) =>
      node.type === "heading" &&
      (node as Heading).depth === depth &&
      pattern.test(extractText(node))
  );
}

/**
 * Extract all nodes between two headings of the same depth.
 */
function extractSection(
  children: Content[],
  startIdx: number,
  depth: number
): Content[] {
  const section: Content[] = [];
  for (let i = startIdx + 1; i < children.length; i++) {
    const node = children[i];
    if (node.type === "heading" && (node as Heading).depth <= depth) break;
    section.push(node);
  }
  return section;
}

/**
 * Parse competency lines using regex.
 * Expected format: "1. Skill Name — Weight: 25%"
 * Supports various dash characters: -, –, —
 */
const COMPETENCY_REGEX =
  /^(\d+)\.\s+(.+?)\s*[-–—]+\s*Weight:\s*(\d+)%/i;

function parseCompetencies(
  lines: string[],
  category: CompetencyCategory,
  startOrder: number
): { name: string; category: CompetencyCategory; weight: number; order: number }[] {
  const competencies: { name: string; category: CompetencyCategory; weight: number; order: number }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = COMPETENCY_REGEX.exec(trimmed);
    if (match) {
      competencies.push({
        name: match[2].trim(),
        category,
        weight: parseInt(match[3], 10) / 100,
        order: startOrder + competencies.length,
      });
    }
  }
  return competencies;
}

/**
 * Extract the title from the blueprint's top-level heading.
 * Expected: "# Global Hiring Blueprint — [Job Title]"
 */
function extractTitle(children: Content[]): string {
  const h1 = children.find(
    (n) => n.type === "heading" && (n as Heading).depth === 1
  );
  if (!h1) return "Untitled Vacancy";
  const text = extractText(h1);
  // Try to extract after the dash
  const dashMatch = /[-–—]\s*(.+)$/.exec(text);
  return dashMatch ? dashMatch[1].trim() : text.trim();
}

/**
 * Parse acceptance criteria section.
 * Expected format:
 *   Minimum Composite Score: 3.8
 *   Salary Budget: $80,000 — $120,000
 */
function parseAcceptanceCriteria(sectionText: string): {
  acceptanceScore: number;
  salaryBudgetMin: number | null;
  salaryBudgetMax: number | null;
} {
  const scoreMatch = /Minimum\s+Composite\s+Score:\s*([\d.]+)/i.exec(sectionText);
  const salaryMatch =
    /Salary\s+Budget:\s*\$?([\d,]+)\s*[-–—]+\s*\$?([\d,]+)/i.exec(sectionText);

  return {
    acceptanceScore: scoreMatch ? parseFloat(scoreMatch[1]) : 3.8,
    salaryBudgetMin: salaryMatch
      ? parseFloat(salaryMatch[1].replace(/,/g, ""))
      : null,
    salaryBudgetMax: salaryMatch
      ? parseFloat(salaryMatch[2].replace(/,/g, ""))
      : null,
  };
}

/**
 * Extract department and location from the job posting section.
 */
function extractMetadata(sectionText: string): {
  department: string | null;
  location: string | null;
} {
  const deptMatch = /\*\*Department:\*\*\s*(.+)/i.exec(sectionText);
  const locMatch = /\*\*Location:\*\*\s*(.+)/i.exec(sectionText);
  return {
    department: deptMatch ? deptMatch[1].trim() : null,
    location: locMatch ? locMatch[1].trim() : null,
  };
}

/**
 * Main parser function. Takes raw markdown string, returns structured ParsedBlueprint.
 */
export async function parseBlueprint(
  markdownContent: string
): Promise<ParsedBlueprint> {
  // Parse to AST
  const processor = remark();
  const tree = processor.parse(markdownContent) as Root;
  const children = tree.children as Content[];

  // 1. Extract title
  const title = extractTitle(children);

  // 2. Extract Job Posting section (§1)
  const jobPostingIdx = findHeadingIndex(children, 2, /1\.\s*The\s+Job\s+Posting/i);
  const jobPostingNodes =
    jobPostingIdx >= 0 ? extractSection(children, jobPostingIdx, 2) : [];

  // Build a sub-tree for the job posting and convert to HTML
  const jobPostingTree: Root = { type: "root", children: jobPostingNodes };
  const htmlResult = await remark().use(remarkHtml).stringify(
    (await remark().use(remarkHtml).run(jobPostingTree)) as Root
  );
  const jobPostingHtml = String(htmlResult);

  // Also get the raw markdown for the job posting
  const jobPostingStartLine = jobPostingIdx >= 0 ? (children[jobPostingIdx] as Heading).position?.start?.offset ?? 0 : 0;
  const nextH2AfterJob = children.findIndex(
    (n, i) =>
      i > jobPostingIdx &&
      n.type === "heading" &&
      (n as Heading).depth === 2
  );
  const jobPostingEndOffset = nextH2AfterJob >= 0
    ? (children[nextH2AfterJob] as Heading).position?.start?.offset ?? markdownContent.length
    : markdownContent.length;
  const jobPostingMarkdown = markdownContent.slice(jobPostingStartLine, jobPostingEndOffset).trim();

  // Extract metadata from job posting
  const jobPostingText = jobPostingNodes.map(extractText).join("\n");
  const { department, location } = extractMetadata(jobPostingText);

  // 3. Extract Competency Framework (§3)
  const competencyIdx = findHeadingIndex(
    children,
    2,
    /3\.\s*Competency\s+Framework/i
  );
  const competencyNodes =
    competencyIdx >= 0 ? extractSection(children, competencyIdx, 2) : [];
  const competencyText = competencyNodes.map(extractText).join("\n");
  const competencyLines = competencyText.split("\n");

  // Split into hard and soft skills at the "### Soft Skills" boundary
  const softSkillHeaderIdx = competencyLines.findIndex((l) =>
    /Soft\s+Skills/i.test(l)
  );

  const hardSkillLines =
    softSkillHeaderIdx >= 0
      ? competencyLines.slice(0, softSkillHeaderIdx)
      : competencyLines;
  const softSkillLines =
    softSkillHeaderIdx >= 0 ? competencyLines.slice(softSkillHeaderIdx) : [];

  const hardSkills = parseCompetencies(hardSkillLines, "hard", 0);
  const softSkills = parseCompetencies(softSkillLines, "soft", hardSkills.length);

  // 4. Extract Acceptance Criteria (§4)
  const acceptanceIdx = findHeadingIndex(
    children,
    2,
    /4\.\s*Acceptance\s+Criteria/i
  );
  const acceptanceNodes =
    acceptanceIdx >= 0 ? extractSection(children, acceptanceIdx, 2) : [];
  const acceptanceText = acceptanceNodes.map(extractText).join("\n");
  const { acceptanceScore, salaryBudgetMin, salaryBudgetMax } =
    parseAcceptanceCriteria(acceptanceText);

  return {
    title,
    department,
    location,
    salaryBudgetMin,
    salaryBudgetMax,
    acceptanceScore,
    jobPostingMarkdown,
    jobPostingHtml,
    competencies: [...hardSkills, ...softSkills],
  };
}
