import pandas as pd

# Load the dataset
df = pd.read_csv("data/druid_ready.csv")

# Display the first few rows
print("First 5 rows of the dataset:")
print(df.head())

# Get basic info about the dataset
print("\nDataset Info:")
df.info()

# Get the shape of the dataset
print(f"\nDataset contains {df.shape[0]} rows and {df.shape[1]} columns.")

# Get column names
print("\nColumn names:")
print(df.columns.tolist())

# Unique values for each column
print("\nUnique values in each column:")
for col in df.columns:
    unique_vals = df[col].unique()
    print(f"{col}: {len(unique_vals)} unique values")
    if len(unique_vals) < 20:  # Print actual values if not too many
        print(unique_vals)

# Summary statistics for numerical columns
print("\nSummary statistics for numerical columns:")
print(df.describe())

# Check for null/missing values
print("\nMissing values in each column:")
print(df.isnull().sum())

# Datatypes of columns
print("\nData types of each column:")
print(df.dtypes)
