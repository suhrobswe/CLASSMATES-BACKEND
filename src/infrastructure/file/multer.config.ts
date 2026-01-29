import { memoryStorage } from 'multer';

export const multerMemoryOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
};
