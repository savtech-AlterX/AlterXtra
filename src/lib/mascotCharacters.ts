import { AppIconChoice } from '../store/types';

export type MascotCharacterKey = 'male-bald' | 'male-curly' | 'female-straight' | 'female-curly';

// Metro requires static, literal require() paths — this can't be built from
// a template string, so every frame is spelled out explicitly.
const FRAMES: Record<MascotCharacterKey, number[]> = {
  'male-bald': [
    require('../../assets/mascot/male-bald-01.png'),
    require('../../assets/mascot/male-bald-02.png'),
    require('../../assets/mascot/male-bald-03.png'),
    require('../../assets/mascot/male-bald-04.png'),
    require('../../assets/mascot/male-bald-05.png'),
    require('../../assets/mascot/male-bald-06.png'),
    require('../../assets/mascot/male-bald-07.png'),
  ],
  'male-curly': [
    require('../../assets/mascot/male-curly-01.png'),
    require('../../assets/mascot/male-curly-02.png'),
    require('../../assets/mascot/male-curly-03.png'),
    require('../../assets/mascot/male-curly-04.png'),
    require('../../assets/mascot/male-curly-05.png'),
    require('../../assets/mascot/male-curly-06.png'),
    require('../../assets/mascot/male-curly-07.png'),
  ],
  'female-straight': [
    require('../../assets/mascot/female-straight-01.png'),
    require('../../assets/mascot/female-straight-02.png'),
    require('../../assets/mascot/female-straight-03.png'),
    require('../../assets/mascot/female-straight-04.png'),
    require('../../assets/mascot/female-straight-05.png'),
    require('../../assets/mascot/female-straight-06.png'),
    require('../../assets/mascot/female-straight-07.png'),
  ],
  'female-curly': [
    require('../../assets/mascot/female-curly-01.png'),
    require('../../assets/mascot/female-curly-02.png'),
    require('../../assets/mascot/female-curly-03.png'),
    require('../../assets/mascot/female-curly-04.png'),
    require('../../assets/mascot/female-curly-05.png'),
    require('../../assets/mascot/female-curly-06.png'),
    require('../../assets/mascot/female-curly-07.png'),
  ],
};

// Placeholder pairing between the chosen identity icon and which mascot
// character plays for it — swap these four lines once the real mapping is
// decided. 'mystery' has no matching character (none of the four designs are
// gender-neutral) and is deliberately left unmapped rather than forced onto
// whichever character happens to be the fallback — see framesForIcon.
const ICON_TO_CHARACTER: Partial<Record<AppIconChoice, MascotCharacterKey>> = {
  male: 'male-bald',
  'male-mohawk': 'male-curly',
  female: 'female-straight',
  'female-curly': 'female-curly',
};

// Empty for an icon with no matching character (currently just 'mystery') —
// callers treat a zero-length result as "skip the reveal, there's nothing to
// show," not an error.
export function framesForIcon(icon: AppIconChoice): number[] {
  const character = ICON_TO_CHARACTER[icon];
  return character ? FRAMES[character] : [];
}

// Whether the mascot has already played once in this app session (JS module
// state, not persisted) — separate from settings.alterXtraIntroShown, which
// only gets set once the user actually dismisses or opens the Alter-Xtra
// panel. Without this, leaving Home before that happens (e.g. switching tabs
// and back) would remount AlterXtraIntro and replay the whole sequence, since
// component state alone doesn't survive the unmount.
let playedThisSession = false;

export function hasMascotPlayedThisSession(): boolean {
  return playedThisSession;
}

export function markMascotPlayedThisSession(): void {
  playedThisSession = true;
}
