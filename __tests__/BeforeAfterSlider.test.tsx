import { render, screen, fireEvent } from '@testing-library/react';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import { StrapiMedia } from '@/types/studentWork';

const mockBeforeImage: StrapiMedia = {
  id: 1,
  attributes: {
    name: 'before.jpg',
    url: '/uploads/before.jpg',
    width: 800,
    height: 600,
    alternativeText: 'Before image',
  },
};

const mockAfterImage: StrapiMedia = {
  id: 2,
  attributes: {
    name: 'after.jpg',
    url: '/uploads/after.jpg',
    width: 800,
    height: 600,
    alternativeText: 'After image',
  },
};

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}));

describe('BeforeAfterSlider', () => {
  it('should render both before and after images', () => {
    render(
      <BeforeAfterSlider
        beforeImage={mockBeforeImage}
        afterImage={mockAfterImage}
      />
    );

    expect(screen.getByAltText('Before image')).toBeInTheDocument();
    expect(screen.getByAltText('After image')).toBeInTheDocument();
  });

  it('should display before and after labels', () => {
    render(
      <BeforeAfterSlider
        beforeImage={mockBeforeImage}
        afterImage={mockAfterImage}
      />
    );

    expect(screen.getByText('Before')).toBeInTheDocument();
    expect(screen.getByText('After')).toBeInTheDocument();
  });

  it('should have slider control element', () => {
    const { container } = render(
      <BeforeAfterSlider
        beforeImage={mockBeforeImage}
        afterImage={mockAfterImage}
      />
    );

    const slider = container.querySelector('.cursor-ew-resize');
    expect(slider).toBeInTheDocument();
  });

  it('should handle mouse events', () => {
    const { container } = render(
      <BeforeAfterSlider
        beforeImage={mockBeforeImage}
        afterImage={mockAfterImage}
      />
    );

    const sliderContainer = container.querySelector('.relative');
    expect(sliderContainer).toBeInTheDocument();
    
    if (sliderContainer) {
      fireEvent.mouseDown(sliderContainer);
      expect(sliderContainer).toHaveClass('select-none');
    }
  });

  it('should have accessible role', () => {
    const { container } = render(
      <BeforeAfterSlider
        beforeImage={mockBeforeImage}
        afterImage={mockAfterImage}
      />
    );

    const slider = container.querySelector('[role="img"]');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute(
      'aria-label',
      'Before and after comparison slider'
    );
  });

  it('should support touch events', () => {
    const { container } = render(
      <BeforeAfterSlider
        beforeImage={mockBeforeImage}
        afterImage={mockAfterImage}
      />
    );

    const sliderContainer = container.querySelector('.touch-none');
    expect(sliderContainer).toBeInTheDocument();
  });
});
