#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
VERSION="$(python3 - <<'PY' "$ROOT/pom.xml"
import re,sys
s=open(sys.argv[1]).read();m=re.search(r'<version>([^<]+)</version>',s);print(m.group(1) if m else '0.0.0')
PY
)"
rm -rf "$ROOT/build" "$ROOT/dist"
mkdir -p "$ROOT/build/main" "$ROOT/build/test" "$ROOT/dist"
find "$ROOT/src/main/java" -name '*.java' -print0 | xargs -0 javac --release 17 -Xlint:all -d "$ROOT/build/main"
find "$ROOT/src/test/java" -name '*.java' -print0 | xargs -0 javac --release 17 -Xlint:all --add-modules jdk.httpserver -cp "$ROOT/build/main" -d "$ROOT/build/test"
java --add-modules jdk.httpserver -cp "$ROOT/build/main:$ROOT/build/test" io.sdetflow.api.ApiSdkTestMain
cat > "$ROOT/build/MANIFEST.MF" <<MANIFEST
Manifest-Version: 1.0
Implementation-Title: SDETFlow API
Implementation-Version: $VERSION
Automatic-Module-Name: io.sdetflow.api
MANIFEST
jar --create --file "$ROOT/dist/sdetflow-api-$VERSION.jar" --manifest "$ROOT/build/MANIFEST.MF" -C "$ROOT/build/main" .
jar --create --file "$ROOT/dist/sdetflow-api-$VERSION-sources.jar" -C "$ROOT/src/main/java" .
echo "Built $ROOT/dist/sdetflow-api-$VERSION.jar"
