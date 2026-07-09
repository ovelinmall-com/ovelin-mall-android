import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, Radius, Spacing } from '../theme/colors';

export type Product = {
  id: number;
  name: string;
  price: string | number;
  imageUrl?: string;
  category: string;
  description?: string;
};

interface Props {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageWrap}>
        {product.imageUrl ? (
          <Image
            source={{ uri: `https://ovelinmall-ovelin-mall.hf.space${product.imageUrl}` }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>🛍️</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{Number(product.price).toFixed(2)}</Text>
          <Text style={styles.currency}>SDG</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
    margin: Spacing.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.pink50,
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { fontSize: 36 },
  info: { padding: Spacing.sm },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'right',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  currency: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
