/* Reusable Enquiry popup script
   - ENQUIRY_POPUP_INTERVAL controls the show interval (ms)
   - Injects modal HTML if not present
   - Shows modal every ENQUIRY_POPUP_INTERVAL while visitor remains on site
   - Respects single instance and prevents duplicate openings
*/
(function(){
    const ENQUIRY_POPUP_INTERVAL = 60 * 1000; // 60 seconds
    const BACKEND_URL = 'https://pace-academy-backend.onrender.com/api/enquiries';
    const MODAL_ID = 'enquiryModal';

    let timer = null;
    let isOpen = false;

    function createModalIfNeeded(){
        if(document.getElementById(MODAL_ID)) return;

        const container = document.createElement('div');
        container.id = MODAL_ID;
        container.className = 'enquiry-modal';
        container.setAttribute('aria-hidden','true');

        container.innerHTML = `
            <div class="enquiry-backdrop" data-enquiry-backdrop></div>
            <div class="enquiry-dialog" role="dialog" aria-modal="true" aria-labelledby="enquiryTitle">
                <button class="enquiry-close" data-enquiry-close aria-label="Close enquiry form">&times;</button>
                <h2 id="enquiryTitle">Send an Enquiry</h2>
                <form class="enquiry-form" data-enquiry-form novalidate>
                    <div class="form-row">
                        <label>Name <span class="required">*</span></label>
                        <input name="name" type="text" required />
                    </div>
                    <div class="form-row">
                        <label>Mobile Number <span class="required">*</span></label>
                        <input name="mobile" type="tel" required />
                    </div>
                    <div class="form-row">
                        <label>Email</label>
                        <input name="email" type="email" />
                    </div>
                    <div class="form-row">
                        <label>Interested In <span class="required">*</span></label>
                        <select name="interestedIn" required>
                            <option value="">Select</option>
                            <option>Law &amp; Judiciary</option>
                            <option>UPSC</option>
                            <option>HPSC</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label>Message</label>
                        <textarea name="message" rows="3"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="submit-btn">Send Enquiry</button>
                        <button type="button" class="cancel-btn" data-enquiry-cancel>Cancel</button>
                    </div>
                    <div class="enq-status" data-enquiry-status aria-live="polite"></div>
                </form>
            </div>
        `;

        document.body.appendChild(container);
    }

    function getElements(){
        const root = document.getElementById(MODAL_ID);
        if(!root) return {};
        return {
            root,
            backdrop: root.querySelector('[data-enquiry-backdrop]'),
            close: root.querySelector('[data-enquiry-close]'),
            form: root.querySelector('[data-enquiry-form]'),
            cancel: root.querySelector('[data-enquiry-cancel]'),
            status: root.querySelector('[data-enquiry-status]'),
            submitBtn: root.querySelector('button[type="submit"]')
        };
    }

    function openModal(source){
        const el = getElements();
        if(!el.root || isOpen) return;
        el.root.classList.add('active');
        el.root.setAttribute('aria-hidden','false');
        el.form.dataset.source = source || 'Homepage Popup';
        isOpen = true;
        const first = el.form.querySelector('input, select, textarea');
        if(first) first.focus();
    }

    function closeModal(){
        const el = getElements();
        if(!el.root) return;
        el.root.classList.remove('active');
        el.root.setAttribute('aria-hidden','true');
        isOpen = false;
    }

    function scheduleNext(){
        if(timer) clearTimeout(timer);
        timer = setTimeout(()=>{
            // only open if not currently open
            if(!isOpen) openModal('Homepage Popup');
            scheduleNext();
        }, ENQUIRY_POPUP_INTERVAL);
    }

    function attachHandlers(){
        const el = getElements();
        if(!el.root) return;

        // Open via existing CTA if present
        const openCTA = document.getElementById('openEnquiryBtn');
        if(openCTA){
            openCTA.addEventListener('click', function(e){ e.preventDefault(); openModal('Contact Section'); });
        }

        if(el.close) el.close.addEventListener('click', ()=>{ closeModal(); });
        if(el.cancel) el.cancel.addEventListener('click', ()=>{ closeModal(); });
        if(el.backdrop) el.backdrop.addEventListener('click', ()=>{ closeModal(); });

        // form submit
        if(el.form){
            el.form.addEventListener('submit', function(evt){
                evt.preventDefault();
                if(el.submitBtn.disabled) return;

                const fm = el.form;
                const name = (fm.elements['name'].value || '').trim();
                const mobile = (fm.elements['mobile'].value || '').trim();
                const email = (fm.elements['email'].value || '').trim();
                const interestedIn = (fm.elements['interestedIn'].value || '').trim();
                const message = (fm.elements['message'].value || '').trim();
                const source = fm.dataset.source || 'Homepage Popup';

                if(!name){ el.status.textContent = 'Please enter your name.'; return; }
                if(!mobile){ el.status.textContent = 'Please enter your mobile number.'; return; }
                if(!interestedIn){ el.status.textContent = 'Please select what you are interested in.'; return; }

                el.submitBtn.disabled = true;
                el.status.textContent = 'Sending...';

                fetch(BACKEND_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, mobile, email, interestedIn, message, source })
                }).then(async (resp)=>{
                    const data = await resp.json().catch(()=>null);
                    if(resp.ok){
                        el.status.textContent = 'Thank you! Your enquiry has been submitted successfully.';
                        fm.reset();
                        closeModal();
                        // restart timer
                        scheduleNext();
                    } else {
                        const msg = data && data.message ? data.message : 'Failed to submit. Please try again later.';
                        el.status.textContent = msg;
                    }
                }).catch((err)=>{
                    el.status.textContent = 'Network error. Please check your connection and try again.';
                    console.error('Enquiry submit error', err);
                }).finally(()=>{ el.submitBtn.disabled = false; });
            });
        }
    }

    // initialize
    document.addEventListener('DOMContentLoaded', function(){
        createModalIfNeeded();
        attachHandlers();
        // start initial timer
        scheduleNext();
    });

})();
