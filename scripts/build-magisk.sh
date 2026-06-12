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

# Ubuntu arm64 rootfs（提供 glibc 运行时库，Android 不包含 glibc）
UBUNTU_ROOTFS_URL="https://cdimage.ubuntu.com/ubuntu-base/releases/22.04/release/ubuntu-base-22.04.5-base-arm64.tar.gz"

# 从 package.json 读取版本
VERSION=$(node -e "console.log(require('$PROJECT_DIR/package.json').version)")

echo "=== DashScope Model Proxy - Magisk Module Builder ==="
echo "Version: v${VERSION}"
echo "Node.js: v${NODE_VERSION} (${NODE_ARCH})"
echo ""

# 清理旧构建
rm -rf "$BUILD_DIR"
mkdir -p "$MODULE_DIR/files"

# 1. 使用 esbuild 打包为单文件（所有依赖内联，无需 node_modules）
echo "[1/6] Bundling with esbuild..."
cd "$PROJECT_DIR"
pnpm build:bundle

# 2. 下载 Node.js 二进制
echo "[2/6] Downloading Node.js v${NODE_VERSION} (${NODE_ARCH})..."
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

# 3. 下载 glibc 运行时库（Android 使用 Bionic libc，需要捆绑 glibc 才能运行标准 Linux 二进制）
echo "[3/6] Downloading glibc libraries for Android compatibility..."
ROOTFS_TAR="$BUILD_DIR/ubuntu-rootfs.tar.gz"
ROOTFS_DIR="$BUILD_DIR/rootfs"

if [ -f "$ROOTFS_TAR" ]; then
  echo "  Using cached rootfs download"
else
  curl -L -o "$ROOTFS_TAR" "$UBUNTU_ROOTFS_URL"
fi

echo "  Extracting rootfs..."
rm -rf "$ROOTFS_DIR"
mkdir -p "$ROOTFS_DIR"
tar xzf "$ROOTFS_TAR" -C "$ROOTFS_DIR"

LIB_DIR="$MODULE_DIR/files/lib"
mkdir -p "$LIB_DIR"

# 复制 Node.js 运行所需的 glibc 共享库（跟随符号链接复制实际文件）
for lib in ld-linux-aarch64.so.1 libc.so.6 libm.so.6 libdl.so.2 librt.so.1 libpthread.so.0 libstdc++.so.6 libgcc_s.so.1; do
  found=$(find "$ROOTFS_DIR" -name "$lib" \( -type f -o -type l \) | head -1)
  if [ -n "$found" ]; then
    cp -L "$found" "$LIB_DIR/"
    echo "  Copied: $lib"
  else
    echo "  WARNING: $lib not found in rootfs"
  fi
done

# 验证关键文件
if [ ! -f "$LIB_DIR/ld-linux-aarch64.so.1" ]; then
  echo "ERROR: Failed to extract glibc dynamic linker"
  exit 1
fi

# 4. 复制编译产物（单文件 bundle，无需 node_modules）
echo "[4/6] Copying application bundle..."
mkdir -p "$MODULE_DIR/files/dist"
cp "$PROJECT_DIR/dist/index.js" "$MODULE_DIR/files/dist/index.js"

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
cd "$MODULE_DIR"
zip -r "$BUILD_DIR/$ZIP_NAME" .
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
