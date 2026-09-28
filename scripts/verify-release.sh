#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

for pkg in playwright ai insights; do
  echo "== pack $pkg =="
  (cd "$ROOT/packages/$pkg" && rm -f *.tgz && npm pack >/dev/null)
done

echo '== clean Node consumer smoke =='
mkdir -p "$TMP/node"; cd "$TMP/node"; printf '{"type":"module","private":true}\n' > package.json
npm install --offline --ignore-scripts "$ROOT/packages/ai"/*.tgz "$ROOT/packages/insights"/*.tgz >/dev/null
node - <<'NODE'
import { createAIConfig, MemoryUsageLedger } from '@sdetflow/ai';
import { summarizeRun } from '@sdetflow/insights';
if (createAIConfig().enabled !== false) throw new Error('AI safe default failed');
const l=new MemoryUsageLedger(); await l.addSpendUsd('d',0.1); if(await l.getSpendUsd('d')!==0.1) throw new Error('ledger failed');
if(summarizeRun([]).total!==0) throw new Error('insights failed');
NODE

# Playwright package has a peer dependency. Install the tarball without resolving peers and smoke import utilities.
npm install --offline --ignore-scripts --legacy-peer-deps "$ROOT/packages/playwright"/*.tgz >/dev/null
node - <<'NODE'
import { createConfig, EvidenceCollector, TestDataFactory } from '@sdetflow/playwright';
if(createConfig().ai.enabled!==false) throw new Error('Playwright AI safe default failed');
if(new EvidenceCollector(2).snapshot().console.length!==0) throw new Error('evidence failed');
if(new TestDataFactory().alpha(3).length!==3) throw new Error('data failed');
NODE

echo '== Java consumer smoke =='
(cd "$ROOT/packages/api-java" && ./build.sh >/dev/null)
mkdir -p "$TMP/java"; cat > "$TMP/java/Smoke.java" <<'JAVA'
import io.sdetflow.api.*;
public class Smoke { public static void main(String[] args) { Object x=Json.parse("{\"ok\":true}"); if(!Boolean.TRUE.equals(Json.path(x,"ok"))) throw new RuntimeException(); System.out.println("java-smoke-ok"); } }
JAVA
javac --release 17 -cp "$ROOT/packages/api-java/dist/sdetflow-api-0.2.0.jar" "$TMP/java/Smoke.java"
java -cp "$ROOT/packages/api-java/dist/sdetflow-api-0.2.0.jar:$TMP/java" Smoke >/dev/null

echo '== Ruby clean GEM_HOME smoke =='
(cd "$ROOT/packages/ruby" && rm -f sdet_flow-0.2.0.gem && gem build sdet_flow.gemspec >/dev/null)
mkdir -p "$TMP/gems"; GEM_HOME="$TMP/gems" GEM_PATH="$TMP/gems" gem install --local --no-document "$ROOT/packages/ruby/sdet_flow-0.2.0.gem" >/dev/null
GEM_HOME="$TMP/gems" GEM_PATH="$TMP/gems" ruby -e "require 'sdet_flow'; raise unless SdetFlow::VERSION == '0.2.0'"

echo '== Website static verification =='
python3 "$ROOT/scripts/verify-website.py" "$ROOT/website"

echo 'Release verification passed.'
