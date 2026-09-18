"""
Pytest Suite for DOTMappers AI Engineer Assessment
Runs contract tests, sample queries, and anomaly detector checks.
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["dataset"]["total_tickets"] == 500
    assert data["dataset"]["open_tickets"] > 0

def test_sample_query_1_open_tickets():
    response = client.post("/api/query", json={"query": "How many tickets are currently open?"})
    assert response.status_code == 200
    data = response.json()
    assert "open" in data["answer"].lower()
    assert data["data_summary"]["total_open"] > 0

def test_sample_query_2_top_agent():
    response = client.post("/api/query", json={"query": "Which agent resolved the most tickets this month?"})
    assert response.status_code == 200
    data = response.json()
    assert "top_agent" in data["data_summary"]
    assert "resolved" in data["answer"].lower()

def test_sample_query_3_critical_12h():
    response = client.post("/api/query", json={"query": "Show me all Critical tickets not resolved within 12 hours."})
    assert response.status_code == 200
    data = response.json()
    assert "total_matching" in data["data_summary"]

def test_sample_query_4_technical_rating():
    response = client.post("/api/query", json={"query": "What is the average customer rating for Technical category tickets?"})
    assert response.status_code == 200
    data = response.json()
    assert data["data_summary"]["category"] == "Technical"
    assert data["data_summary"]["average_customer_rating"] > 0

def test_sample_query_5_anomalies():
    response = client.post("/api/query", json={"query": "Are there any anomalies in resolution times this week?"})
    assert response.status_code == 200
    data = response.json()
    assert data["data_summary"]["resolution_outliers_count"] > 0

def test_anomalies_endpoint():
    response = client.get("/api/anomalies")
    assert response.status_code == 200
    data = response.json()
    assert data["total_anomalies"] > 0
    assert "RESOLUTION_OUTLIER" in data["breakdown_by_type"]
    assert "UNRESOLVED_SLA_BREACH" in data["breakdown_by_type"]

def test_tickets_pagination_and_filter():
    response = client.get("/api/tickets?priority=Critical&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data["tickets"]) <= 5
    for t in data["tickets"]:
        assert t["priority"] == "Critical"
