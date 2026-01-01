//  Reviews Section 
const reviewsContainer = document.querySelector('.reviews-container');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
const scrollAmount = 320;

nextBtn.addEventListener('click', () => {
  reviewsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
});


prevBtn.addEventListener('click', () => {
  reviewsContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
});


setInterval(() => {
  reviewsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}, 5000);

// Footer Social Icons Hover Animation 
const socialIcons = document.querySelectorAll('.social-icons i');

socialIcons.forEach(icon => {

  icon.addEventListener('mouseover', () => {
    icon.style.transform = 'scale(1.2)';
    icon.style.color = '#c08a58';
  });


  icon.addEventListener('mouseout', () => {
    icon.style.transform = 'scale(1)';
    icon.style.color = '#d4a373';
  });
});

// Back to Top Logic
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
});

backToTopBtn?.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
