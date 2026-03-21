export const STYLES = `
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: #e5e5e5; margin: 0; padding: 2rem; }
    h1 { color: #fff; font-size: 1.5rem; margin-bottom: 0.25rem; }
    .subtitle { color: #737373; font-size: 0.9rem; margin-bottom: 2rem; }
    h2 { color: #a3a3a3; margin-top: 2.5rem; font-size: 1.1rem; border-bottom: 1px solid #262626; padding-bottom: 0.5rem; }
    .summary { display: flex; gap: 1rem; flex-wrap: wrap; margin: 1.5rem 0; }
    .card { background: #171717; border: 1px solid #262626; border-radius: 8px; padding: 1rem 1.5rem; }
    .card .label { color: #737373; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .card .value { font-size: 1.4rem; font-weight: 700; margin-top: 0.25rem; }
    .card .sub { font-size: 0.8rem; color: #525252; margin-top: 0.25rem; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: 0.9rem; }
    th, td { padding: 0.5rem 0.75rem; text-align: right; border: 1px solid #262626; }
    th { background: #111; color: #a3a3a3; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; }
    td:first-child, th:first-child { text-align: left; }
    .best { font-weight: 700; color: #22c55e; }
    .reduction { display: block; font-size: 0.72rem; margin-top: 2px; }
    .pos { color: #22c55e; } .neg { color: #ef4444; } .zero { color: #737373; }
    .results td { padding: 0.35rem 0.5rem; vertical-align: middle; min-width: 80px; }
    .results .raw-cell { opacity: 0.5; }
    .results .scenario-name { font-weight: 500; white-space: nowrap; min-width: 0; }
    .cell-bar { height: 6px; background: #1a1a1a; border-radius: 3px; margin-bottom: 4px; overflow: hidden; }
    .cell-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
    .cell-val { display: flex; justify-content: space-between; align-items: baseline; gap: 4px; }
    .cell-val span:first-child { font-size: 0.9rem; font-weight: 600; font-variant-numeric: tabular-nums; }
    .meta td, .meta th { border-color: #1a1a1a; padding: 0.35rem 0.75rem; font-size: 0.82rem; }
    .meta td:nth-child(7) { text-align: center; }
    .meta .meta-desc { color: #737373; font-size: 0.78rem; max-width: 280px; text-align: left; }
    .era-sep td { background: #111; border-color: #1a1a1a; padding: 0.5rem 0.75rem; color: #a3a3a3; font-size: 0.78rem; }
    .era-tag { background: #262626; color: #e5e5e5; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.15rem 0.5rem; border-radius: 3px; margin-right: 0.5rem; }
    .charts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1rem; margin-top: 1rem; }
    .url-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .url-tab { background: #171717; border: 1px solid #262626; color: #737373; padding: 0.35rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.82rem; transition: all 0.1s; }
    .url-tab:hover { border-color: #404040; color: #a3a3a3; }
    .url-tab.active { background: #262626; color: #e5e5e5; border-color: #404040; }
    .url-panel { display: flex; flex-direction: column; gap: 0.5rem; }
    .url-panel.hidden { display: none; }
    .url-row { background: #111; border: 1px solid #1e1e1e; border-radius: 6px; padding: 0.6rem 0.75rem; display: flex; flex-direction: column; gap: 0.35rem; }
    .url-row.url-best { border-color: #166534; }
    .url-meta { display: flex; align-items: center; gap: 0.5rem; }
    .url-ver { background: #1e1e1e; color: #a3a3a3; font-family: monospace; font-size: 0.75rem; padding: 0.1rem 0.4rem; border-radius: 3px; }
    .url-name { color: #525252; font-size: 0.8rem; }
    .url-len { margin-left: auto; font-size: 0.78rem; font-family: monospace; font-weight: 600; }
    .url-content { display: flex; align-items: flex-start; gap: 0.5rem; }
    .url-text { font-family: monospace; font-size: 0.7rem; color: #525252; word-break: break-all; flex: 1; line-height: 1.6; }
    .url-best .url-text { color: #737373; }
    .copy-btn { background: #1e1e1e; border: 1px solid #333; color: #737373; padding: 0.25rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem; white-space: nowrap; flex-shrink: 0; transition: all 0.1s; }
    .copy-btn:hover { background: #262626; color: #e5e5e5; border-color: #404040; }
    .edu-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .edu-tab { background: #171717; border: 1px solid #262626; color: #737373; padding: 0.4rem 0.85rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; font-family: monospace; transition: all 0.15s; }
    .edu-tab:hover { border-color: #404040; color: #a3a3a3; }
    .edu-tab.active { background: #262626; color: #e5e5e5; border-color: #404040; }
    .edu-panel { background: #111; border: 1px solid #1e1e1e; border-radius: 8px; padding: 1.25rem; }
    .edu-panel.hidden { display: none; }
    .edu-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; gap: 0.75rem; }
    .edu-ver { font-family: monospace; font-size: 1.1rem; font-weight: 700; color: #e5e5e5; margin-right: 0.5rem; }
    .edu-name { color: #a3a3a3; font-size: 0.95rem; }
    .edu-era { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.15rem 0.5rem; border-radius: 3px; color: #fff; margin-left: 0.5rem; }
    .edu-section { margin-bottom: 1rem; }
    .edu-section-title { color: #737373; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; margin-bottom: 0.5rem; }
    .edu-dim { font-weight: 400; text-transform: none; letter-spacing: 0; }
    .edu-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .pipe-flow { display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; }
    .pipe-step { border: 1px solid; padding: 0.3rem 0.6rem; border-radius: 5px; font-size: 0.8rem; font-weight: 500; white-space: nowrap; }
    .pipe-arrow { color: #404040; font-size: 0.9rem; }
    .struct-bar-container { display: flex; height: 28px; border-radius: 5px; overflow: hidden; margin-bottom: 0.35rem; }
    .struct-seg { display: flex; align-items: center; justify-content: center; min-width: 0; overflow: hidden; transition: width 0.3s; }
    .struct-label { font-size: 0.68rem; color: rgba(255,255,255,0.85); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 4px; }
    .struct-note { color: #525252; font-size: 0.78rem; font-style: italic; }
    .edu-item { font-size: 0.82rem; padding: 0.2rem 0; display: flex; gap: 0.4rem; line-height: 1.4; }
    .edu-icon { font-weight: 700; width: 14px; flex-shrink: 0; text-align: center; }
    .edu-pro { color: #a3a3a3; } .edu-pro .edu-icon { color: #22c55e; }
    .edu-con { color: #737373; } .edu-con .edu-icon { color: #ef4444; }
    .edu-insight { background: #1a1a2e; border: 1px solid #262650; border-radius: 6px; padding: 0.6rem 0.85rem; font-size: 0.82rem; color: #a3a3d4; display: flex; gap: 0.5rem; align-items: flex-start; line-height: 1.5; }
    .edu-insight-icon { font-size: 1rem; flex-shrink: 0; }
    .field-table { border-collapse: collapse; width: 100%; font-size: 0.82rem; }
    .field-table th { background: #111; color: #737373; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; padding: 0.4rem 0.6rem; text-align: left; border: 1px solid #1a1a1a; }
    .field-table td { padding: 0.35rem 0.6rem; border: 1px solid #1a1a1a; vertical-align: middle; }
    .field-name { background: #0d0d0d; font-weight: 600; color: #e5e5e5; white-space: nowrap; }
    .field-desc { color: #525252; font-size: 0.75rem; font-weight: 400; margin-top: 0.15rem; }
    .field-first td { border-top: 1px solid #333; }
    .field-ver { font-family: monospace; color: #a3a3a3; font-size: 0.78rem; white-space: nowrap; }
    .field-enc { color: #a3a3a3; }
    .field-hex code { color: #525252; font-size: 0.72rem; word-break: break-all; }
    .field-size { min-width: 80px; }
    .field-size-row { display: flex; align-items: center; gap: 6px; }
    .field-size-row span { font-family: monospace; font-weight: 600; font-size: 0.8rem; color: #a3a3a3; white-space: nowrap; min-width: 28px; }
    .field-bar { height: 8px; border-radius: 4px; min-width: 3px; transition: width 0.3s; }
    @media (max-width: 600px) { body { padding: 1rem; } .summary { flex-direction: column; } .edu-columns { grid-template-columns: 1fr; } }
    .intro { max-width: 720px; margin: 0 auto 2.5rem; }
    .intro h1 { font-size: 1.8rem; color: #fff; margin-bottom: 0.25rem; }
    .intro .tagline { color: #737373; font-size: 1rem; margin-bottom: 2rem; font-style: italic; }
    .intro h3 { color: #e5e5e5; font-size: 1.1rem; margin: 1.5rem 0 0.5rem; border-left: 3px solid #3b82f6; padding-left: 0.75rem; }
    .intro p { color: #a3a3a3; font-size: 0.9rem; line-height: 1.7; margin: 0.5rem 0; }
    .intro .key-insight { background: #1a1a2e; border: 1px solid #262650; border-radius: 8px; padding: 1rem 1.25rem; font-size: 0.95rem; color: #a3a3d4; line-height: 1.6; margin: 1.5rem 0; }
    .intro .key-insight::before { content: '💡 '; }
    .intro hr { border: none; border-top: 1px solid #262626; margin: 2rem 0; }
`
