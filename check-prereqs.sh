#!/usr/bin/env bash
set -euo pipefail

# --- Minimum required versions ---
MIN_NODE="22.0.0"
MIN_NPM="10.0.0"
MIN_MAKE="3.0"

# --- Helper function to compare versions ---
version_gte() {
    [ "$(printf '%s\n%s' "$2" "$1" | sort -V | head -n1)" = "$2" ]
}

check_tool() {
    local name=$1
    local min_version=$2
    local version_cmd=$3

    if ! command -v "$name" >/dev/null 2>&1; then
        echo "❌ $name is NOT installed (requires ≥ $min_version)"
        MISSING=1
        return
    fi

    local version
    version=$($version_cmd 2>/dev/null | head -n1 | grep -oE '[0-9]+(\.[0-9]+){1,3}')

    if version_gte "$version" "$min_version"; then
        echo "✅ $name version $version (meets requirement ≥ $min_version)"
    else
        echo "⚠️ $name version $version (requires ≥ $min_version)"
        MISSING=1
    fi
}

# --- Check all tools ---
echo "🔍 Checking required tools..."
MISSING=0

check_tool "node" "$MIN_NODE" "node --version"
check_tool "npm" "$MIN_NPM" "npm --version"
check_tool "make" "$MIN_MAKE" "make --version"

echo

if [ "$MISSING" -eq 1 ]; then
    echo "⚠️ One or more required tools are missing or outdated. Please install or upgrade them."
    exit 1
else
    echo "🎉 All required tools are installed and meet version requirements."
fi
