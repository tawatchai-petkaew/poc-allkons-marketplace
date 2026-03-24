import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '../src/app/page';

test('Page', () => {
  render(<Page />);
  expect(
    screen.getByRole('heading', { level: 1, name: 'Allkons M' })
  ).toBeDefined();
});

test('Page renders the logo image with correct attributes', () => {
  render(<Page />);
  const logo = screen.getByAltText('Allkons Logo');
  expect(logo).toBeInTheDocument();
});
