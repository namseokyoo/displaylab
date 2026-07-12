import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RouteBoundary from '@/components/common/RouteBoundary';

function BrokenRoute(): never {
  throw new Error('chunk unavailable');
}

describe('RouteBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows its recovery UI when a deferred route fails', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <RouteBoundary resetKey="/broken" fallback={<p>Reload this tool</p>}>
        <BrokenRoute />
      </RouteBoundary>,
    );

    expect(screen.getByText('Reload this tool')).toBeInTheDocument();
  });

  it('resets after navigation changes the route key', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { rerender } = render(
      <RouteBoundary resetKey="/broken" fallback={<p>Reload this tool</p>}>
        <BrokenRoute />
      </RouteBoundary>,
    );

    rerender(
      <RouteBoundary resetKey="/working" fallback={<p>Reload this tool</p>}>
        <p>Working route</p>
      </RouteBoundary>,
    );

    expect(screen.getByText('Working route')).toBeInTheDocument();
  });
});
