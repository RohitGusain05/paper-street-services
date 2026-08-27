const WHATSAPP_NUMBER = '917078181630';
const PSS_CONFIG = window.PSS_CONFIG || { supabaseUrl: '', supabaseAnonKey: '' };

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('open', !open);
  });
}

document.querySelectorAll('.nav a').forEach((link) => link.addEventListener('click', () => {
  if (nav) nav.classList.remove('open');
  if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
}));

const form = document.getElementById('orderForm');
if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const whatsapp = String(data.get('whatsapp') || '').trim();
    const serviceRaw = String(data.get('service') || '');
    const service = serviceRaw.split(' — ₹')[0];
    const deadline = data.get('deadline') || 'Not specified';
    const requirements = String(data.get('requirements') || '').trim() || 'Not specified';
    const files = [...form.querySelector('input[type="file"]').files].map(f => f.name).join(', ') || 'None';

    const message = [
      'Hello Paper Street Services! I want to place an order.',
      '',
      `Name: ${name}`,
      `My WhatsApp: ${whatsapp}`,
      `Service: ${serviceRaw}`,
      `Deadline: ${deadline}`,
      `How I want it designed: ${requirements}`,
      `Reference files: ${files}`
    ].join('\n');

    try {
      submitButton.disabled = true;
      submitButton.textContent = 'Saving order…';

      if (PSS_CONFIG.supabaseUrl && PSS_CONFIG.supabaseAnonKey) {
        const endpoint = `${PSS_CONFIG.supabaseUrl}/functions/v1/create-order`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { apikey: PSS_CONFIG.supabaseAnonKey, Authorization: `Bearer ${PSS_CONFIG.supabaseAnonKey}` },
          body: data,
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.error || 'Order could not be saved.');
        message += `\nOrder ID: ${result.order.order_code}`;
      }

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
      form.reset();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Something went wrong. Please try again.');
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Submit Order <span>→</span>';
    }
  });
}
