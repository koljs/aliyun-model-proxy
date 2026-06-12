#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="$PROJECT_DIR/build"
MODULE_DIR="$BUILD_DIR/dashscope-proxy"

# Node.js 版本 (LTS)
NODE_VERSION="22.16.0"
NODE_ARCH="arm64"
NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz"

# 从 package.json 读取版本
VERSION=$(node -e "console.log(require('$PROJECT_DIR/package.json').version)")

echo "=== DashScope Model Proxy - Magisk Module Builder ==="
echo "Version: v${VERSION}"
echo "Node.js: v${NODE_VERSION} (${NODE_ARCH})"
echo ""

# 清理旧构建
rm -rf "$BUILD_DIR"
mkdir -p "$MODULE_DIR"

# 1. 编译 TypeScript
echo "[1/6] Compiling TypeScript..."
cd "$PROJECT_DIR"
pnpm build

# 2. 安装生产依赖
echo "[2/6] Installing production dependencies..."
mkdir -p "$MODULE_DIR/files/node_modules"
cp "$PROJECT_DIR/package.json" "$MODULE_DIR/files/"
cp "$PROJECT_DIR/pnpm-lock.yaml" "$MODULE_DIR/files/"
cd "$MODULE_DIR/files"
pnpm install --frozen-lockfile --prod
cd "$PROJECT_DIR"

# 3. 下载 Node.js 二进制
echo "[3/6] Downloading Node.js v${NODE_VERSION} (${NODE_ARCH})..."
NODE_TAR="$BUILD_DIR/node.tar.xz"
if [ -f "$NODE_TAR" ]; then
  echo "  Using cached download"
else
  curl -L -o "$NODE_TAR" "$NODE_URL"
fi
echo "  Extracting node binary..."
tar xf "$NODE_TAR" -C "$BUILD_DIR" "node-v${NODE_VERSION}-linux-${NODE_ARCH}/bin/node"
cp "$BUILD_DIR/node-v${NODE_VERSION}-linux-${NODE_ARCH}/bin/node" "$MODULE_DIR/files/node"
chmod 755 "$MODULE_DIR/files/node"

# 4. 复制编译产物
echo "[4/6] Copying application files..."
cp -r "$PROJECT_DIR/dist" "$MODULE_DIR/files/dist"

# 5. 复制 Magisk 模块文件
echo "[5/6] Creating Magisk module structure..."
cp "$PROJECT_DIR/magisk/module.prop" "$MODULE_DIR/"
cp "$PROJECT_DIR/magisk/post-fs-data.sh" "$MODULE_DIR/"
cp "$PROJECT_DIR/magisk/service.sh" "$MODULE_DIR/"
cp "$PROJECT_DIR/magisk/default-config.json" "$MODULE_DIR/files/"

# 设置脚本权限
chmod 755 "$MODULE_DIR/post-fs-data.sh"
chmod 755 "$MODULE_DIR/service.sh"

# 更新 module.prop 版本
sed -i "s/version=.*/version=v${VERSION}/" "$MODULE_DIR/module.prop"

# 6. 打包 zip
echo "[6/6] Packaging Magisk module zip..."
ZIP_NAME="dashscope-proxy-magisk-v${VERSION}.zip"
cd "$BUILD_DIR"
zip -r "$ZIP_NAME" dashscope-proxy/
cd "$PROJECT_DIR"

cp "$BUILD_DIR/$ZIP_NAME" "$PROJECT_DIR/$ZIP_NAME"

echo ""
echo "=== Build complete! ==="
echo "Output: $PROJECT_DIR/$ZIP_NAME"
echo ""
echo "Module size: $(du -sh "$MODULE_DIR" | cut -f1)"
echo "Zip size:    $(du -sh "$PROJECT_DIR/$ZIP_NAME" | cut -f1)"
echo ""
echo "Install via Magisk Manager or: adb push $ZIP_NAME /sdcard/"
