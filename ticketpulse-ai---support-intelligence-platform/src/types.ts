export interface Ticket {
  ticket_id: string;
  created_at: string;
  category: 'Billing' | 'Technical' | 'General' | string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  status: 'Open' | 'Resolved' | 'Escalated' | string;
  response_time_hrs: number;
  resolution_time_hrs: number | null;
  agent_id: string;
  customer_rating: number | null;
  issue_summary: string;
}

export interface AnomalyItem {
  id: string;
  ticket_id: string;
  type: 'RESOLUTION_OUTLIER' | 'UNRESOLVED_SLA_BREACH' | 'LOW_RATING_INCIDENT' | 'RESPONSE_DELAY' | 'ESCALATED_STALLED' | 'AGENT_DEVIATION';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  metric_value: string;
  threshold: string;
  recommendation: string;
  ticket: Ticket;
}

export interface AgentMetric {
  agent_id: string;
  total_assigned: number;
  resolved_count: number;
  open_count: number;
  escalated_count: number;
  avg_rating: number | null;
  avg_resolution_hrs: number | null;
  avg_response_hrs: number;
}

export interface DatasetSummary {
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  escalated_tickets: number;
  avg_response_time_hrs: number;
  avg_resolution_time_hrs: number;
  avg_customer_rating: number;
  resolution_rate_percent: number;
  category_breakdown: Record<string, number>;
  priority_breakdown: Record<string, number>;
  status_breakdown: Record<string, number>;
  total_agents: number;
  agent_rankings: AgentMetric[];
  anomaly_count: number;
  date_range: {
    min_date: string;
    max_date: string;
  };
}

export interface NLQueryResult {
  query: string;
  answer: string;
  reasoning: string;
  sql_or_plan: string;
  data_summary: Record<string, any>;
  matching_records: Ticket[];
  execution_time_ms: number;
  model_used: string;
  confidence?: 'High' | 'Medium' | 'Low';
}

export interface TestCaseResult {
  id: string;
  name: string;
  category: 'Core Requirement' | 'Sample Query' | 'Anomaly Detection' | 'API Contract' | 'Edge Case';
  query: string;
  expected_outcome: string;
  actual_outcome: string;
  status: 'PASSED' | 'FAILED';
  latency_ms: number;
  details: string;
}

export interface TestSuiteSummary {
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  pass_rate: number;
  total_duration_ms: number;
  results: TestCaseResult[];
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: string;
  queryResult?: NLQueryResult;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}
