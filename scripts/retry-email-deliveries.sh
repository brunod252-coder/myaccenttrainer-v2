#!/usr/bin/env bash

set -u

APP_DIR="/home/ubuntu/apps/myaccenttrainer-v2"
ENDPOINT="http://127.0.0.1:3002/api/internal/email-retry"

cd "$APP_DIR" || exit 1

set -a
source .env
set +a

if [ -z "${EMAIL_RETRY_SECRET:-}" ]; then
  echo "$(date -Is) ERROR EMAIL_RETRY_SECRET missing"
  exit 1
fi

HTTP_CODE="$(
  curl \
    --silent \
    --show-error \
    --output /tmp/mat-email-retry-response.json \
    --write-out '%{http_code}' \
    --max-time 60 \
    --request POST \
    --header "Authorization: Bearer $EMAIL_RETRY_SECRET" \
    --header "Content-Type: application/json" \
    --data '{"limit":25}' \
    "$ENDPOINT"
)"

CURL_STATUS=$?

if [ "$CURL_STATUS" -ne 0 ]; then
  echo "$(date -Is) ERROR curl_status=$CURL_STATUS"
  exit "$CURL_STATUS"
fi

RESPONSE="$(
  cat /tmp/mat-email-retry-response.json \
    2>/dev/null || true
)"

if [ "$HTTP_CODE" != "200" ]; then
  echo "$(date -Is) ERROR http=$HTTP_CODE response=$RESPONSE"
  exit 1
fi

echo "$(date -Is) OK http=$HTTP_CODE response=$RESPONSE"
