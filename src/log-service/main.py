from getLogs import *
from prepare_logs import *
import zipLogs
import drain
from datetime import datetime, timedelta
import preprocess
import modeling

last_second = datetime.now()
last_10_seconds = last_second
last_30_seconds = last_second
last_10_min = last_second

while True:
  now = datetime.now()

  if now > last_second+timedelta(seconds=1): # every second
    logs = get_logs() # fetch logs from loki
    if logs:
      writeToLogfile(logs) # write to new log file
    last_second = now
  
  if now > last_30_seconds+timedelta(seconds=30): # every 30 seconds
    prepareLogs() # compile all log file in one
    drain.parse() # use drain3 to parse logs and convert to csv
    zipLogs.proceed() # use logzip to archive logs
    last_30_seconds = now

  # if now > last_10_min+timedelta(minutes=10):
  #   preprocess.perform()
  #   modeling.trainNewModels()