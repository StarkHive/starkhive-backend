export class TimeEntryChartData {
  date: string;
  hours: number;
  project: string;
}

export class ProjectSummary {
  projectName: string;
  totalHours: number;
  entries: any[];
}

export class ReportResponse {
  totalHours: number;
  projectSummary: Record<string, ProjectSummary>;
  timeEntries: any[];
  chartData: {
    daily: TimeEntryChartData[];
    byProject: {
      labels: string[];
      data: number[];
    };
  };
}
