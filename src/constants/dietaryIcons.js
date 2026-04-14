export const getDietaryIcons = (dietaryArray) => {
  if (!dietaryArray) return '';
  
  const iconMap = {
    vegetarian: '🌱',
    vegan: '🥬',
    meat: '🥩',
    seafood: '🐟'
  };
  
  if (Array.isArray(dietaryArray)) {
    return dietaryArray.map(d => iconMap[d] || '').join(' ');
  }
  
  return iconMap[dietaryArray] || '';
};