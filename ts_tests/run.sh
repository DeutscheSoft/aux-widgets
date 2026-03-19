#!/usr/bin/env bash

set -euo pipefail

# Run TypeScript typechecking for the declaration-based widget tests.
# This script intentionally uses npx and does not rely on a local package.json.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${SCRIPT_DIR%/ts_tests}"
TS_VERSION="${TS_VERSION:-5.6.3}"

cd "${REPO_ROOT}"

npx -y --package="typescript@${TS_VERSION}" -- tsc -p ts_tests/tsconfig.json

