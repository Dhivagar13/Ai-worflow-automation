import requests
import json
import time

def test_workflow():
    url = "http://localhost:8000/api/run"
    payload = {
        "task": "Send a weekly report email to the team with this week's sales data"
    }
    
    print(f"🚀 Sending request to {url}...")
    try:
        response = requests.post(url, json=payload, timeout=60)
        if response.status_code == 200:
            data = response.json()
            print("✅ Workflow Triggered Successfully!")
            print(f"Decision: {data.get('monitor_decision')}")
            print(f"Execution Time: {data.get('execution_time_seconds')}s")
            print(f"Retries: {data.get('retry_count')}")
            if data.get('error'):
                print(f"❌ Error: {data.get('error')}")
            print("\nFinal Output Preview:")
            print(data.get('final_output') if data.get('final_output') else "No output")
            print("\nAgent Logs:")
            for log in data.get('agent_logs', []):
                print(f"[{log.get('agent')}] {log.get('type')}: {log.get('message')}")

        else:
            print(f"❌ Failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_workflow()
