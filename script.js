// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// Year in footer
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Contact form -> Power Automate
(function(){
  const form = document.getElementById('contactForm');
  if (!form) return;

  const fields = {
    fullName: form.querySelector('#fullName'),
    email: form.querySelector('#email'),
    phone: form.querySelector('#phone'),
    service: form.querySelector('#service'),
    message: form.querySelector('#message'),
  };
  const statusEl = document.getElementById('formStatus');
  const submitBtn = document.getElementById('sendBtn');
  const btnText = submitBtn?.querySelector('.btn-text');

  // TODO: Replace with your Power Automate HTTP trigger URL
  const FLOW_URL = 'https://YOUR-POWER-AUTOMATE-HTTP-TRIGGER-URL';

  function setStatus(text, type = 'info'){
    if (!statusEl) return;
    statusEl.textContent = text || '';
    statusEl.style.color = type === 'error' ? '#dc2626' : (type === 'success' ? '#16a34a' : '');
  }

  function setLoading(loading){
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    if (btnText) btnText.textContent = loading ? 'Sending…' : 'Send Message';
  }

  function showError(id, msg){
    const el = form.querySelector(`[data-error-for="${id}"]`);
    if (el) el.textContent = msg || '';
  }

  function clearErrors(){
    form.querySelectorAll('.error').forEach(e => e.textContent = '');
  }

  function validate(){
    clearErrors();
    let ok = true;
    if (!fields.fullName.value.trim()){
      showError('fullName','Full name is required'); ok = false;
    }
    const email = fields.email.value.trim();
    if (!email){ showError('email','Email is required'); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ showError('email','Enter a valid email'); ok = false; }
    if (!fields.service.value){ showError('service','Please select a service'); ok = false; }
    if (!fields.message.value.trim()){ showError('message','Message is required'); ok = false; }
    return ok;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('');
    if (!validate()) { setStatus('Please fix the errors and try again.', 'error'); return; }
    if (!FLOW_URL || FLOW_URL.includes('YOUR-POWER-AUTOMATE-HTTP-TRIGGER-URL')){
      setStatus('Form wired. Add your Power Automate URL in script.js to enable submissions.', 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(FLOW_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fields.fullName.value.trim(),
          email: fields.email.value.trim(),
          phone: fields.phone.value.trim(),
          service: fields.service.value,
          message: fields.message.value.trim(),
          source: 'OOA Landing Page',
          timestamp: new Date().toISOString()
        })
      });
      if (!res.ok){
        throw new Error(`Request failed (${res.status})`);
      }
      form.reset();
      setStatus('Thanks! Your message has been sent.', 'success');
    } catch (err){
      setStatus('Unable to send right now. Please try again later.', 'error');
      console.error('Contact form error:', err);
    } finally {
      setLoading(false);
    }
  });
})();
