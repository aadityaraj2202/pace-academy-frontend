// Responsive helpers: mobile nav toggle and simple accessibility helpers
(function(){
    function initNavHandlers(){
        // Delegate clicks: handle toggle, nav links, and click-outside in one listener
        document.addEventListener('click', function(e){
            var toggle = e.target.closest && e.target.closest('.nav-toggle');
            if(toggle){
                e.stopPropagation();
                document.body.classList.toggle('nav-open');
                return;
            }

            var navLink = e.target.closest && e.target.closest('.nav a, .pace-site-nav a');
            if(navLink){
                document.body.classList.remove('nav-open');
                return;
            }

            if(document.body.classList.contains('nav-open')){
                var withinNav = e.target.closest && e.target.closest('.nav, .pace-site-nav');
                if(!withinNav){ document.body.classList.remove('nav-open'); }
            }
        }, false);

        // Note: do not use touchstart toggle here to avoid double-toggle
        // (touchstart followed by click can open then immediately close the menu).

        // ESC to close nav or modal
        document.addEventListener('keydown', function(e){
            if(e.key === 'Escape'){
                document.body.classList.remove('nav-open');
                document.body.classList.remove('modal-open');
            }
        });
    }

    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', initNavHandlers);
    } else {
        initNavHandlers();
    }
})();
