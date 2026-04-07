import fs from 'fs';
import { OAuth2Client } from 'googleapis-common';
import { drive_v3 } from 'googleapis/build/src/apis/drive/v3';
import { config } from '../../../core/config';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';

class GoogleDriveService {
  private drive: drive_v3.Drive | null = null;
  private folderId: string;
  private maxFiles: number;

  constructor() {
    this.folderId = config.backup.googleDriveFolderId;
    this.maxFiles = config.backup.maxFiles;
  }

  private oauthConfigured(): boolean {
    const b = config.backup;
    return Boolean(
      b.googleOAuthClientId?.trim() &&
        b.googleOAuthClientSecret?.trim() &&
        b.googleOAuthRefreshToken?.trim(),
    );
  }

  private getDrive(): drive_v3.Drive {
    if (!this.drive) {
      if (!this.oauthConfigured()) {
        throw new Error(
          'Google Drive backup requires GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_OAUTH_REFRESH_TOKEN.',
        );
      }
      const b = config.backup;
      const oauth2 = new OAuth2Client(
        b.googleOAuthClientId,
        b.googleOAuthClientSecret,
      );
      oauth2.setCredentials({
        refresh_token: b.googleOAuthRefreshToken,
      });
      this.drive = new drive_v3.Drive({ auth: oauth2 });
    }

    return this.drive;
  }

  async listFiles(): Promise<{ id: string; createdTime: string }[]> {
    const res = await this.getDrive().files.list({
      q: `'${this.folderId}' in parents and trashed = false`,
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime asc',
    });

    return (res.data.files || [])
      .filter((file) => !!file.id && !!file.createdTime)
      .map((file) => ({
        id: file.id as string,
        createdTime: file.createdTime as string,
      }));
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.getDrive().files.delete({ fileId });
  }

  async enforceMaxFiles(): Promise<void> {
    const files = await this.listFiles();

    if (files.length >= this.maxFiles) {
      const oldest = files[0];
      await this.deleteFile(oldest.id);
    }
  }

  async uploadFile(filePath: string, fileName: string): Promise<string> {
    await this.enforceMaxFiles();

    const res = await this.getDrive().files.create({
      requestBody: {
        name: fileName,
        parents: [this.folderId],
      },
      media: {
        mimeType: 'application/gzip',
        body: fs.createReadStream(filePath),
      },
    });

    return res.data.id as string;
  }
}

export default new GoogleDriveService();
