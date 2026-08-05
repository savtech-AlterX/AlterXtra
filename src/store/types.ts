export type PostCategory =
  | 'cleanup'
  | 'habitat_restoration'
  | 'reforestation'
  | 'wildlife'
  | 'renewable_energy'
  | 'community'
  | 'other';

export const CATEGORY_LABELS: Record<PostCategory, string> = {
  cleanup: 'Cleanup',
  habitat_restoration: 'Habitat restoration',
  reforestation: 'Reforestation',
  wildlife: 'Wildlife recovery',
  renewable_energy: 'Renewable energy',
  community: 'Community project',
  other: 'Good news',
};

export const CATEGORY_ICONS: Record<PostCategory, keyof typeof import('@expo/vector-icons').Ionicons.glyphMap> = {
  cleanup: 'trash-outline',
  habitat_restoration: 'leaf-outline',
  reforestation: 'flower-outline',
  wildlife: 'paw-outline',
  renewable_energy: 'sunny-outline',
  community: 'people-outline',
  other: 'earth-outline',
};

export const ALL_CATEGORIES: PostCategory[] = [
  'cleanup',
  'habitat_restoration',
  'reforestation',
  'wildlife',
  'renewable_energy',
  'community',
  'other',
];

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  author_id: string;
  category: PostCategory;
  caption: string | null;
  location_name: string | null;
  before_photo_url: string;
  after_photo_url: string;
  created_at: string;
  author: Profile | null;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author: Profile | null;
};
