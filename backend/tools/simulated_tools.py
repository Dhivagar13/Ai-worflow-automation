"""
Simulated Tool Implementations for the Agentic Workflow Engine.

These tools simulate real-world actions (email, API calls, data processing, etc.)
without requiring external dependencies. Each tool accepts parameters and returns
a realistic simulated response.
"""

import json
import random
from datetime import datetime


# ─────────────────────────────────────────────────────────────────────────────
# Tool Registry — each tool has a name, description, and simulated handler
# ─────────────────────────────────────────────────────────────────────────────

AVAILABLE_TOOLS = {
    "send_email": {
        "name": "send_email",
        "description": "Send an email to specified recipients with subject and body",
        "parameters": ["to", "subject", "body"],
    },
    "fetch_api_data": {
        "name": "fetch_api_data",
        "description": "Fetch data from an external API endpoint",
        "parameters": ["endpoint", "method"],
    },
    "process_data": {
        "name": "process_data",
        "description": "Process, aggregate, or transform a dataset",
        "parameters": ["data_source", "operation"],
    },
    "generate_report": {
        "name": "generate_report",
        "description": "Generate a formatted report from provided data",
        "parameters": ["title", "data", "format"],
    },
    "schedule_task": {
        "name": "schedule_task",
        "description": "Schedule a recurring or one-time task",
        "parameters": ["task_name", "schedule", "action"],
    },
    "store_data": {
        "name": "store_data",
        "description": "Store or persist data to a database or file system",
        "parameters": ["destination", "data", "format"],
    },
    "send_notification": {
        "name": "send_notification",
        "description": "Send a push or SMS notification to a user or group",
        "parameters": ["recipient", "message", "channel"],
    },
    "validate_data": {
        "name": "validate_data",
        "description": "Validate data against a schema or business rules",
        "parameters": ["data", "rules"],
    },
    "search_records": {
        "name": "search_records",
        "description": "Search through records in a database or index",
        "parameters": ["query", "source"],
    },
    "transform_format": {
        "name": "transform_format",
        "description": "Convert data from one format to another (CSV, JSON, PDF, etc.)",
        "parameters": ["input_data", "input_format", "output_format"],
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# Simulated Tool Execution Handlers
# ─────────────────────────────────────────────────────────────────────────────

def _sim_send_email(params: dict) -> dict:
    """Simulate sending an email."""
    return {
        "status": "success",
        "message": f"Email sent successfully to {params.get('to', 'recipient@example.com')}",
        "details": {
            "to": params.get("to", "recipient@example.com"),
            "subject": params.get("subject", "No Subject"),
            "body_preview": params.get("body", "")[:100] + "...",
            "timestamp": datetime.now().isoformat(),
            "message_id": f"msg_{random.randint(10000, 99999)}",
        },
    }


def _sim_fetch_api_data(params: dict) -> dict:
    """Simulate fetching data from an API."""
    endpoint = params.get("endpoint", "/api/data")
    return {
        "status": "success",
        "message": f"Data fetched from {endpoint}",
        "data": {
            "records_count": random.randint(10, 500),
            "response_time_ms": random.randint(50, 300),
            "sample_records": [
                {"id": i, "value": f"record_{i}", "metric": round(random.uniform(0.1, 99.9), 2)}
                for i in range(1, 4)
            ],
        },
    }


def _sim_process_data(params: dict) -> dict:
    """Simulate data processing."""
    operation = params.get("operation", "aggregate")
    return {
        "status": "success",
        "message": f"Data processing ({operation}) completed successfully",
        "result": {
            "operation": operation,
            "records_processed": random.randint(50, 1000),
            "processing_time_ms": random.randint(100, 2000),
            "summary": {
                "total": round(random.uniform(1000, 50000), 2),
                "average": round(random.uniform(10, 500), 2),
                "max": round(random.uniform(500, 5000), 2),
                "min": round(random.uniform(1, 100), 2),
            },
        },
    }


def _sim_generate_report(params: dict) -> dict:
    """Simulate generating a report."""
    title = params.get("title", "Report")
    fmt = params.get("format", "PDF")
    return {
        "status": "success",
        "message": f"Report '{title}' generated in {fmt} format",
        "report": {
            "title": title,
            "format": fmt,
            "pages": random.randint(2, 15),
            "file_size_kb": random.randint(50, 2048),
            "generated_at": datetime.now().isoformat(),
            "download_url": f"/reports/{title.lower().replace(' ', '_')}_{random.randint(1000, 9999)}.{fmt.lower()}",
        },
    }


def _sim_schedule_task(params: dict) -> dict:
    """Simulate scheduling a task."""
    task_name = params.get("task_name", "Scheduled Task")
    schedule = params.get("schedule", "weekly")
    return {
        "status": "success",
        "message": f"Task '{task_name}' scheduled ({schedule})",
        "task": {
            "task_id": f"task_{random.randint(1000, 9999)}",
            "name": task_name,
            "schedule": schedule,
            "next_run": "2026-03-25T09:00:00",
            "created_at": datetime.now().isoformat(),
        },
    }


def _sim_store_data(params: dict) -> dict:
    """Simulate storing data."""
    destination = params.get("destination", "database")
    return {
        "status": "success",
        "message": f"Data stored successfully in {destination}",
        "details": {
            "destination": destination,
            "records_written": random.randint(1, 100),
            "storage_used_kb": random.randint(10, 500),
            "timestamp": datetime.now().isoformat(),
        },
    }


def _sim_send_notification(params: dict) -> dict:
    """Simulate sending a notification."""
    channel = params.get("channel", "push")
    recipient = params.get("recipient", "user")
    return {
        "status": "success",
        "message": f"Notification sent to {recipient} via {channel}",
        "details": {
            "recipient": recipient,
            "channel": channel,
            "notification_id": f"notif_{random.randint(10000, 99999)}",
            "delivered_at": datetime.now().isoformat(),
        },
    }


def _sim_validate_data(params: dict) -> dict:
    """Simulate data validation."""
    return {
        "status": "success",
        "message": "Data validation completed",
        "result": {
            "valid": True,
            "records_checked": random.randint(10, 500),
            "errors_found": 0,
            "warnings": random.randint(0, 3),
        },
    }


def _sim_search_records(params: dict) -> dict:
    """Simulate searching records."""
    query = params.get("query", "search term")
    return {
        "status": "success",
        "message": f"Search completed for '{query}'",
        "results": {
            "query": query,
            "total_matches": random.randint(5, 200),
            "top_results": [
                {"id": i, "relevance": round(random.uniform(0.7, 1.0), 3), "title": f"Result {i}"}
                for i in range(1, 4)
            ],
        },
    }


def _sim_transform_format(params: dict) -> dict:
    """Simulate format transformation."""
    input_fmt = params.get("input_format", "JSON")
    output_fmt = params.get("output_format", "CSV")
    return {
        "status": "success",
        "message": f"Data transformed from {input_fmt} to {output_fmt}",
        "result": {
            "input_format": input_fmt,
            "output_format": output_fmt,
            "records_converted": random.randint(10, 500),
            "output_file": f"/output/converted_{random.randint(1000, 9999)}.{output_fmt.lower()}",
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# Tool Execution Dispatcher
# ─────────────────────────────────────────────────────────────────────────────

_TOOL_HANDLERS = {
    "send_email": _sim_send_email,
    "fetch_api_data": _sim_fetch_api_data,
    "process_data": _sim_process_data,
    "generate_report": _sim_generate_report,
    "schedule_task": _sim_schedule_task,
    "store_data": _sim_store_data,
    "send_notification": _sim_send_notification,
    "validate_data": _sim_validate_data,
    "search_records": _sim_search_records,
    "transform_format": _sim_transform_format,
}


def execute_tool(tool_name: str, parameters: dict = None) -> dict:
    """
    Execute a simulated tool by name with given parameters.

    Args:
        tool_name: Name of the tool to execute (must be in AVAILABLE_TOOLS).
        parameters: Dictionary of parameters to pass to the tool handler.

    Returns:
        Dictionary with execution result including status, message, and details.
    """
    if parameters is None:
        parameters = {}

    handler = _TOOL_HANDLERS.get(tool_name)
    if handler is None:
        return {
            "status": "error",
            "message": f"Unknown tool: {tool_name}",
            "available_tools": list(AVAILABLE_TOOLS.keys()),
        }

    try:
        result = handler(parameters)
        return result
    except Exception as e:
        return {
            "status": "error",
            "message": f"Tool execution failed: {str(e)}",
            "tool": tool_name,
        }
