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