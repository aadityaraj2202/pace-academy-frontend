/* ========================================
   HOME PAGE IMAGE SLIDER
   Changes every 2 seconds
======================================== */

const heroImages = [

    "./home image upse.png",

    "./home image hpse.png",

    "./home image law.png",

    "./home image bare acts.png"

];


const heroSlide =
    document.getElementById("heroSlide");


let currentSlide = 0;


/* ========================================
   SHOW NEXT IMAGE
======================================== */

function showNextSlide(){

    heroSlide.style.opacity = "0";


    setTimeout(function(){

        currentSlide++;


        if(currentSlide >= heroImages.length){

            currentSlide = 0;

        }


        heroSlide.src =
            heroImages[currentSlide];


        heroSlide.style.opacity = "1";


    },250);

}


/* ========================================
   AUTO SLIDER
   Every 2 seconds
======================================== */

setInterval(
    showNextSlide,
    2000
);


/* ========================================
   FADE EFFECT
======================================== */

heroSlide.style.transition =
    "opacity 0.25s ease";
// enquiry popup moved to enquiry.js (shared across pages)

// NAV TOGGLE (mobile)
document.addEventListener('DOMContentLoaded', function(){
    var toggle = document.getElementById('navToggle');
    if(toggle){
        toggle.addEventListener('click', function(e){
            e.stopPropagation();
            document.body.classList.toggle('nav-open');
        });

        // close menu when clicking a nav link
        document.querySelectorAll('.nav a').forEach(function(el){
            el.addEventListener('click', function(){ document.body.classList.remove('nav-open'); });
        });

        // close menu on outside click
        document.addEventListener('click', function(e){
            if(document.body.classList.contains('nav-open')){
                var withinNav = e.target.closest('.nav');
                var isToggle = e.target.closest('#navToggle');
                if(!withinNav && !isToggle){ document.body.classList.remove('nav-open'); }
            }
        });
    }
});