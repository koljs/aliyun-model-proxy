#!/system/bin/sh

MODDIR=${0%/*}
DATA_DIR=/data/local/dashscope-proxy
LOG_FILE="$DATA_DIR/service.log"
APP_DIR="$MODDIR/files"
NODE_BIN="$DATA_DIR/node"

# 等待系统启动完成
while [ "$(getprop sys.boot_completed)" != "1" ]; do
  sleep 2
done

# 等待网络就绪
sleep 10

# 确保数据目录存在
mkdir -p "$DATA_DIR"
mkdir -p "$DATA_DIR/state"

# 将 node 二进制复制到可执行目录（模块目录可能有 noexec 限制）
if [ ! -x "$NODE_BIN" ]; then
  cp "$APP_DIR/node" "$NODE_BIN"
  chmod 755 "$NODE_BIN"
fi

# 复制默认配置（如果不存在）
if [ ! -f "$DATA_DIR/config.json" ]; then
  cp "$APP_DIR/default-config.json" "$DATA_DIR/config.json"
  chmod 600 "$DATA_DIR/config.json"
fi

# 设置环境变量
export CONFIG_PATH="$DATA_DIR/config.json"
export STATE_PATH="$DATA_DIR/proxy-state.json"
export NODE_ENV=production
export LD_LIBRARY_PATH="/system/lib64:/system/lib:${LD_LIBRARY_PATH:-}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting dashscope-proxy..." >> "$LOG_FILE"

# 守护进程循环
while true; do
  "$NODE_BIN" "$APP_DIR/dist/index.js" >> "$LOG_FILE" 2>&1
  EXIT_CODE=$?
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Process exited with code $EXIT_CODE, restarting in 3s..." >> "$LOG_FILE"
  sleep 3
done
