import type { ReactNode } from 'react';
import { designSystem } from '@/src/theme';
import { LinearGradient } from '@/src/vendors/linear-gradient';
import { createContext, useContext, useEffect } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import React from 'react';

// react-native-reanimated@3.19.5's `Animated.View` type triggers TS2589 ("Type instantiation is
// excessively deep") on this project's TypeScript line (verified: reproduced on both 5.9.3 and
// 6.0.3, independent of any style-prop typing, isolated to `Animated.View`'s own declared type).
// `as unknown as` fully erases the type before re-asserting a plain shape, which is the only cast
// form that avoids the partial structural comparison that triggers the recursion.
const AnimatedView = Animated.View as unknown as React.ComponentType<{
  readonly children?: ReactNode;
  readonly style?: object;
}>;

const SkeletonGroupContext = createContext<boolean | undefined>(undefined);

const DEFAULT_SIZE = 40;
const SHIMMER_DURATION_MS = 700;
const DIM_OPACITY = 0.3;
const BRIGHT_OPACITY = 1;

type Radius = 'round' | 'square' | number;

const resolveBorderRadius = (radius: Radius): number => {
  if (radius === 'square') {
    return 0;
  }

  if (radius === 'round') {
    return 9999;
  }

  return radius;
};

export interface SkeletonProps {
  readonly colorMode?: 'dark' | 'light';
  readonly height?: DimensionValue;
  readonly radius?: Radius;
  readonly show?: boolean;
  readonly width?: DimensionValue;
}

function SkeletonComponent({ colorMode = 'dark', height = DEFAULT_SIZE, radius = 8, show, width }: SkeletonProps) {
  const groupShow = useContext(SkeletonGroupContext);
  const isShown = show ?? groupShow ?? true;
  const opacity = useSharedValue<number>(DIM_OPACITY);

  useEffect(() => {
    if (!isShown) {
      cancelAnimation(opacity);
      return;
    }

    opacity.value = DIM_OPACITY;
    opacity.value = withRepeat(
      withTiming(BRIGHT_OPACITY, { duration: SHIMMER_DURATION_MS, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    return () => cancelAnimation(opacity);
  }, [isShown, opacity]);

  const shimmerStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: opacity.value,
  }));

  if (!isShown) {
    return null;
  }

  const colors: string[] =
    colorMode === 'dark'
      ? [designSystem.colors.skeleton.base, designSystem.colors.skeleton.highlight]
      : ['#E1E9EE', '#F2F8FC'];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors[0],
          borderRadius: resolveBorderRadius(radius),
          height,
          width,
        },
      ]}
    >
      <View style={styles.shimmer}>
        <AnimatedView style={shimmerStyle}>
          <LinearGradient colors={colors} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={styles.gradient} />
        </AnimatedView>
      </View>
    </View>
  );
}

function SkeletonGroup({ children, show }: { readonly children: ReactNode; readonly show: boolean }) {
  return <SkeletonGroupContext.Provider value={show}>{children}</SkeletonGroupContext.Provider>;
}

export const Skeleton = Object.assign(SkeletonComponent, { Group: SkeletonGroup });

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  shimmer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
