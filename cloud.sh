#!/bin/bash
export REACT_APP_API_URL="https://projectsens.pythonanywhere.com"
export REACT_APP_ENV="production"
echo "cloud environment set"
npm run build
npm run preview