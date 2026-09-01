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

export default function PrivacyPolicy() {
  const styles = useThemedStyles(makeStyles);
  return (
    <HudScreen>
      <StackHeader title="PRIVACY POLICY" />
      <Text style={styles.updated}>LAST UPDATED SEPTEMBER 2026</Text>

      <Section title="Data Storage">
        All of your content stays on your device by default. Everything you create in AlterX — your identity,
        diary entries, future-self letters and videos, goals, habit-reprogramming entries, limited beliefs, log
        book entries, quick notes, and photos/videos — is stored locally only. AlterX has no server or account
        system, and never uploads, syncs, or transmits your personal content anywhere unless you turn on Cloud
        Backup below. The only network activity AlterX performs on its own is checking for app updates, which
        does not include your personal content.
      </Section>

      <Section title="Permissions">
        Camera and Microphone are used only when you choose to record a video message; recordings stay on
        your device. Photo Library access is used only when you choose to add a photo or video — AlterX only
        accesses files you specifically select.
      </Section>

      <Section title="Optional Cloud Backup">
        Settings → Cloud Backup is off by default. If you turn it on, your identity, diary, goals, habits, log
        book, and quick notes (text only — not photos or videos) are written to a private, app-only area of
        your own iCloud account and/or your own Google Drive (via Google's drive.appdata scope, which only
        lets AlterX see its own hidden folder). This goes directly from your device to your own account;
        AlterX and its developer never see or hold a copy. It's governed by Apple's and Google's own privacy
        policies, and AlterX's use of Google Drive access complies with the Google API Services User Data
        Policy, including its Limited Use requirements.
      </Section>

      <Section title="Third-Party Services">
        AlterX does not use any third-party analytics, advertising, or tracking services, and does not sell
        or share your data. The only third parties AlterX ever talks to are Expo (app updates) and — only if
        you enable it — Apple iCloud and/or Google Drive, acting purely as your own personal storage.
      </Section>

      <Section title="Data Deletion">
        Delete all app data — including saved photos and videos, not just the entries referencing them — at
        any time via Settings → Reset All Data. Uninstalling the app permanently deletes everything from your
        device. Resetting does not delete a cloud backup you previously made — clear that from your iCloud or
        Google Drive account, or overwrite it from Settings → Cloud Backup, if you want it gone too.
      </Section>

      <Section title="If You Need Support">
        AlterX is a self-guided personal development tool, not a substitute for professional mental health
        support. If you're in crisis or need to talk to someone, reach out to a local emergency service or
        crisis line — in the US and Canada, call or text 988 (Suicide & Crisis Lifeline); in the UK, call
        116 123 (Samaritans). If you're elsewhere, search for your local crisis line — help is available.
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
