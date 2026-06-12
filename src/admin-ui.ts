export function getAdminHtml(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>DashScope Model Proxy</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0a0a;--surface:#141414;--surface2:#1c1c1c;--border:#262626;
  --text:#fafafa;--text2:#a1a1aa;--text3:#71717a;
  --accent:#6366f1;--accent2:#818cf8;--accent-bg:rgba(99,102,241,.1);
  --ok:#22c55e;--ok-bg:rgba(34,197,94,.1);
  --warn:#f59e0b;--warn-bg:rgba(245,158,11,.1);
  --err:#ef4444;--err-bg:rgba(239,68,68,.1);
  --r:8px;--font:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  --mono:'SF Mono','Fira Code','Cascadia Code',monospace;
}
html{font-family:var(--font);background:var(--bg);color:var(--text);line-height:1.6;-webkit-text-size-adjust:100%}
body{min-height:100vh}
a{color:var(--accent2);text-decoration:none}
button{font-family:var(--font);cursor:pointer;border:none;border-radius:var(--r);padding:10px 20px;font-size:14px;font-weight:500;transition:all .15s}
input,textarea,select{font-family:var(--font);font-size:14px;background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px;width:100%;outline:none;transition:border-color .15s}
input:focus,textarea:focus,select:focus{border-color:var(--accent)}
textarea{resize:vertical;min-height:80px;font-family:var(--mono);line-height:1.5}
select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23a1a1aa'%3E%3Cpath d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}
label{display:block;font-size:13px;font-weight:500;color:var(--text2);margin-bottom:6px}

.container{max-width:720px;margin:0 auto;padding:16px}
.header{text-align:center;padding:32px 0 24px}
.header h1{font-size:22px;font-weight:600;letter-spacing:-.02em}
.header p{font-size:14px;color:var(--text2);margin-top:4px}

.tabs{display:flex;gap:2px;background:var(--surface);border-radius:var(--r);padding:3px;margin-bottom:20px}
.tab{flex:1;padding:9px 12px;font-size:13px;font-weight:500;color:var(--text2);background:transparent;border-radius:6px;text-align:center;transition:all .15s}
.tab:hover{color:var(--text)}
.tab.active{background:var(--surface2);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,.3)}

.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:20px;margin-bottom:16px}
.card-title{font-size:15px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.card-title .icon{font-size:18px}

.field{margin-bottom:16px}
.field:last-child{margin-bottom:0}
.field-row{display:flex;gap:12px}
.field-row .field{flex:1}

.btn-primary{background:var(--accent);color:#fff}
.btn-primary:hover{background:var(--accent2)}
.btn-danger{background:var(--err);color:#fff}
.btn-danger:hover{background:#dc2626}
.btn-outline{background:transparent;color:var(--text2);border:1px solid var(--border)}
.btn-outline:hover{color:var(--text);border-color:var(--text3)}
.btn-sm{padding:6px 14px;font-size:13px}
.btn-block{width:100%;text-align:center}

.badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:99px;font-size:12px;font-weight:500}
.badge-ok{background:var(--ok-bg);color:var(--ok)}
.badge-err{background:var(--err-bg);color:var(--err)}
.badge-warn{background:var(--warn-bg);color:var(--warn)}

.banner{padding:14px 16px;border-radius:var(--r);margin-bottom:16px;font-size:14px;display:flex;align-items:center;gap:10px}
.banner-warn{background:var(--warn-bg);color:var(--warn);border:1px solid rgba(245,158,11,.2)}
.banner-ok{background:var(--ok-bg);color:var(--ok);border:1px solid rgba(34,197,94,.2)}

.metrics{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:16px}
.metric{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:16px;text-align:center}
.metric-value{font-size:28px;font-weight:700;color:var(--accent2)}
.metric-label{font-size:12px;color:var(--text3);margin-top:2px}

.table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--border);white-space:nowrap}
th{font-weight:500;color:var(--text3);font-size:12px;text-transform:uppercase;letter-spacing:.04em}
tr:hover td{background:var(--surface2)}

.action-card{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);margin-bottom:12px}
.action-info h3{font-size:14px;font-weight:500}
.action-info p{font-size:13px;color:var(--text3);margin-top:2px}

.login-box{max-width:360px;margin:80px auto;padding:32px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)}
.login-box h2{text-align:center;margin-bottom:24px;font-size:18px}

.toast{position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:var(--r);font-size:14px;z-index:999;animation:slideUp .25s ease;max-width:360px}
.toast-ok{background:var(--ok);color:#fff}
.toast-err{background:var(--err);color:#fff}
@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:998}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:24px;max-width:400px;width:90%}
.modal h3{margin-bottom:8px;font-size:16px}
.modal p{font-size:14px;color:var(--text2);margin-bottom:20px}
.modal-actions{display:flex;gap:10px;justify-content:flex-end}

.hidden{display:none!important}
.mono{font-family:var(--mono);font-size:13px}
.refresh-info{font-size:12px;color:var(--text3);margin-top:8px;text-align:center}

@media(max-width:480px){
  .container{padding:12px}
  .header{padding:20px 0 16px}
  .header h1{font-size:18px}
  .metrics{grid-template-columns:repeat(2,1fr);gap:8px}
  .metric{padding:12px}
  .metric-value{font-size:22px}
  .field-row{flex-direction:column;gap:0}
  .action-card{flex-direction:column;align-items:flex-start;gap:12px}
}
</style>
</head>
<body>
<div id="app"></div>
<script>
const $ = (s) => document.querySelector(s)
const $$ = (s) => document.querySelectorAll(s)

const state = {
  authKey: localStorage.getItem('dp-key') || '',
  tab: 'config',
  config: null,
  status: null,
  loading: false,
  refreshTimer: null,
  toastTimer: null,
}

function api(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  if (state.authKey) headers['Authorization'] = 'Bearer ' + state.authKey
  return fetch('/admin' + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
    .then(r => r.json().then(d => ({ ok: r.ok, status: r.status, data: d })))
}

async function checkAuth(key) {
  const r = await fetch('/admin/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key }
  })
  return r.json()
}

async function loadConfig() {
  const r = await api('GET', '/api/config')
  if (r.ok) state.config = r.data
  return r
}

async function loadStatus() {
  const r = await api('GET', '/api/status')
  if (r.ok) state.status = r.data
  return r
}

function render() {
  const app = $('#app')
  if (!state.authKey) {
    app.innerHTML = renderLogin()
    bindLogin()
    return
  }
  app.innerHTML = renderMain()
  bindMain()
  if (state.tab === 'status') startRefresh()
  else stopRefresh()
}

function renderLogin() {
  return \`
  <div class="login-box">
    <h2>DashScope Proxy</h2>
    <div class="field">
      <label>管理密钥 (Proxy API Key)</label>
      <input type="password" id="login-key" placeholder="输入管理密钥" autocomplete="current-password">
    </div>
    <button class="btn-primary btn-block" id="login-btn" style="margin-top:16px">登录</button>
    <p style="margin-top:12px;font-size:13px;color:var(--text3);text-align:center">默认密钥: admin</p>
  </div>\`
}

function bindLogin() {
  const btn = $('#login-btn')
  const input = $('#login-key')
  async function doLogin() {
    const key = input.value.trim()
    if (!key) return
    btn.textContent = '验证中...'
    btn.disabled = true
    const r = await checkAuth(key)
    if (r.ok) {
      state.authKey = key
      localStorage.setItem('dp-key', key)
      render()
    } else {
      btn.textContent = '登录'
      btn.disabled = false
      showToast('密钥错误', 'err')
    }
  }
  btn.onclick = doLogin
  input.onkeydown = (e) => { if (e.key === 'Enter') doLogin() }
  input.focus()
}

function renderMain() {
  const cfg = state.config
  const isConfigured = cfg && cfg.isConfigured
  let bannerHtml = ''
  if (cfg && !isConfigured) {
    bannerHtml = '<div class="banner banner-warn">请先配置 DashScope API Keys 和模型 ID，代理服务才能正常工作</div>'
  } else if (cfg && isConfigured) {
    bannerHtml = '<div class="banner banner-ok">代理服务已配置，正在运行</div>'
  }

  return \`
  <div class="container">
    <div class="header">
      <h1>DashScope Model Proxy</h1>
      <p>阿里云百炼模型代理管理后台</p>
    </div>
    \${bannerHtml}
    <div class="tabs">
      <button class="tab\${state.tab==='config'?' active':''}" data-tab="config">配置</button>
      <button class="tab\${state.tab==='status'?' active':''}" data-tab="status">状态</button>
      <button class="tab\${state.tab==='actions'?' active':''}" data-tab="actions">操作</button>
    </div>
    <div id="tab-content">\${renderTabContent()}</div>
    <div style="text-align:center;margin-top:20px">
      <button class="btn-outline btn-sm" id="logout-btn">退出登录</button>
    </div>
  </div>\`
}

function renderTabContent() {
  if (state.tab === 'config') return renderConfigTab()
  if (state.tab === 'status') return renderStatusTab()
  return renderActionsTab()
}

function renderConfigTab() {
  const cfg = state.config
  if (!cfg) return '<div class="card"><p style="color:var(--text3)">加载中...</p></div>'
  return \`
  <div class="card">
    <div class="card-title"><span class="icon">\\u2699</span> 服务配置</div>
    <div class="field-row">
      <div class="field">
        <label>端口</label>
        <input type="number" id="cfg-port" value="\${cfg.port}" min="1" max="65535">
      </div>
      <div class="field">
        <label>上游认证模式</label>
        <select id="cfg-auth-mode">
          <option value="authorization"\${cfg.upstreamAuthMode==='authorization'?' selected':''}>Authorization</option>
          <option value="x-api-key"\${cfg.upstreamAuthMode==='x-api-key'?' selected':''}>X-Api-Key</option>
          <option value="both"\${cfg.upstreamAuthMode==='both'?' selected':''}>Both</option>
        </select>
      </div>
    </div>
    <div class="field">
      <label>代理密钥 (Proxy API Key)</label>
      <input type="text" id="cfg-proxy-key" value="\${cfg.proxyApiKey}" placeholder="客户端调用代理时使用的密钥">
    </div>
    <div class="field">
      <label>DashScope API Keys <span style="color:var(--text3)">(每行一个)</span></label>
      <textarea id="cfg-api-keys" placeholder="sk-your-dashscope-key-1\\nsk-your-dashscope-key-2">\${cfg.dashscopeApiKeysRaw.join('\\n')}</textarea>
    </div>
    <div class="field">
      <label>模型 ID <span style="color:var(--text3)">(每行一个)</span></label>
      <textarea id="cfg-model-ids" placeholder="qwen3.7-max\\nqwen3.7-plus">\${cfg.modelIds.join('\\n')}</textarea>
    </div>
    <div class="field">
      <label>Anthropic 上游地址</label>
      <input type="text" id="cfg-upstream" value="\${cfg.upstreamBaseUrl}">
    </div>
    <div class="field">
      <label>OpenAI 上游地址</label>
      <input type="text" id="cfg-openai-upstream" value="\${cfg.openAIUpstreamBaseUrl}">
    </div>
    <div class="field-row">
      <div class="field">
        <label>冷却时长 (秒)</label>
        <input type="number" id="cfg-cooldown" value="\${cfg.cooldownSeconds}" min="60">
      </div>
      <div class="field">
        <label>CORS Origin</label>
        <input type="text" id="cfg-cors" value="\${cfg.corsOrigin === false ? 'false' : cfg.corsOrigin}">
      </div>
    </div>
    <button class="btn-primary btn-block" id="save-config-btn" style="margin-top:8px">保存配置并重启</button>
  </div>\`
}

function renderStatusTab() {
  const st = state.status
  if (!st) return '<div class="card"><p style="color:var(--text3)">加载中...</p></div>'
  const h = st.health
  const pct = h.totalSlots > 0 ? Math.round(h.availableSlots / h.totalSlots * 100) : 0
  return \`
  <div class="metrics">
    <div class="metric"><div class="metric-value">\${h.totalKeys}</div><div class="metric-label">API Keys</div></div>
    <div class="metric"><div class="metric-value">\${h.modelsPerKey}</div><div class="metric-label">每 Key 模型数</div></div>
    <div class="metric"><div class="metric-value">\${h.availableSlots}/\${h.totalSlots}</div><div class="metric-label">可用槽位</div></div>
    <div class="metric"><div class="metric-value">\${pct}%</div><div class="metric-label">可用率</div></div>
  </div>
  <div class="card">
    <div class="card-title"><span class="icon">\\uD83D\\uDCCA</span> 模型池状态</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Key</th><th>模型</th><th>状态</th><th>失败</th><th>冷却至</th><th>最近错误</th></tr></thead>
        <tbody>\${st.models.map(m => \`<tr>
          <td class="mono">\${m.keyHash}</td>
          <td class="mono">\${m.id}</td>
          <td>\${m.available ? '<span class="badge badge-ok">可用</span>' : '<span class="badge badge-err">冷却</span>'}</td>
          <td>\${m.failureCount > 0 ? '<span class="badge badge-warn">' + m.failureCount + '</span>' : '0'}</td>
          <td class="mono" style="font-size:12px">\${m.cooldownUntil ? new Date(m.cooldownUntil).toLocaleString('zh-CN') : '-'}</td>
          <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis" title="\${m.lastError||''}">\${m.lastError || '-'}</td>
        </tr>\`).join('')}</tbody>
      </table>
    </div>
    <div class="refresh-info">自动刷新: 10s</div>
  </div>\`
}

function renderActionsTab() {
  return \`
  <div class="action-card">
    <div class="action-info">
      <h3>清除所有冷却状态</h3>
      <p>重置所有模型的冷却计时，使其立即可用</p>
    </div>
    <button class="btn-outline btn-sm" id="clear-cooldown-btn">清除冷却</button>
  </div>
  <div class="action-card">
    <div class="action-info">
      <h3>重启服务</h3>
      <p>重启代理进程，重新加载配置</p>
    </div>
    <button class="btn-primary btn-sm" id="restart-btn">重启</button>
  </div>
  <div class="action-card">
    <div class="action-info">
      <h3>重置配置</h3>
      <p>删除当前配置文件，恢复为默认配置</p>
    </div>
    <button class="btn-danger btn-sm" id="reset-config-btn">重置</button>
  </div>\`
}

function bindMain() {
  $$('.tab').forEach(t => {
    t.onclick = () => {
      state.tab = t.dataset.tab
      render()
    }
  })
  $('#logout-btn').onclick = () => {
    state.authKey = ''
    localStorage.removeItem('dp-key')
    stopRefresh()
    render()
  }
  if (state.tab === 'config') bindConfigTab()
  if (state.tab === 'status') loadStatus().then(render)
  if (state.tab === 'actions') bindActionsTab()
}

function bindConfigTab() {
  $('#save-config-btn').onclick = async () => {
    const btn = $('#save-config-btn')
    const apiKeys = $('#cfg-api-keys').value.split('\\n').map(s => s.trim()).filter(Boolean)
    const modelIds = $('#cfg-model-ids').value.split('\\n').map(s => s.trim()).filter(Boolean)
    const body = {
      port: Number($('#cfg-port').value),
      proxyApiKeyRaw: $('#cfg-proxy-key').value.trim(),
      dashscopeApiKeysRaw: apiKeys,
      modelIds,
      upstreamBaseUrl: $('#cfg-upstream').value.trim(),
      openAIUpstreamBaseUrl: $('#cfg-openai-upstream').value.trim(),
      cooldownSeconds: Number($('#cfg-cooldown').value),
      upstreamAuthMode: $('#cfg-auth-mode').value,
      corsOrigin: $('#cfg-cors').value.trim(),
    }
    btn.textContent = '保存中...'
    btn.disabled = true
    const r = await api('PUT', '/api/config', body)
    if (r.ok) {
      showToast('配置已保存，正在重启...', 'ok')
      setTimeout(() => {
        api('POST', '/api/restart').catch(() => {})
      }, 500)
    } else {
      showToast(r.data.error || '保存失败', 'err')
      btn.textContent = '保存配置并重启'
      btn.disabled = false
    }
  }
}

function bindActionsTab() {
  $('#clear-cooldown-btn').onclick = () => {
    showConfirm('确定要清除所有冷却状态吗？', async () => {
      const r = await api('POST', '/api/cooldown/clear')
      showToast(r.ok ? '冷却状态已清除' : '操作失败', r.ok ? 'ok' : 'err')
    })
  }
  $('#restart-btn').onclick = () => {
    showConfirm('确定要重启服务吗？', () => {
      showToast('正在重启...', 'ok')
      api('POST', '/api/restart').catch(() => {})
    })
  }
  $('#reset-config-btn').onclick = () => {
    showConfirm('确定要重置配置吗？此操作不可恢复！', async () => {
      const r = await api('PUT', '/api/config', {
        port: 3300,
        proxyApiKeyRaw: 'admin',
        dashscopeApiKeysRaw: [],
        modelIds: [],
        upstreamBaseUrl: 'https://dashscope.aliyuncs.com/apps/anthropic',
        openAIUpstreamBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        cooldownSeconds: 2592000,
        upstreamAuthMode: 'authorization',
        corsOrigin: '*',
      })
      if (r.ok) {
        showToast('配置已重置，正在重启...', 'ok')
        state.authKey = 'admin'
        localStorage.setItem('dp-key', 'admin')
        setTimeout(() => api('POST', '/api/restart').catch(() => {}), 500)
      } else {
        showToast('重置失败', 'err')
      }
    })
  }
}

function startRefresh() {
  stopRefresh()
  state.refreshTimer = setInterval(async () => {
    if (state.tab === 'status') {
      await loadStatus()
      const content = $('#tab-content')
      if (content) content.innerHTML = renderStatusTab()
    }
  }, 10000)
}

function stopRefresh() {
  if (state.refreshTimer) {
    clearInterval(state.refreshTimer)
    state.refreshTimer = null
  }
}

function showToast(msg, type) {
  const old = $('.toast')
  if (old) old.remove()
  clearTimeout(state.toastTimer)
  const el = document.createElement('div')
  el.className = 'toast toast-' + type
  el.textContent = msg
  document.body.appendChild(el)
  state.toastTimer = setTimeout(() => el.remove(), 3000)
}

function showConfirm(msg, onConfirm) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.innerHTML = \`
  <div class="modal">
    <h3>确认操作</h3>
    <p>\${msg}</p>
    <div class="modal-actions">
      <button class="btn-outline btn-sm" id="modal-cancel">取消</button>
      <button class="btn-primary btn-sm" id="modal-confirm">确认</button>
    </div>
  </div>\`
  document.body.appendChild(overlay)
  $('#modal-cancel').onclick = () => overlay.remove()
  $('#modal-confirm').onclick = () => { overlay.remove(); onConfirm() }
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove() }
}

async function init() {
  if (state.authKey) {
    const r = await checkAuth(state.authKey)
    if (!r.ok) {
      state.authKey = ''
      localStorage.removeItem('dp-key')
    } else {
      await loadConfig()
    }
  }
  render()
}

init()
</script>
</body>
</html>`
}
