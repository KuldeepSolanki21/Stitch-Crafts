import React from 'react';

export const RatingStars: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex text-brass">
    {'★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))}
  </div>
);
