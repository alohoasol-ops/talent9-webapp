import type { ExtraRawScores, RawScores, TalentScores } from "./talents";

export interface TeamMember {
  id: string;
  companyId: string;
  name: string;
  measuredDate: string | null;
  raw: RawScores & Partial<ExtraRawScores>;
  scores: TalentScores;
  createdAt: string;
}

export interface DbTeamMemberRow {
  id: string;
  company_id: string;
  name: string;
  measured_date: string | null;
  raw_scores: RawScores & Partial<ExtraRawScores>;
  talent_scores: TalentScores;
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
    createdAt: row.created_at,
  };
}
