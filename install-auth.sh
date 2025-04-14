#!/bin/bash

# Install required packages
npm install --save bcrypt express-session connect-flash

# Create directories if they don't exist
mkdir -p views/auth
mkdir -p middleware
mkdir -p scripts

# Make the create-admin script executable
chmod +x scripts/create-admin.js

echo "Installation complete. Now you can run 'npm run create-admin' to create an admin user." 