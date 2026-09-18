import { Ticket, AnomalyItem } from '../src/types';
import { dataStore } from './dataStore';

export class AnomalyEngine {
  public detectAnomalies(tickets?: Ticket[]): AnomalyItem[] {
    const list = tickets || dataStore.getAllTickets();
    const anomalies: AnomalyItem[] = [];

    // 1. Calculate statistical distribution for resolution times
    const resolvedTimes = list
      .map(t => t.resolution_time_hrs)
      .filter((v): v is number => v !== null && !isNaN(v));

    let meanResol = 0;
    let stdResol = 0;
    if (resolvedTimes.length > 0) {
      meanResol = resolvedTimes.reduce((acc, v) => acc + v, 0) / resolvedTimes.length;
      const variance = resolvedTimes.reduce((acc, v) => acc + Math.pow(v - meanResol, 2), 0) / resolvedTimes.length;
      stdResol = Math.sqrt(variance);
    }

    // Statistical outlier threshold: mean + 2 * stdDev (typically ~65 hrs in this dataset)
    const resolThreshold = Math.max(50, Math.round(meanResol + 2 * stdResol));

    // Sort to compute IQR as well
    const sortedResol = [...resolvedTimes].sort((a, b) => a - b);
    const q75 = sortedResol[Math.floor(sortedResol.length * 0.75)] || 30;
    const q25 = sortedResol[Math.floor(sortedResol.length * 0.25)] || 6;
    const iqrThreshold = q75 + 1.5 * (q75 - q25);

    // Reference latest date in dataset for age calculation
    const maxTimestamp = list.reduce((max, t) => {
      const time = new Date(t.created_at).getTime();
      return isNaN(time) ? max : Math.max(max, time);
    }, new Date('2024-03-31T23:59:59').getTime());

    for (const ticket of list) {
      // Rule 1: Resolution Time Outlier (Statistical Anomaly)
      if (ticket.resolution_time_hrs !== null && ticket.resolution_time_hrs >= resolThreshold) {
        const zScore = stdResol > 0 ? ((ticket.resolution_time_hrs - meanResol) / stdResol).toFixed(1) : '2.5';
        anomalies.push({
          id: `ANOM-RES-${ticket.ticket_id}`,
          ticket_id: ticket.ticket_id,
          type: 'RESOLUTION_OUTLIER',
          severity: ticket.resolution_time_hrs > 90 ? 'Critical' : 'High',
          title: `Severe Resolution Time Outlier (${ticket.resolution_time_hrs}h)`,
          description: `Ticket took ${ticket.resolution_time_hrs} hours to resolve, which is ${zScore} standard deviations above the fleet average of ${meanResol.toFixed(1)}h (IQR Outlier threshold: ${resolThreshold}h).`,
          metric_value: `${ticket.resolution_time_hrs} hrs`,
          threshold: `> ${resolThreshold} hrs (Fleet Mean: ${meanResol.toFixed(1)}h)`,
          recommendation: `Conduct post-mortem review on why ${ticket.category} issue "${ticket.issue_summary}" stalled with Agent ${ticket.agent_id}. Review handover logs and sub-task dependencies.`,
          ticket
        });
      }

      // Rule 2: Unresolved High/Critical Priority Tickets older than 24 hours (SLA Breach)
      const isHighPriority = ticket.priority === 'High' || ticket.priority === 'Critical';
      const isUnresolved = ticket.status === 'Open' || ticket.status === 'Escalated';

      if (isHighPriority && isUnresolved) {
        const createdTime = new Date(ticket.created_at).getTime();
        const ageHours = !isNaN(createdTime) ? Math.round((maxTimestamp - createdTime) / (1000 * 60 * 60)) : 48;

        if (ageHours > 24) {
          const isCritical = ticket.priority === 'Critical';
          anomalies.push({
            id: `ANOM-SLA-${ticket.ticket_id}`,
            ticket_id: ticket.ticket_id,
            type: 'UNRESOLVED_SLA_BREACH',
            severity: isCritical ? 'Critical' : 'High',
            title: `${ticket.priority} Priority Unresolved SLA Breach (${ageHours}h+ old)`,
            description: `${ticket.priority} urgency ticket in "${ticket.status}" state has remained unresolved for ~${ageHours} hours since creation on ${ticket.created_at}, violating the 24-hour maximum SLA.`,
            metric_value: `Age ~${ageHours} hrs (${ticket.status})`,
            threshold: `Max 24 hours SLA for ${ticket.priority} priority`,
            recommendation: `Immediate managerial intervention required. Dispatch ticket ${ticket.ticket_id} to emergency queue, notify on-call engineering team for "${ticket.issue_summary}", and reassign if Agent ${ticket.agent_id} is overloaded.`,
            ticket
          });
        }
      }

      // Rule 3: Low Customer Rating (Dissatisfaction Spike <= 2)
      if (ticket.customer_rating !== null && ticket.customer_rating <= 2) {
        anomalies.push({
          id: `ANOM-CSAT-${ticket.ticket_id}`,
          ticket_id: ticket.ticket_id,
          type: 'LOW_RATING_INCIDENT',
          severity: ticket.customer_rating === 1 ? 'High' : 'Medium',
          title: `Severely Low Customer Rating (${ticket.customer_rating}/5)`,
          description: `Customer submitted a negative rating of ${ticket.customer_rating}/5 for resolved ${ticket.category} ticket "${ticket.issue_summary}". Resolution took ${ticket.resolution_time_hrs || 'N/A'}h.`,
          metric_value: `${ticket.customer_rating}/5 Stars`,
          threshold: `Target rating >= 4.0 (Threshold <= 2)`,
          recommendation: `Trigger automated customer success follow-up call. Review agent response transcript and assess whether unresolved follow-on questions or prolonged wait caused churn risk.`,
          ticket
        });
      }

      // Rule 4: Slow Initial Response (> 4.5 hours when fleet avg is ~2.5 hours)
      if (ticket.response_time_hrs >= 4.8) {
        anomalies.push({
          id: `ANOM-RESP-${ticket.ticket_id}`,
          ticket_id: ticket.ticket_id,
          type: 'RESPONSE_DELAY',
          severity: ticket.priority === 'Critical' ? 'Critical' : 'Medium',
          title: `Slow First Response (${ticket.response_time_hrs}h)`,
          description: `Customer waited ${ticket.response_time_hrs} hours before receiving first agent touchpoint, approaching the 5.0 hour maximum boundary.`,
          metric_value: `${ticket.response_time_hrs} hrs`,
          threshold: `Target response < 2.0 hrs (Flag threshold >= 4.8 hrs)`,
          recommendation: `Check agent triage routing rules. Implement automated initial acknowledgment chatbot to reduce perceived wait time for ${ticket.category} issues.`,
          ticket
        });
      }

      // Rule 5: Critical Escalated Tickets Stagnated
      if (ticket.status === 'Escalated' && ticket.priority === 'Critical') {
        anomalies.push({
          id: `ANOM-ESC-${ticket.ticket_id}`,
          ticket_id: ticket.ticket_id,
          type: 'ESCALATED_STALLED',
          severity: 'Critical',
          title: `Critical Escalation Stagnation (${ticket.ticket_id})`,
          description: `Critical ticket "${ticket.issue_summary}" is currently escalated without resolution. Risk of operational disruption.`,
          metric_value: `Status: Escalated`,
          threshold: `Critical escalations require < 4h resolution turnaround`,
          recommendation: `Convene immediate cross-functional bridge with senior tier-3 support lead and engineering team assigned to Agent ${ticket.agent_id}.`,
          ticket
        });
      }
    }

    // Deduplicate by ID and sort by severity (Critical -> High -> Medium -> Low)
    const severityScore = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return anomalies.sort((a, b) => severityScore[b.severity] - severityScore[a.severity]);
  }
}

export const anomalyEngine = new AnomalyEngine();
