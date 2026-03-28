export const SCRIPTS = `
    function showEdu(btn) {
      const ver = btn.dataset.ver;
      document.querySelectorAll('.edu-panel').forEach(p => p.classList.add('hidden'));
      document.querySelectorAll('.edu-tab').forEach(t => t.classList.remove('active'));
      const panel = document.getElementById('edu-' + ver);
      if (panel) panel.classList.remove('hidden');
      btn.classList.add('active');
    }
    function showScenario(btn) {
      const name = btn.dataset.scenario;
      document.querySelectorAll('.url-panel').forEach(p => p.classList.add('hidden'));
      document.querySelectorAll('.url-tab').forEach(t => t.classList.remove('active'));
      const panel = document.getElementById('panel-' + name.replace(/\\s+/g, '-'));
      if (panel) panel.classList.remove('hidden');
      btn.classList.add('active');
    }
    function copyUrl(btn, successText, failText, defaultText) {
      const url = btn.dataset.url;
      navigator.clipboard.writeText(url).then(() => {
        btn.textContent = successText;
        btn.style.color = '#22c55e';
        setTimeout(() => { btn.textContent = defaultText; btn.style.color = ''; }, 1500);
      }).catch(() => {
        btn.textContent = failText;
        setTimeout(() => { btn.textContent = defaultText; }, 1500);
      });
    }
`
