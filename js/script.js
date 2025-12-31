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
