from drain3 import TemplateMiner
from drain3.template_miner_config import TemplateMinerConfig
import regex as re
import pandas as pd
import os

log_path = 'log/prepared.log' 
csv_path = 'csv/parsed_logs.csv'
log_pattern = re.compile(
    r"(?P<Timestamp>\d+)\s"
    r"(?P<TraceId>[a-z0-9]{32})\s"
    r"(?P<SpanId>[a-z0-9]{16})\s"
    r"(?P<TraceFlags>\d{2})\s"
    r"(?P<Level>[a-z]+)\s"
    r"(?P<Content>.*)"
)

event_templates_path = 'csv/event_templates.csv'

def train(drain_parser, log_pattern, log_file_path):
    total = 0
    with open(log_file_path, 'r', encoding='utf-8') as log_file:
        for line in log_file:
            line = line.strip()
            match = log_pattern.match(line)
            if match:
                total+=1
                log_content = match.group('Content')
                drain_parser.add_log_message(log_content)
    return drain_parser, total

def structure(drain_parser: TemplateMiner, log_pattern: re.Pattern, total: int, log_file_path):
  log_data = []
  event_templates=[]
  progress = 0
  with open(log_file_path, 'r', encoding='utf-8') as log_file:
    for log in log_file:
      match = log_pattern.match(log.strip())
      if match:
        timestamp = match.group("Timestamp")
        traceid = match.group("TraceId")
        spanid = match.group("SpanId")
        traceflags = match.group("TraceFlags")
        level = match.group("Level")
        content = match.group("Content")
        log_content = content
        result = drain_parser.match(log_content)

        log_entry = {
            "Timestamp": timestamp,
            "TraceId": traceid,
            "SpanId": spanid,
            "TraceFlags": traceflags,
            "Level": level,
            "Content": content,
            "Template" : result.get_template(),
            "Event": result.cluster_id
        }

        log_data.append(log_entry)
        event_templates.append({'Template':log_entry['Template']}) # 'Event':log_entry['Event']
        progress+=1
        # print(f"{100*progress/total:.2f}",'%')
  # open(log_file_path, 'w', encoding='utf-8') # delete prepared.log content
  return log_data, event_templates


def parse(log_pattern: re.Pattern = log_pattern, csv_path: str = csv_path, log_file_path: str = log_path):
  total = 0
  config = TemplateMinerConfig()
  drain_parser = TemplateMiner(config=config)

  drain_parser, total = train(drain_parser, log_pattern, log_file_path)
  # print('drain parser training done')

  log_data, event_templates = structure(drain_parser, log_pattern, total, log_file_path)
  # print('data structuration done')

  # print('saving event templates')
  dft = pd.DataFrame(event_templates)
  # print(dft.columns, dft.head())
  filtered_df = dft.groupby("Template").first().sort_index()
  # print(filtered_df.head(), filtered_df.shape)
  if os.path.exists(event_templates_path):
    old_templates = pd.read_csv(event_templates_path)
    new_templates = pd.concat([old_templates,filtered_df]).groupby("Template").first().sort_index()
    new_templates.to_csv(event_templates_path)
  else:
    filtered_df.to_csv(event_templates_path)
  
  df = pd.DataFrame(log_data).set_index('Timestamp')
  # print(df.head(), df.shape, 'saving logs to csv')
  if os.path.exists(csv_path):
    old_csv = pd.read_csv(csv_path, index_col='Timestamp')
    new_csv = pd.concat([old_csv, df])
    new_csv.to_csv(csv_path)
  else:
    df.to_csv(csv_path)

  # print('done saving to csv')
  return df

if __name__=="__main__":
  parse()