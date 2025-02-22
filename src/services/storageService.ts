import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

interface UploadProgressCallback {
  (progress: number): void;
}

interface ProjectState {
  id: string;
  name: string;
  tracks: Array<{
    id: string;
    name: string;
    audioFile: string;
    effects: {
      reverb: number;
      echo: number;
      eq: number;
    };
    volume: number;
    isMuted: boolean;
  }>;
  masterVolume: number;
  bpm: number;
  timeSignature: string;
}

class StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({ region: 'us-east-1' });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || '';
    if (!this.bucketName) {
      throw new Error('AWS S3 bucket name is not configured.');
    }
  }

  async uploadAudioFile(
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    const fileKey = `audio/${uuidv4()}-${file.name}`;
    const uploadParams = {
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(uploadParams);

    try {
      await this.s3Client.send(command);
      if (onProgress) {
        onProgress(100); // Upload complete
      }
      return fileKey;
    } catch (error) {
      console.error('Error uploading audio file:', error);
      throw new Error('Failed to upload audio file.');
    }
  }

  async saveProjectState(projectState: ProjectState): Promise<string> {
    const projectKey = `projects/${uuidv4()}-${projectState.name}.json`;
    const projectData = JSON.stringify(projectState);

    const uploadParams = {
      Bucket: this.bucketName,
      Key: projectKey,
      Body: projectData,
      ContentType: 'application/json',
    };

    const command = new PutObjectCommand(uploadParams);

    try {
      await this.s3Client.send(command);
      return projectKey;
    } catch (error) {
      console.error('Error saving project state:', error);
      throw new Error('Failed to save project state.');
    }
  }

  validateAudioFile(file: File): boolean {
    const allowedFormats = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (!allowedFormats.includes(file.type)) {
      console.error('Invalid file format:', file.type);
      return false;
    }
    return true;
  }

  async convertAudioFile(file: File): Promise<File> {
    // Placeholder for actual conversion logic
    // For now, we assume the file is already in the correct format
    return file;
  }

  async trackUploadProgress(
    file: File,
    onProgress: UploadProgressCallback
  ): Promise<string> {
    const chunkSize = 5 * 1024 * 1024; // 5MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    let uploadedChunks = 0;

    const fileKey = `audio/${uuidv4()}-${file.name}`;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: chunk,
        ContentType: file.type,
      };

      const command = new PutObjectCommand(uploadParams);

      try {
        await this.s3Client.send(command);
        uploadedChunks++;
        const progress = Math.round((uploadedChunks / totalChunks) * 100);
        onProgress(progress);
      } catch (error) {
        console.error('Error uploading chunk:', error);
        throw new Error('Failed to upload audio file.');
      }
    }

    return fileKey;
  }
}

export const storageService = new StorageService();
