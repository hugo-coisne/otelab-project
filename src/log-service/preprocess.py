import pandas as pd

def perform():
    event_data = pd.read_csv('csv/parsed_logs.csv')
    event_data['Anomaly'] = event_data['Level'] == 'error'
    event_data['Anomaly']=event_data['Anomaly'].astype(int)

    event_counts = event_data.groupby(['TraceId','Event']).size().reset_index(name="count")
    anomaly_status = event_data.groupby("TraceId")["Anomaly"].max()
    result = pd.merge(event_counts, anomaly_status, on="TraceId")
    pivot_result = result.pivot(index="TraceId", columns="Event", values="count").fillna(0).reset_index()

    final_result = pd.merge(pivot_result, anomaly_status, on="TraceId")
    for col in final_result.columns:
        if col !='TraceId':
            final_result[col] = final_result[col].astype(int)

    # eliminate high correlation variables
    correlation_matrix = final_result[final_result.columns[1:]].corr()
    anomaly_corr = correlation_matrix['Anomaly']
    threshold = 0.9
    columns_to_drop = anomaly_corr[abs(anomaly_corr) > threshold].index.difference(['Anomaly'])

    df_filtered = final_result.drop(columns=columns_to_drop)
    df_filtered.to_csv('csv/aggregated.csv')
if __name__=="__main__":
    perform()