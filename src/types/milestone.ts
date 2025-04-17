export interface Milestone {
  milestoneID: string;
  title: string;
  description: string;
  startDate: string; // ISO 8601 format (e.g., "2025-03-18T20:24:38.797Z")
  endDate: string;
  projectID: String; // Liên kết với projectID từ Project
}
