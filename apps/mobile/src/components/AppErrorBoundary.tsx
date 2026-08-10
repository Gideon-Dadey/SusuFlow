import { Component, type ErrorInfo, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    try {
      // Lazy require avoids circular imports during boot.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { monitoring } = require("@/lib/monitoring") as {
        monitoring: {
          captureException: (e: unknown, ctx?: Record<string, unknown>) => void;
        };
      };
      monitoring.captureException(error, {
        componentStack: info.componentStack,
      });
    } catch {
      if (__DEV__) {
        console.error("AppErrorBoundary", error, info.componentStack);
      }
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.root}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.copy}>
            SusuFlow ran into an unexpected error. Please try again.
          </Text>
          <Button title="Try again" onPress={this.handleRetry} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
    backgroundColor: "#000000",
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  copy: {
    color: "#8e8e93",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
