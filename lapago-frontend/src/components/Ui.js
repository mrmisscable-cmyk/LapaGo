import { Ionicons } from '@expo/vector-icons';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../constants/theme';
import { formatRupiah } from '../constants/venues';

export function Screen({ children, contentStyle, scroll = true }) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.page, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.page, contentStyle]}>{children}</View>
  );

  return <SafeAreaView style={styles.safeArea} edges={['top']}>{content}</SafeAreaView>;
}

export function Heading({ title, subtitle, action, onAction }) {
  return (
    <View style={styles.headingRow}>
      <View style={styles.headingCopy}>
        <Text style={styles.heading}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.actionText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function IconButton({ name, onPress, badge }) {
  return (
    <Pressable onPress={onPress} style={styles.iconButton} hitSlop={8}>
      <Ionicons name={name} size={20} color={colors.primary} />
      {badge ? <View style={styles.badge} /> : null}
    </Pressable>
  );
}

export function SearchBox({ value, onChangeText, placeholder = 'Cari lapangan, futsal, badminton...' }) {
  return (
    <View style={styles.searchBox}>
      <Ionicons name="search" size={18} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.searchInput}
        returnKeyType="search"
      />
      <Ionicons name="options-outline" size={19} color={colors.primary} />
    </View>
  );
}

export function Chip({ label, selected, onPress, icon }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {icon ? <Ionicons name={icon} size={13} color={selected ? colors.onPrimary : colors.muted} /> : null}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function VenueCard({ venue, onPress, compact = false }) {
  return (
    <Pressable onPress={onPress} style={[styles.venueCard, compact && styles.venueCardCompact]}>
      <ImageBackground source={venue.image} style={styles.venueImage} imageStyle={styles.venueImageRadius}>
        <View style={styles.imageTopRow}>
          {venue.courts ? (
            <View style={styles.availableTag}>
              <Text style={styles.availableText}>{venue.courts} Lapangan Tersedia</Text>
            </View>
          ) : null}
          <View style={styles.heartButton}>
            <Ionicons name="heart-outline" size={17} color="#FFFFFF" />
          </View>
        </View>
        <View style={styles.venueImageShade}>
          <Text style={styles.venueSport}>{venue.sport} • {venue.location}</Text>
          <Text style={styles.venueName} numberOfLines={1}>{venue.name}</Text>
        </View>
      </ImageBackground>
      <View style={styles.venueInfo}>
        {venue.rating ? (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.ratingText}>{venue.rating} ({venue.reviews})</Text>
            <View style={styles.infoDot} />
            <Text style={styles.distanceText}>{venue.distance}</Text>
          </View>
        ) : null}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatRupiah(venue.price)}<Text style={styles.priceUnit}> / jam</Text></Text>
          <Ionicons name="arrow-forward-circle" size={24} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

export function ActionButton({ label, onPress, icon, secondary = false, disabled = false }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.actionButton, secondary && styles.actionButtonSecondary, disabled && styles.actionButtonDisabled]}>
      {icon ? <Ionicons name={icon} size={17} color={secondary ? colors.primary : colors.onPrimary} /> : null}
      <Text style={[styles.actionButtonText, secondary && styles.actionButtonTextSecondary]}>{label}</Text>
    </Pressable>
  );
}

export function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}><Ionicons name={icon} size={17} color={colors.primary} /></View>
      <View style={styles.infoCopy}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export function Panel({ children, style }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  page: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28, gap: 20 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  headingCopy: { flex: 1, gap: 4 },
  heading: { color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  actionText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  iconButton: {
    width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, position: 'relative',
  },
  badge: { position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.warning },
  searchBox: {
    minHeight: 48, borderRadius: radius.md, paddingHorizontal: 14, gap: 10, flexDirection: 'row',
    alignItems: 'center', backgroundColor: colors.cardHigh, borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 13, paddingVertical: 10 },
  chip: {
    minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingHorizontal: 13, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  chipTextSelected: { color: colors.onPrimary },
  venueCard: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  venueCardCompact: { width: 292 },
  venueImage: { height: 184, justifyContent: 'space-between' },
  venueImageRadius: { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  imageTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  availableTag: { paddingVertical: 6, paddingHorizontal: 9, borderRadius: radius.pill, backgroundColor: colors.primary },
  availableText: { color: colors.onPrimary, fontSize: 10, fontWeight: '800' },
  heartButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0E132188', alignItems: 'center', justifyContent: 'center' },
  venueImageShade: { paddingHorizontal: 13, paddingTop: 18, paddingBottom: 12, backgroundColor: '#0E1321B0' },
  venueSport: { color: colors.primary, fontSize: 10, fontWeight: '700', marginBottom: 4 },
  venueName: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  venueInfo: { paddingHorizontal: 13, paddingVertical: 12, gap: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingText: { color: colors.text, fontSize: 11, fontWeight: '600' },
  infoDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.muted, marginHorizontal: 3 },
  distanceText: { color: colors.muted, fontSize: 11 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  priceUnit: { color: colors.muted, fontSize: 10, fontWeight: '500' },
  actionButton: {
    minHeight: 48, borderRadius: radius.md, backgroundColor: colors.primary, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16,
  },
  actionButtonSecondary: { backgroundColor: colors.cardHighest, borderWidth: 1, borderColor: colors.border },
  actionButtonDisabled: { opacity: 0.55 },
  actionButtonText: { color: colors.onPrimary, fontSize: 13, fontWeight: '800' },
  actionButtonTextSecondary: { color: colors.primary },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  infoCopy: { flex: 1, gap: 3 },
  infoLabel: { color: colors.muted, fontSize: 10 },
  infoValue: { color: colors.text, fontSize: 13, fontWeight: '600' },
  panel: { padding: 16, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, gap: 14 },
});
