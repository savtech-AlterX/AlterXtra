import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Card } from '../src/components/Card';
import { Header } from '../src/components/Header';
import { Screen } from '../src/components/Screen';
import { useThemedStyles } from '../src/theme/useAppTheme';
import type { AppTheme } from '../src/theme/useAppTheme';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{children}</Text>
    </Card>
  );
}

export default function PrivacyPolicy() {
  const styles = useThemedStyles(makeStyles);
  return (
    <Screen>
      <Header title="Privacy policy" />
      <Text style={styles.updated}>Last updated August 2026</Text>

      <Section title="What we store">
        Regrown is a social app: your account (email, username), profile (display name, bio, avatar), posts
        (before/after photos, captions, category, location text you enter), likes, comments, and follows are
        stored on our backend (Supabase) so other users can see them. Anything you post publicly — including
        photos — is visible to other users of the app.
      </Section>

      <Section title="Account & authentication">
        We use Supabase Auth to manage sign-up and sign-in with your email and password. Passwords are never
        stored in plain text by us or by Supabase.
      </Section>

      <Section title="Photos">
        Photos you upload for posts and your profile picture are stored in Supabase Storage and are publicly
        accessible via link, since posts are public in the app. Only upload photos you're comfortable sharing
        publicly.
      </Section>

      <Section title="Third-party services">
        Regrown's backend is provided by Supabase (database, authentication, file storage). We do not use
        third-party advertising or analytics trackers.
      </Section>

      <Section title="Data deletion">
        You can delete individual posts and comments you've created from within the app. To delete your
        account and all associated data, contact the app's support so we can remove your data from the
        backend.
      </Section>

      <Section title="Children's privacy">
        Regrown is not directed at children under 13, and does not knowingly collect data from children under
        13.
      </Section>
    </Screen>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    updated: { ...typography.caption, marginTop: -8 },
    section: { gap: 8 },
    sectionTitle: { ...typography.cardTitle },
    sectionBody: { ...typography.bodyMuted },
  });
