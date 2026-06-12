/**
 * CV Parser — Deterministic parsing of Standardized CV markdown files.
 *
 * Uses gray-matter for YAML frontmatter extraction and regex for skill sections.
 * NO AI/LLM calls — purely structured parsing.
 */

import matter from "gray-matter";
import type { ParsedCV } from "@/types/candidate";

/**
 * Extract bullet-pointed items from a markdown section.
 * Matches lines starting with "- " or "* "
 */
function extractBulletItems(text: string): string[] {
  const lines = text.split("\n");
  const items: string[] = [];
  for (const line of lines) {
    const match = /^[-*]\s+(.+)/.exec(line.trim());
    if (match) {
      // Extract just the skill name (before the colon if present)
      const skillName = match[1].split(":")[0].trim();
      items.push(skillName);
    }
  }
  return items;
}

/**
 * Extract a section's content between its heading and the next ## heading.
 */
function extractSectionContent(
  body: string,
  sectionPattern: RegExp
): string | null {
  const lines = body.split("\n");
  let capturing = false;
  const captured: string[] = [];

  for (const line of lines) {
    if (sectionPattern.test(line)) {
      capturing = true;
      continue;
    }
    if (capturing && /^##\s+/.test(line)) {
      break;
    }
    if (capturing) {
      captured.push(line);
    }
  }

  return captured.length > 0 ? captured.join("\n") : null;
}

/**
 * Main CV parser function.
 * Takes raw markdown string with YAML frontmatter, returns structured ParsedCV.
 */
export function parseCV(markdownContent: string): ParsedCV {
  // 1. Extract YAML frontmatter using gray-matter
  const { data: frontmatter, content: body } = matter(markdownContent);

  // 2. Validate required fields
  const name = String(frontmatter.name || "Unknown");
  const email = String(frontmatter.email || "");
  const phone = frontmatter.phone ? String(frontmatter.phone) : null;
  const yearsExperience =
    typeof frontmatter.years_experience === "number"
      ? frontmatter.years_experience
      : frontmatter.years_experience
        ? parseFloat(String(frontmatter.years_experience))
        : null;
  const expectedSalary =
    typeof frontmatter.expected_salary === "number"
      ? frontmatter.expected_salary
      : frontmatter.expected_salary
        ? parseFloat(String(frontmatter.expected_salary))
        : null;

  // 3. Parse Hard Skills section
  const hardSkillsText = extractSectionContent(body, /^##\s+Hard\s+Skills/i);
  const hardSkills = hardSkillsText ? extractBulletItems(hardSkillsText) : [];

  // 4. Parse Soft Skills section
  const softSkillsText = extractSectionContent(body, /^##\s+Soft\s+Skills/i);
  const softSkills = softSkillsText ? extractBulletItems(softSkillsText) : [];

  return {
    name,
    email,
    phone,
    yearsExperience,
    expectedSalary,
    hardSkills,
    softSkills,
    rawContent: markdownContent,
  };
}
