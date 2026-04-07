import { OAuth2Client } from 'googleapis-common';
import { drive_v3 } from 'googleapis/build/src/apis/drive/v3';
import { logger } from '../common/shared';
import { config } from '../core/config';

function oauthConfigured(): boolean {
  const b = config.backup;
  return Boolean(
    b.googleOAuthClientId?.trim() &&
      b.googleOAuthClientSecret?.trim() &&
      b.googleOAuthRefreshToken?.trim(),
  );
}

async function testGoogleDriveConnection(): Promise<void> {
  const folderId = config.backup.googleDriveFolderId?.trim();

  if (!folderId) {
    console.info('Google Drive backup is disabled (GOOGLE_DRIVE_FOLDER_ID is not set).');
    return;
  }

  if (!oauthConfigured()) {
    console.info(
      'Google Drive backup is disabled (set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN).',
    );
    return;
  }

  try {
    const b = config.backup;
    const oauth2 = new OAuth2Client(
      b.googleOAuthClientId,
      b.googleOAuthClientSecret,
    );
    oauth2.setCredentials({ refresh_token: b.googleOAuthRefreshToken });
    const drive = new drive_v3.Drive({ auth: oauth2 });

    await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id)',
      pageSize: 1,
    });

    console.info(
      `Google Drive is successfully connected to folder ${folderId} and working.`,
    );
  } catch (error) {
    logger.error('Google Drive connection error:', error as Error);
    throw error;
  }
}

export { testGoogleDriveConnection };
