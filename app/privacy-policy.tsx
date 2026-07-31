import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { GlowCard } from '../src/components/GlowCard';
import { HudScreen } from '../src/components/HudScreen';
import { StackHeader } from '../src/components/StackHeader';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <GlowCard style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{children}</Text>
    </GlowCard>
  );
}

export default function PrivacyPolicy() {
  return (
    <HudScreen>
      <StackHeader title="PRIVACY POLICY" />
      <Text style={styles.updated}>LAST UPDATED JULY 2026</Text>

      <Section title="Data Storage">
        All of your content stays on your device. Everything you create in AlterX — your identity, diary
        entries, future-self letters and videos, goals, habit-reprogramming entries, limited beliefs, log book
        entries, quick notes, and photos/videos — is stored locally only. AlterX has no server or account
        system, and never uploads, syncs, or transmits your personal content anywhere. The only network
        activity is checking for app updates, which does not include your personal content.
      </Section>

      <Section title="Permissions">
        Camera and Microphone are used only when you choose to record a video message; recordings stay on
        your device. Photo Library access is used only when you choose to add a photo or video — AlterX only
        accesses files you specifically select.
      </Section>

      <Section title="Third-Party Services">
        AlterX does not use any third-party analytics, advertising, or tracking services, and does not sell
        or share your data, because it is never collected on a server in the first place.
      </Section>

      <Section title="Data Deletion">
        Delete all app data anytime via Settings → Reset All Data. Uninstalling the app permanently deletes
        all associated data from your device.
      </Section>

      <Section title="Children's Privacy">
        AlterX is not directed at children under 13, and does not knowingly collect data from children under
        13.
      </Section>

      <Section title="Future Changes">
        If AlterX later introduces optional subscriptions, payment processing will be handled directly by
        Apple's App Store or Google Play billing — AlterX never collects payment card information.
      </Section>
    </HudScreen>
  );
}

const styles = StyleSheet.create({
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
