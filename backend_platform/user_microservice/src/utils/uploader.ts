import { v2 as cloudinary, type UploadApiOptions } from 'cloudinary';
import { env } from '../environment.ts';

cloudinary.config({
  secure: true,
  url: env.CLOUDINARY_URL,
});

export function upload(file: Express.Multer.File, options: UploadApiOptions = {}, folder='tares/player-avatars'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:folder ,
        resource_type: 'image',
        ...options,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error('Cloudinary did not return an avatar URL'));
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(file.buffer);
  });
}