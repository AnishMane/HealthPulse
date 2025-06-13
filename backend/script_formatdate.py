import pandas as pd

# Load data
df = pd.read_csv("data/Final_data.csv")

# Clean numeric columns
df['Deaths'] = pd.to_numeric(df['Deaths'], errors='coerce')
df['day'] = pd.to_numeric(df['day'], errors='coerce').astype('Int64')
df['mon'] = pd.to_numeric(df['mon'], errors='coerce').astype('Int64')
df['year'] = pd.to_numeric(df['year'], errors='coerce').astype('Int64')

# Rename 'mon' to 'month' so pandas can parse datetime
df.rename(columns={'mon': 'month'}, inplace=True)

# Construct __time column
df['__time'] = pd.to_datetime(df[['year', 'month', 'day']], errors='raise').dt.strftime('%Y-%m-%d')

# Drop extra columns
df.drop(columns=['Unnamed: 0', 'day', 'month', 'year'], inplace=True)

# Save for Druid
df.to_csv("data/druid_ready.csv", index=False)
