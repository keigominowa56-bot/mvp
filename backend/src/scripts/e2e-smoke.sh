#!/usr/bin/env bash
set -euo pipefail

API=${API:-http://localhost:3001}

echo "Login citizen1..."
C1=$(curl -sS -X POST "$API/auth/login" -H "Content-Type: application/json" -d '{"id":"citizen1@example.com","password":"Passw0rd!"}')
C1_TOKEN=$(echo "$C1" | jq -r .accessToken)

echo "Login citizen2..."
C2=$(curl -sS -X POST "$API/auth/login" -H "Content-Type: application/json" -d '{"id":"citizen2@example.com","password":"Passw0rd!"}')
C2_TOKEN=$(echo "$C2" | jq -r .accessToken)

echo "Login politician..."
P=$(curl -sS -X POST "$API/auth/login" -H "Content-Type: application/json" -d '{"id":"politician@example.com","password":"Passw0rd!"}')
P_TOKEN=$(echo "$P" | jq -r .accessToken)

echo "List posts..."
POSTS=$(curl -sS "$API/posts")
POST_ID=$(echo "$POSTS" | jq -r '.[0].id')
echo "Using post: $POST_ID"

echo "Vote agree by citizen2..."
curl -sS -X POST "$API/posts/$POST_ID/votes" -H "Authorization: Bearer $C2_TOKEN" -H "Content-Type: application/json" -d '{"choice":"agree"}' > /dev/null || true
echo "Try duplicate vote (should fail)..."
curl -sS -w "\nHTTP:%{http_code}\n" -o /dev/null -X POST "$API/posts/$POST_ID/votes" -H "Authorization: Bearer $C2_TOKEN" -H "Content-Type: application/json" -d '{"choice":"agree"}'

echo "Comment by citizen2..."
curl -sS -X POST "$API/posts/$POST_ID/comments" -H "Authorization: Bearer $C2_TOKEN" -H "Content-Type: application/json" -d '{"content":"素晴らしい取り組みです！"}' > /dev/null

echo "Surveys available for citizen1..."
curl -sS -H "Authorization: Bearer $C1_TOKEN" "$API/surveys/available"

echo "Submit survey response (citizen1 -> pending reward)..."
SID=$(curl -sS -H "Authorization: Bearer $C1_TOKEN" "$API/surveys/available" | jq -r '.[0].id')
curl -sS -X POST "$API/surveys/$SID/responses" -H "Authorization: Bearer $C1_TOKEN" -H "Content-Type: application/json" -d '{"answers":{"q1":"はい"}}'

echo "Submit survey response (citizen2 -> granted reward)..."
curl -sS -X POST "$API/surveys/$SID/responses" -H "Authorization: Bearer $C2_TOKEN" -H "Content-Type: application/json" -d '{"answers":{"q1":"はい"}}' || true
echo "Wallet citizen2..."
curl -sS -H "Authorization: Bearer $C2_TOKEN" "$API/wallet/transactions"

echo "Politician dashboard summary..."
curl -sS -H "Authorization: Bearer $P_TOKEN" "$API/analytics/my/posts" | jq '.[] | {title, votes: .votes, comments}'

echo "News ingest trigger..."
curl -sS -X POST "$API/news-ingest/pull" || true
echo "List news posts..."
curl -sS "$API/posts?type=news" | jq '.[0:3]'
echo "Done."