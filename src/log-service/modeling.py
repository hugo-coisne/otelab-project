import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from datetime import datetime
from joblib import dump

def trainNewModels():
  # Load the preprocessed
  df = pd.read_csv('csv/aggregated.csv')

  df = df.sort_values(by='TraceId')

  # 60 / 20 / 20
  train_proportion = .6
  val_proportion = .2
  train_size = int(train_proportion * len(df))
  val_size = int(val_proportion * len(df))
  test_size = len(df) - train_size - val_size

  train_df = df

  columns_to_drop = ['TraceId', 'Anomaly']
  # Separate features and labels
  X_train = train_df.drop(columns=columns_to_drop)  # Features
  y_train = train_df['Anomaly'].astype(int)  # Labels

  # Train
  rf_model = RandomForestClassifier()
  rf_model.fit(X_train, y_train)

  lr_model = LogisticRegression(max_iter=1000)
  lr_model.fit(X_train, y_train)

  # Storing
  now = datetime.now().isoformat().replace(':','-').replace('.','-')
  dump(rf_model, f'models/rf/{now}.joblib')
  dump(lr_model, f'models/lr/{now}.joblib')

if __name__=="__main__":
  trainNewModels()