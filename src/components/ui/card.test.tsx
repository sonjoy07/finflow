import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card Component Family', () => {
  it('renders all composite parts cleanly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Gross Volume</CardTitle>
          <CardDescription>Last 24 Hours</CardDescription>
        </CardHeader>
        <CardContent>
          <p>$124,508.00</p>
        </CardContent>
        <CardFooter>
          <span>Footer Info</span>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Gross Volume')).toBeInTheDocument();
    expect(screen.getByText('Last 24 Hours')).toBeInTheDocument();
    expect(screen.getByText('$124,508.00')).toBeInTheDocument();
    expect(screen.getByText('Footer Info')).toBeInTheDocument();
  });
});
