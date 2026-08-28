const WHATSAPP_NUMBER = '917078181630';
const PSS_CONFIG = window.PSS_CONFIG || { supabaseUrl: '', supabaseAnonKey: '' };

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('open', !open);
  });
}
document.querySelectorAll('.nav a').forEach((link) => link.addEventListener('click', () => {
  nav?.classList.remove('open'); menuToggle?.setAttribute('aria-expanded', 'false');
}));

const form = document.getElementById('orderForm');
if (form) {
  const fileInput = form.querySelector('input[type="file"]');
  const dropZone = fileInput?.closest('.file-drop');
  if (dropZone && fileInput) {
    ['dragenter','dragover'].forEach(e => dropZone.addEventListener(e, ev => { ev.preventDefault(); dropZone.classList.add('dragging'); }));
    ['dragleave','drop'].forEach(e => dropZone.addEventListener(e, ev => { ev.preventDefault(); dropZone.classList.remove('dragging'); }));
    dropZone.addEventListener('drop', ev => { if (ev.dataTransfer?.files?.length) fileInput.files = ev.dataTransfer.files; });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const whatsapp = String(data.get('whatsapp') || '').trim();
    const serviceRaw = String(data.get('service') || '');
    if (!name || !whatsapp || !serviceRaw) return;
    const deadline = String(data.get('deadline') || 'Not specified');
    const requirements = String(data.get('requirements') || '').trim() || 'Not specified';
    const files = fileInput ? [...fileInput.files] : [];
    const fileNames = files.map(f => f.name).join(', ') || 'None';
    let orderCode = '';
    try {
      submitButton.disabled = true; submitButton.textContent = 'Saving order…';
      if (PSS_CONFIG.supabaseUrl && PSS_CONFIG.supabaseAnonKey) {
        const endpoint = `${PSS_CONFIG.supabaseUrl}/functions/v1/create-order`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { apikey: PSS_CONFIG.supabaseAnonKey, Authorization: `Bearer ${PSS_CONFIG.supabaseAnonKey}` },
          body: data
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.error || 'Order could not be saved.');
        orderCode = result.order?.order_code || '';
      }
      const message = [
        'Hello Paper Street Services! I want to place an order.', '',
        `Name: ${name}`, `My WhatsApp: ${whatsapp}`, `Service: ${serviceRaw}`,
        `Deadline: ${deadline}`, `How I want it designed: ${requirements}`,
        `Reference files: ${fileNames}`, orderCode ? `Order ID: ${orderCode}` : ''
      ].filter(Boolean).join('\n');
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
      form.reset();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Something went wrong. Please try again.');
    } finally {
      submitButton.disabled = false; submitButton.innerHTML = 'Submit Order <span>→</span>';
    }
  });
}
