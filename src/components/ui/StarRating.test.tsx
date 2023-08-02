import { render } from '@testing-library/react-native';
import StarRating from '@components/ui/StarRating';

import React from 'react';

describe('Star Rating', () => {
  it('renders', () => {
    const { queryAllByTestId } = render(<StarRating rating={3} />);
    const stars = queryAllByTestId('solid-star');
    expect(stars).toHaveLength(3);
  });

  it('Displays no rating', () => {
    const { getByText } = render(<StarRating />);

    const verbalRating = getByText(/No Ratings/);
    expect(verbalRating).toBeTruthy();
  });
});
