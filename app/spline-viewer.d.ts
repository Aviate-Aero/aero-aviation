import type { HTMLAttributes } from 'react';

interface SplineViewerAttributes extends HTMLAttributes<HTMLElement> {
  url?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': SplineViewerAttributes;
    }
  }
}
