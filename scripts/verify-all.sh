#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo '== @sdetflow/playwright =='; (cd "$ROOT/packages/playwright" && npm test)
echo '== @sdetflow/ai =='; (cd "$ROOT/packages/ai" && npm test)
echo '== @sdetflow/insights =='; (cd "$ROOT/packages/insights" && npm test)
echo '== sdetflow-api Java =='; (cd "$ROOT/packages/api-java" && ./build.sh)
echo '== sdet_flow Ruby =='; (cd "$ROOT/packages/ruby" && ruby -Ilib test/sdet_flow_test.rb)
echo '== website static checks =='; python3 "$ROOT/scripts/verify-website.py" "$ROOT/website"
echo 'All SDETFlow verification checks passed.'
