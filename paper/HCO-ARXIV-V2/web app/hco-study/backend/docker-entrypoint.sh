#!/bin/sh
set -e

mkdir -p /data
touch /data/hco_study.db

exec uvicorn main:app --host 0.0.0.0 --port 8000
