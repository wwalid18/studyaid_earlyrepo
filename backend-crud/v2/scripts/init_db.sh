#!/bin/bash

# Create the database
mysql -u walid -pwalid -e "CREATE DATABASE IF NOT EXISTS studyaid;"

# Initialize migrations directory (only needed first time)
flask db init

# Create initial migration
flask db migrate -m "Initial migration"

# Apply the migration
flask db upgrade

# Initialize test data
python scripts/init_test_data.py

echo "Database initialization complete!" 