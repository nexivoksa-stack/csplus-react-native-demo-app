#!/usr/bin/env bash
# Rebuild the CS+ SDK packages, pack them into vendor/, and reinstall them here.
# The edit -> device loop in one command:   npm run sdk:sync
#
# The SDK lives in a sibling repo (override with CSPLUS_SDK_DIR). The packages
# are not on npm yet, so this app installs tarballs, exactly as a customer's app
# will install the registry versions -- which is the point: it tests the real
# install, not a workspace symlink.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
sdk="${CSPLUS_SDK_DIR:-$here/../csplus-client-sdk}"
[ -d "$sdk/packages/react-native" ] || { echo "SDK repo not found at $sdk (set CSPLUS_SDK_DIR)" >&2; exit 1; }

echo "==> building the SDK in $sdk"
( cd "$sdk" && pnpm turbo run build \
    --filter=@csplus/client-core --filter=@csplus/client-react --filter=@csplus/react-native )

echo "==> packing into vendor/"
mkdir -p "$here/vendor"
rm -f "$here"/vendor/csplus-client-*.tgz
for p in client-core client-react react-native; do
  ( cd "$sdk/packages/$p" && pnpm pack --pack-destination "$here/vendor" >/dev/null )
done
ls -1 "$here/vendor"

echo "==> reinstalling (tarballs keep the same version, so npm's cached copy must go first)"
cd "$here"
rm -rf node_modules/@csplus
# The lockfile pins each tarball's hash; a rebuilt tarball has a new one.
npm install --no-audit --no-fund --install-links=false \
  ./vendor/csplus-client-core-0.0.0.tgz ./vendor/csplus-client-react-0.0.0.tgz ./vendor/csplus-react-native-0.0.0.tgz

echo "==> done. $(node scripts/check-livekit-copies.mjs)"
