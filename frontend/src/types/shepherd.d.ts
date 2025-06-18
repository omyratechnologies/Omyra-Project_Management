declare module 'shepherd.js' {
  export class Tour {
    constructor(options: TourOptions);
    addStep(options: StepOptions): Tour;
    start(): void;
    next(): void;
    back(): void;
    cancel(): void;
    complete(): void;
    isActive(): boolean;
    on(event: string, handler: () => void): void;
  }

  interface PopperOptions {
    modifiers: {
      name: string;
      options: {
        offset: number[];
      };
    }[];
  }

  interface Button {
    text: string;
    action?: (() => void) | ((tour: Tour) => void);
    classes?: string;
  }

  export namespace Step {
    export interface StepOptions {
      attachTo?: {
        element: string | HTMLElement;
        on: 'auto' | 'top' | 'right' | 'bottom' | 'left';
      };
      buttons?: Button[];
      classes?: string;
      id?: string;
      title?: string;
      text: string | HTMLElement;
      when?: {
        [key: string]: () => void;
      };
      beforeShowPromise?: () => Promise<void>;
      cancelIcon?: {
        enabled?: boolean;
      };
      scrollTo?: boolean;
      modalOverlayOpeningPadding?: number;
      modalOverlayOpeningRadius?: number;
      popperOptions?: PopperOptions;
    }
  }

  export interface TourOptions {
    defaultStepOptions?: Partial<Step.StepOptions>;
    exitOnEsc?: boolean;
    keyboardNavigation?: boolean;
    useModalOverlay?: boolean;
  }

  const Shepherd: {
    Tour: typeof Tour;
  };

  export default Shepherd;
}
