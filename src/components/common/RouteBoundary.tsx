import { Component, type ErrorInfo, type ReactNode } from 'react';

interface RouteBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  resetKey: string;
}

interface RouteBoundaryState {
  hasError: boolean;
}

export default class RouteBoundary extends Component<RouteBoundaryProps, RouteBoundaryState> {
  state: RouteBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RouteBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Deferred route failed to load', error, info.componentStack);
  }

  componentDidUpdate(previousProps: RouteBoundaryProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
