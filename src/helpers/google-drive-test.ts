import { GoogleDriveService, logger } from '../common/shared';

async function testGoogleDriveConnection(): Promise<void> {
  try {
    const files = await GoogleDriveService.listFiles();
    console.info(
      `Google Drive is successfully connected and working. Found ${files.length} file(s) in backup folder.`,
    );
  } catch (error) {
    console.error('Google Drive connection error:', error as Error);
    throw error;
  }
}

export { testGoogleDriveConnection };
