import requests
import json
from datetime import datetime, timedelta

# Loki settings
LOKI_URL = "http://localhost:3100/loki/api/v1/query_range" 
LABELS = '{app=~".+"}'  # all apps
HEADERS = {"Content-Type": "application/json"}

def get_logs(minutes=1):
  # Calculate the time range
  now = datetime.now()
  # print(now)
  start_time = now - timedelta(minutes=minutes)
  # print(start_time)
  end_time = now

  # Convert to nanoseconds (Loki uses ns timestamps)
  start_ns = int(start_time.timestamp() * 1e9)
  end_ns = int(end_time.timestamp() * 1e9)

  # query parameters
  params = {
    "query": LABELS,
    "start": start_ns,
    "end": end_ns,
    "limit": 1000
  }

  response = requests.get(LOKI_URL, params=params, headers=HEADERS)
  if response.status_code == 200:
    logs = response.json()
    return logs["data"]["result"] 
  else:
    # print(f"Error: {response.status_code}, {response.text}")
    return None

def writeToLogfile(logs):
  now = datetime.now().isoformat()
  formatted_now = now.replace(':','-').replace('.','-')
  with open(f'log/{formatted_now}.log','w') as file:
    for stream in logs:
      for entry in stream['values']:
        timestamp, log = entry
        log = json.loads(log)
        en = f"{timestamp} {log['trace_id']} {log['span_id']} {log['trace_flags']} {log['level']} {log['message']}\n"
        file.write(en)
    # timestamp1 = int(int(logs[0]['values'][0][0])/1000000000)
    # datetime1 = datetime.fromtimestamp(timestamp=timestamp1)
    # timestamp2 = int(int(logs[0]['values'][-1][0])/1000000000)
    # datetime2 = datetime.fromtimestamp(timestamp=timestamp2)
    # print(datetime1)
    # print(datetime2)

if __name__=='__main__':
  # Fetch and print logs
  logs = get_logs()
  if logs:
    writeToLogfile(logs)
  # print(logs)