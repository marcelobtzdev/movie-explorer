import type { ErrorInfo, ReactNode } from 'react';
import { Text } from '@/src/components/atoms/Text';
import { designSystem } from '@/src/theme';
import { StyleSheet, View } from 'react-native';
import { Component } from 'react';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console -- surfaces unexpected render crashes during development
    console.error('ErrorBoundary caught an error', error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text align="center" color="secondary">
            Ocurrió un error inesperado.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: designSystem.colors.background.base,
    flex: 1,
    justifyContent: 'center',
    padding: designSystem.spacing.xl,
  },
});
