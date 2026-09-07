import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { GlowCard } from '../src/components/GlowCard';
import { HudScreen } from '../src/components/HudScreen';
import { StackHeader } from '../src/components/StackHeader';
import { useThemedStyles } from '../src/theme/useAppTheme';
import type { AppTheme } from '../src/theme/useAppTheme';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <GlowCard style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{children}</Text>
    </GlowCard>
  );
}

export default function TermsOfService() {
  const styles = useThemedStyles(makeStyles);
  return (
    <HudScreen>
      <StackHeader title="TERMS OF SERVICE" />
      <Text style={styles.updated}>LAST UPDATED SEPTEMBER 2026</Text>

      <Section title="The Service">
        AlterX helps you define an identity/archetype you're working toward and track your progress toward it
        — through a diary, future-self letters and videos, goals, habit-reprogramming entries, limited
        beliefs, a log book, quick notes, and photos/videos. Everything you create stays on your device —
        AlterX has no server or account system.
      </Section>

      <Section title="Not Professional Advice">
        AlterX is a self-guided personal development tool. It is not therapy, counseling, or medical advice,
        and it is not a substitute for professional mental health support. If you're in crisis, reach out to a
        local emergency service or crisis line — in the US and Canada, call or text 988 (Suicide & Crisis
        Lifeline); in the UK, call 116 123 (Samaritans).
      </Section>

      <Section title="Your Content">
        Everything you create in AlterX is yours. AlterX doesn't claim any ownership over it, and since it's
        stored only on your device, we never see it. You're responsible for keeping your own backups (via
        Export Backup or your device's iCloud/Google backup) — without one, lost or reset devices can't be
        recovered.
      </Section>

      <Section title="Age Requirement">
        AlterX is not directed at children under 13, and you must be at least 13 years old to use it.
      </Section>

      <Section title="In-App Purchases">
        Any optional one-time unlock (Alter-Xtra) or other in-app purchase is billed and fulfilled entirely by
        Apple's App Store or Google Play. Refunds and billing issues are handled directly by Apple or Google —
        AlterX never processes or stores payment information.
      </Section>

      <Section title="No Warranty">
        AlterX is provided "as is," without warranties of any kind. We don't guarantee the app will be
        uninterrupted or error-free, or that it will achieve any particular personal outcome — your results
        depend on your own use of it.
      </Section>

      <Section title="Limitation of Liability">
        To the fullest extent permitted by law, AlterX and its developers are not liable for indirect,
        incidental, or consequential damages arising from your use of the app, including loss of data not
        backed up by you.
      </Section>

      <Section title="Termination">
        You may stop using AlterX anytime by uninstalling it, which permanently deletes all associated data
        from your device. We may update or discontinue the app at any time.
      </Section>

      <Section title="Changes to These Terms">
        We may update these terms as AlterX changes. Continued use after an update means you accept the
        revised terms. Material changes will be reflected here with an updated "Last updated" date.
      </Section>
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  updated: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
    marginTop: -8,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 15,
    color: colors.glow,
  },
  sectionBody: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
