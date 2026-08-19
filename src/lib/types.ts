import type { ExtraRawScores, RawScores, TalentScores } from "./talents";

export interface GoalSheet {
  strengthCompany: string;
  roleCompany: string;
  motivationCompany: string;
  threeMonthPersonal: string;
  threeMonthCompany: string;
  oneYearPersonal: string;
  oneYearCompany: string;
  actionPersonal: string;
  actionCompany: string;
}

export const DEFAULT_GOAL_SHEET: GoalSheet = {
  strengthCompany: "",
  roleCompany: "",
  motivationCompany: "",
  threeMonthPersonal: "",
  threeMonthCompany: "",
  oneYearPersonal: "",
  oneYearCompany: "",
  actionPersonal: "",
  actionCompany: "",
};

export interface TeamMember {
  id: string;
  companyId: string;
  name: string;
  measuredDate: string | null;
  raw: RawScores & Partial<ExtraRawScores>;
  scores: TalentScores;
  goalSheet: GoalSheet;
  previousScores: TalentScores | null;
  previousMeasuredDate: string | null;
  createdAt: string;
}

export interface DbTeamMemberRow {
  id: string;
  company_id: string;
  name: string;
  measured_date: string | null;
  raw_scores: RawScores & Partial<ExtraRawScores>;
  talent_scores: TalentScores;
  goal_sheet: Partial<GoalSheet> | null;
  previous_talent_scores: TalentScores | null;
  previous_measured_date: string | null;
  created_at: string;
}

export function fromDbRow(row: DbTeamMemberRow): TeamMember {
  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    measuredDate: row.measured_date,
    raw: row.raw_scores,
    scores: row.talent_scores,
    goalSheet: { ...DEFAULT_GOAL_SHEET, ...(row.goal_sheet || {}) },
    previousScores: row.previous_talent_scores ?? null,
    previousMeasuredDate: row.previous_measured_date ?? null,
    createdAt: row.created_at,
  };
}
