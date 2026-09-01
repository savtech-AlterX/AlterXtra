import { AppData } from '../store/types';

/**
 * Best-effort deletion of every locally-stored photo/video file referenced
 * from app data, so resetting/deleting data actually frees the media instead
 * of only clearing the database rows that point at it. Never throws — a URI
 * expo-file-system can't touch (a remote URI, a content-provider URI, or a
 * file that's already gone) is skipped rather than blocking the caller.
 */
export async function deleteAllLocalMedia(data: AppData): Promise<void> {
  const uris = [
    ...data.albums.flatMap((a) => a.photoUris),
    ...data.futureSelfVideos.flatMap((v) => [v.videoUri, v.replyVideoUri]),
  ].filter((uri): uri is string => !!uri);

  const FileSystem = await import('expo-file-system');
  await Promise.all(
    uris.map(async (uri) => {
      try {
        const file = new FileSystem.File(uri);
        if (file.exists) file.delete();
      } catch {
        // Not a deletable local file, or already gone — nothing to clean up.
      }
    })
  );
}
