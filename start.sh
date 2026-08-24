#!/usr/bin/env bash
# KOL BD Tool 一键启动 + 实时监控面板
# 用法:  bash ./start.sh
#        chmod +x ./start.sh && ./start.sh
# Ctrl+C（或关闭终端）退出监控并释放前后端端口

set -u
set -o pipefail

# ── 路径 / 端口 ──────────────────────────────────────────────────
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
SQLITE_DB="$BACKEND_DIR/prisma/dev.db"

BACKEND_LOG="/tmp/bdtool-backend.log"
FRONTEND_LOG="/tmp/bdtool-frontend.log"

BASE_BACKEND_PORT="3000"
BASE_FRONTEND_PORT="5173"
BACKEND_PORT="$BASE_BACKEND_PORT"
FRONTEND_PORT="$BASE_FRONTEND_PORT"

REFRESH_INTERVAL=4   # 监控面板刷新间隔（秒）
LOG_LINES=10         # 面板内每侧日志行数

# ── 颜色 ─────────────────────────────────────────────────────────
R='\033[0;31m'   # red
G='\033[0;32m'   # green
Y='\033[1;33m'   # yellow
B='\033[0;34m'   # blue
C='\033[0;36m'   # cyan
M='\033[0;35m'   # magenta
W='\033[1;37m'   # bold white
DIM='\033[2m'    # dim
BOLD='\033[1m'
NC='\033[0m'     # reset

# ── 基础工具函数 ──────────────────────────────────────────────────
ok()   { echo -e "${G}  ✓  $1${NC}"; }
warn() { echo -e "${Y}  ⚠  $1${NC}"; }
err()  { echo -e "${R}  ✗  $1${NC}"; }
info() { echo -e "${C}  →  $1${NC}"; }

port_is_open() {
  ss -tln 2>/dev/null | grep -q ":${1} "
}

pids_by_port() {
  lsof -ti :"$1" 2>/dev/null || true
}

kill_port_processes() {
  local port="$1" name="$2"
  local pids
  pids=$(pids_by_port "$port")
  [ -z "$pids" ] && return 0

  info "停止${name}进程 (port ${port}, pid: ${pids//$'\n'/, })"
  echo "$pids" | xargs kill 2>/dev/null || true
  sleep 1

  local left
  left=$(pids_by_port "$port")
  if [ -n "$left" ]; then
    echo "$left" | xargs kill -9 2>/dev/null || true
  fi
}

find_available_port() {
  local start="$1" max_tries="${2:-50}" port="$1" i=0
  while [ "$i" -lt "$max_tries" ]; do
    if ! port_is_open "$port"; then
      echo "$port"
      return 0
    fi
    port=$((port + 1))
    i=$((i + 1))
  done
  return 1
}

sqlite_ready() {
  [ -f "$SQLITE_DB" ]
}

backend_healthy() {
  curl -fsS --noproxy '*' "http://localhost:${BACKEND_PORT}/health" >/dev/null 2>&1
}

wait_for_backend_healthy() {
  local retry="${1:-90}" i=1
  while [ "$i" -le "$retry" ]; do
    if backend_healthy; then
      return 0
    fi
    sleep 1
    i=$((i + 1))
  done
  return 1
}

wait_for_port() {
  local port="$1" retry="$2" i=1
  while [ "$i" -le "$retry" ]; do
    port_is_open "$port" && return 0
    sleep 1; i=$((i + 1))
  done
  return 1
}

# 经 Vite 代理访问后端（未登录时 /auth/me 返回 401 也说明链路通）
vite_proxy_chain_ready() {
  local code
  code=$(curl -sS -o /dev/null -w "%{http_code}" --noproxy '*' \
    "http://127.0.0.1:${FRONTEND_PORT}/api/v1/auth/me" 2>/dev/null || echo "000")
  [ "$code" = "401" ] || [ "$code" = "200" ]
}

wait_for_vite_proxy_chain() {
  local retry="${1:-45}" i=1
  while [ "$i" -le "$retry" ]; do
    vite_proxy_chain_ready && return 0
    sleep 1
    i=$((i + 1))
  done
  return 1
}

ensure_pnpm() {
  if ! command -v pnpm >/dev/null 2>&1; then
    err "未找到 pnpm，请先安装: npm install -g pnpm"
    return 1
  fi
}

ensure_deps() {
  local dir="$1" name="$2"
  if [ ! -d "$dir/node_modules" ]; then
    info "安装 ${name} 依赖 (pnpm install)..."
    (cd "$dir" && pnpm install) || return 1
    ok "${name} 依赖已安装"
  fi
}

# ── 启动序列 ──────────────────────────────────────────────────────
run_startup() {
  echo ""
  echo -e "${BOLD}${C}  ╔══════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}${C}  ║   KOL BD Tool  ·  启动中                 ║${NC}"
  echo -e "${BOLD}${C}  ╚══════════════════════════════════════════╝${NC}"
  echo ""

  ensure_pnpm || return 1

  if [ ! -f "$BACKEND_DIR/.env" ]; then
    err "缺少 backend/.env，请先执行: cp backend/.env.example backend/.env"
    return 1
  fi

  # Step 1: SQLite + Prisma
  echo -e "${Y}  [1/3]  SQLite / Prisma${NC}"
  ensure_deps "$BACKEND_DIR" "后端" || return 1

  cd "$BACKEND_DIR" || return 1
  info "生成 Prisma Client..."
  if ! pnpm db:generate >/dev/null 2>&1; then
    err "prisma generate 失败"
    return 1
  fi

  info "同步数据库迁移…"
  if ! pnpm exec prisma migrate deploy >/dev/null; then
    err "数据库迁移失败，请检查 DATABASE_URL 与 prisma/dev.db"
    return 1
  fi

  if sqlite_ready; then
    ok "SQLite 已就绪 ($SQLITE_DB)"
  else
    err "未找到 SQLite 文件: $SQLITE_DB"
    return 1
  fi

  # Step 2: 后端
  echo ""
  echo -e "${Y}  [2/3]  后端 Express${NC}"
  if backend_healthy; then
    ok "后端已在运行 (http://localhost:${BACKEND_PORT})"
  else
    if port_is_open "$BACKEND_PORT"; then
      local next_backend_port
      next_backend_port=$(find_available_port "$BACKEND_PORT" 100) || {
        err "后端未找到可用端口（从 ${BACKEND_PORT} 开始）"
        return 1
      }
      if [ "$next_backend_port" != "$BACKEND_PORT" ]; then
        warn "端口 ${BACKEND_PORT} 已被占用，后端自动切换到 ${next_backend_port}"
        BACKEND_PORT="$next_backend_port"
      fi
    fi
    cd "$BACKEND_DIR" || return 1
    : > "$BACKEND_LOG"
    info "启动后端进程 (pnpm dev, PORT=${BACKEND_PORT})..."
    nohup env PORT="$BACKEND_PORT" pnpm dev >"$BACKEND_LOG" 2>&1 &
    info "等待后端就绪（首次编译可能较慢，最多约 90s）..."
    if wait_for_backend_healthy 90; then
      ok "后端启动成功 (http://localhost:${BACKEND_PORT})"
    else
      err "后端未及时通过 /health；请查看 $BACKEND_LOG"
      return 1
    fi
  fi

  # Step 3: 前端
  echo ""
  echo -e "${Y}  [3/3]  前端 Vite${NC}"
  ensure_deps "$FRONTEND_DIR" "前端" || return 1

  if port_is_open "$FRONTEND_PORT" && \
     curl -fsS --noproxy '*' "http://127.0.0.1:${FRONTEND_PORT}/" >/dev/null 2>&1; then
    info "检测到前端已在监听，校验 Vite→后端代理…"
    if wait_for_vite_proxy_chain 20; then
      ok "前端已在运行：http://localhost:${FRONTEND_PORT}"
    else
      warn "当前前端的代理可能未连通后端（或仍为旧实例）；首页若报错请 Ctrl+C 后重新 ./start.sh"
    fi
  else
    if port_is_open "$FRONTEND_PORT"; then
      local next_frontend_port
      next_frontend_port=$(find_available_port "$FRONTEND_PORT" 100) || {
        err "前端未找到可用端口（从 ${FRONTEND_PORT} 开始）"
        return 1
      }
      if [ "$next_frontend_port" != "$FRONTEND_PORT" ]; then
        warn "端口 ${FRONTEND_PORT} 已被占用，前端自动切换到 ${next_frontend_port}"
        FRONTEND_PORT="$next_frontend_port"
      fi
    fi
    cd "$FRONTEND_DIR" || return 1
    : > "$FRONTEND_LOG"
    info "启动前端进程 (pnpm dev, PORT=${FRONTEND_PORT}, 代理后端=http://127.0.0.1:${BACKEND_PORT})..."
    nohup env BDTOOL_BACKEND_PROXY_TARGET="http://127.0.0.1:${BACKEND_PORT}" \
      pnpm dev --port "$FRONTEND_PORT" --strictPort >"$FRONTEND_LOG" 2>&1 &
    if wait_for_port "$FRONTEND_PORT" 30; then
      info "校验 Vite→后端代理…"
      if wait_for_vite_proxy_chain 60; then
        ok "前端启动成功：http://localhost:${FRONTEND_PORT}"
      else
        err "Vite 已监听但 API 代理未到后端 → $FRONTEND_LOG"
        return 1
      fi
    else
      err "前端启动失败 → $FRONTEND_LOG"
      return 1
    fi
  fi

  echo ""
}

# ── 格式化时间戳 ──────────────────────────────────────────────────
timestamp() { date '+%H:%M:%S'; }
datestamp() { date '+%Y-%m-%d'; }

# ── 服务状态标签（带颜色） ────────────────────────────────────────
svc_label() {
  local kind="$1" up=false
  case "$kind" in
    sqlite)  sqlite_ready && up=true ;;
    backend) port_is_open "$BACKEND_PORT" && backend_healthy && up=true ;;
    frontend) port_is_open "$FRONTEND_PORT" && up=true ;;
  esac
  if $up; then
    echo -e "${G}● UP${NC}"
  else
    echo -e "${R}● DOWN${NC}"
  fi
}

svc_state() {
  local kind="$1" up=false
  case "$kind" in
    sqlite)  sqlite_ready && up=true ;;
    backend) port_is_open "$BACKEND_PORT" && backend_healthy && up=true ;;
    frontend) port_is_open "$FRONTEND_PORT" && up=true ;;
  esac
  $up && echo "UP" || echo "DOWN"
}

# ── 取日志最后 N 行，过滤 ANSI，截断宽度 ─────────────────────────
last_lines() {
  local file="$1" n="$2" width="$3"
  if [ ! -f "$file" ] || [ ! -s "$file" ]; then
    echo -e "${DIM}    (暂无日志)${NC}"
    return
  fi
  tail -n "$n" "$file" 2>/dev/null | while IFS= read -r line; do
    local clean
    clean=$(printf '%s' "$line" | sed 's/\x1b\[[0-9;]*[mGKHF]//g')
    clean="${clean:0:$width}"
    echo -e "  ${DIM}${clean}${NC}"
  done
}

# ── 主监控面板（单次渲染） ────────────────────────────────────────
render_dashboard() {
  local cols
  cols=$(tput cols 2>/dev/null || echo 100)
  local inner=$((cols - 4))
  local half=$(( inner / 2 - 1 ))

  local now today
  now=$(timestamp)
  today=$(datestamp)

  local db_state be_state fe_state
  db_state=$(svc_state sqlite)
  be_state=$(svc_state backend)
  fe_state=$(svc_state frontend)

  clear
  printf "${BOLD}${C}"
  printf '  ╔'; printf '═%.0s' $(seq 1 $((cols - 4))); printf '╗\n'
  local title="  KOL BD Tool  监控面板"
  local ts_str="  ${today}  ${now}  "
  printf "  ║${NC}${BOLD}${W}%-*s${NC}${DIM}%*s${NC}${BOLD}${C}  ║\n" \
    $(( (cols - 4 - ${#ts_str}) )) "$title" "${#ts_str}" "$ts_str"
  printf "${BOLD}${C}  ╠"; printf '═%.0s' $(seq 1 $((cols - 4))); printf '╣\n'
  printf "  ╚"; printf '═%.0s' $(seq 1 $((cols - 4))); printf "╝${NC}\n"

  echo ""
  echo -e "  ${BOLD}${W}服务状态${NC}"
  echo -e "  ${DIM}──────────────────────────────────────────────────────────${NC}"

  local db_lbl be_lbl fe_lbl
  db_lbl=$(svc_label sqlite)
  be_lbl=$(svc_label backend)
  fe_lbl=$(svc_label frontend)

  printf "  ${M}%-16s${NC}" "SQLite"
  printf " %b" "$db_lbl"
  printf "  ${DIM}%s${NC}" "prisma/dev.db"
  if [ "$db_state" = "UP" ]; then
    printf "  ${G}file OK${NC}"
  fi
  echo ""

  printf "  ${M}%-16s${NC}" "Backend  Express"
  printf " %b" "$be_lbl"
  printf "  ${DIM}http://localhost:%-6s${NC}" "$BACKEND_PORT"
  if [ "$be_state" = "UP" ]; then
    printf "  ${G}/health OK${NC}  ${DIM}API: http://localhost:${BACKEND_PORT}/api/v1${NC}"
  fi
  echo ""

  printf "  ${M}%-16s${NC}" "Frontend Vite"
  printf " %b" "$fe_lbl"
  printf "  ${DIM}http://localhost:%-6s${NC}" "$FRONTEND_PORT"
  if [ "$fe_state" = "UP" ]; then
    printf "  ${G}dev server OK${NC}"
  fi
  echo ""

  echo ""
  if [ "$db_state" = "UP" ] && [ "$be_state" = "UP" ] && [ "$fe_state" = "UP" ]; then
    echo -e "  ${BOLD}${G}  ✦  所有服务正常运行  ✦${NC}"
  else
    local down_list=""
    [ "$db_state" != "UP" ] && down_list+=" SQLite"
    [ "$be_state" != "UP" ] && down_list+=" Backend"
    [ "$fe_state" != "UP" ] && down_list+=" Frontend"
    echo -e "  ${BOLD}${R}  ✗  服务异常:${down_list}${NC}"
  fi

  echo ""
  echo -e "  ${BOLD}${W}实时日志${NC}  ${DIM}(最近 ${LOG_LINES} 行)${NC}"
  echo -e "  ${DIM}──────────────────────────────────────────────────────────${NC}"

  printf "  ${C}${BOLD}%-*s${NC}" $((half + 2)) "后端  $BACKEND_LOG"
  printf "  ${C}${BOLD}%-*s${NC}\n" $((half + 2)) "前端  $FRONTEND_LOG"

  local be_lines fe_lines
  mapfile -t be_lines < <(last_lines "$BACKEND_LOG"  "$LOG_LINES" "$half")
  mapfile -t fe_lines < <(last_lines "$FRONTEND_LOG" "$LOG_LINES" "$half")

  local max_i=$(( LOG_LINES > ${#be_lines[@]} ? LOG_LINES : ${#be_lines[@]} ))
  local total_i=$(( max_i > ${#fe_lines[@]} ? max_i : ${#fe_lines[@]} ))

  for (( i=0; i<total_i; i++ )); do
    local bl="${be_lines[$i]:-}"
    local fl="${fe_lines[$i]:-}"
    printf "  %-*b  %-*b\n" "$half" "$bl" "$half" "$fl"
  done

  echo ""
  echo -e "  ${DIM}──────────────────────────────────────────────────────────${NC}"
  echo -e "  ${DIM}Ctrl+C 退出并释放端口    刷新间隔 ${REFRESH_INTERVAL}s    日志: /tmp/bdtool-*.log${NC}"
  echo ""
}

# ── 退出处理 ──────────────────────────────────────────────────────
CLEANED=0
on_exit() {
  [ "$CLEANED" = "1" ] && return 0
  CLEANED=1
  echo ""
  echo -e "${Y}  正在退出监控并清理前后端进程...${NC}"
  kill_port_processes "$BACKEND_PORT" "后端"
  kill_port_processes "$FRONTEND_PORT" "前端"
  echo -e "${G}  已清理：后端 ${BACKEND_PORT} / 前端 ${FRONTEND_PORT}${NC}"
  echo ""
  exit 0
}
trap on_exit INT TERM HUP

# ═══════════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════════
run_startup || exit $?

echo ""
echo -e "${G}  在浏览器打开:${NC} ${BOLD}http://localhost:${FRONTEND_PORT}${NC}"
echo -e "${DIM}  API 经 Vite 代理转发到后端 (http://127.0.0.1:${BACKEND_PORT})${NC}"
echo ""
echo -e "${C}  进入实时监控面板 (每 ${REFRESH_INTERVAL}s 刷新)...  按 Ctrl+C 退出并释放端口${NC}"
sleep 1

while true; do
  render_dashboard
  sleep "$REFRESH_INTERVAL"
done
