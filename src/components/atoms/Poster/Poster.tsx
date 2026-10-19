import type { TMDB_IMAGE_SIZES } from '@/src/constants/tmdb';
import { Text } from '@/src/components/atoms/Text';
import { designSystem } from '@/src/theme';
import { buildTmdbImageUrl } from '@/src/utils/tmdb-image.utils';
import { Image, Platform, StyleSheet, View, type DimensionValue } from 'react-native';
import React, { useMemo, useState } from 'react';

export interface PosterProps {
  readonly borderRadius?: number;
  readonly height: DimensionValue;
  readonly path: string | null;
  readonly placeholderLabel: string;
  readonly size: (typeof TMDB_IMAGE_SIZES)[keyof typeof TMDB_IMAGE_SIZES];
  readonly width: DimensionValue;
}

export function Poster({ borderRadius, height, path, placeholderLabel, size, width }: PosterProps) {
  const [failedToLoad, setFailedToLoad] = useState(false);
  const url = useMemo(() => buildTmdbImageUrl(path, size), [path, size]);
  const source = useMemo(() => (url ? { uri: url } : null), [url]);

  const showPlaceholder = !source || failedToLoad;

  if (showPlaceholder) {
    return (
      <View style={[styles.placeholder, { borderRadius, height, width }]}>
        <Text color="secondary" size="xs">
          {placeholderLabel}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { borderRadius, height, width }]}>
      <Image
        accessible={false}
        fadeDuration={Platform.OS === 'android' ? 300 : undefined}
        onError={() => setFailedToLoad(true)}
        resizeMethod={Platform.OS === 'android' ? 'resize' : undefined}
        resizeMode="cover"
        source={source}
        style={styles.image}
        testID="poster-image"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    height: '100%',
    width: '100%',
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: designSystem.colors.background.elevated,
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  wrapper: {
    overflow: 'hidden',
  },
});
