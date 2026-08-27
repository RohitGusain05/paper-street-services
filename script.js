const WHATSAPP_NUMBER = '917078181630';

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
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get('name').trim();
    const whatsapp = data.get('whatsapp').trim();
    const service = data.get('service');
    const deadline = data.get('deadline') || 'Not specified';
    const requirements = data.get('requirements').trim() || 'Not specified';
    const files = [...document.querySelector('input[type="file"]').files].map(f => f.name).join(', ') || 'None';

    const message = [
      'Hello Paper Street Services! I want to place an order.',
      '',
      `Name: ${name}`,
      `My WhatsApp: ${whatsapp}`,
      `Service: ${service}`,
      `Deadline: ${deadline}`,
      `How I want it designed: ${requirements}`,
      `Reference files: ${files}`
    ].join('\n');

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });
}
