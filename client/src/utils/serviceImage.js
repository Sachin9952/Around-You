export const categoryImages = {
  plumber: '/images/categories/plumber.jpg.png',
  electrician: '/images/categories/electrician.jpg.png',
  painter: '/images/categories/painter.jpg.png',
  cleaner: '/images/categories/cleaner.jpg.png',
  carpenter: '/images/categories/carpenter.jpg.png',
  mechanic: '/images/categories/mechanic.jpg.png',
  tutor: '/images/categories/tutor.jpg.png',
  salon: '/images/categories/salon.jpg.png',
  physiotherapist: '/images/categories/other.jpg.png',
  other: '/images/categories/other.jpg.png',
  default: '/images/categories/other.jpg.png'
};

export const getServiceImage = (service) => {
  if (!service) return categoryImages.default;

  // Use service image if provided and valid
  if (
    service.image && 
    typeof service.image === 'string' &&
    !service.image.includes('placeholder') && 
    !service.image.includes('generated')
  ) {
    return service.image;
  }

  // Get category name safely
  let categoryName = 'other';
  if (typeof service.category === 'string') {
    categoryName = service.category;
  } else if (service.category && typeof service.category === 'object' && service.category.name) {
    categoryName = service.category.name;
  }

  const category = categoryName.toLowerCase().trim();
  return categoryImages[category] || categoryImages.default;
};
