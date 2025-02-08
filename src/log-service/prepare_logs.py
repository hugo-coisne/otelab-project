import os

log_dir = 'log'
zips_path = 'zips'
prepared_logfile_path = f'{log_dir}/prepared.log'
def prepareLogs():
  # get all log files in log directory
  if os.path.exists(prepared_logfile_path): os.remove(prepared_logfile_path)
  log_list = os.listdir(log_dir)
  logs=[]
  # compile all logfiles in one
  for logfile in log_list:
    logfile_path = f'{log_dir}/{logfile}'
    with open(logfile_path, 'r') as logfile_content:
      lines = logfile_content.readlines()
      # print(len(lines))
      logs+= lines
    os.remove(logfile_path)
  with open(prepared_logfile_path, 'w') as prepared_logfile:
    prepared_logfile.writelines(logs)

prepareLogs()