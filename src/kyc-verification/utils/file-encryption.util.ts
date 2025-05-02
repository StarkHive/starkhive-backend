import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export class FileEncryptionUtil {
  private static algorithm = 'aes-256-cbc';

  /**
   * Encrypts a file and saves it to disk
   * @param buffer File buffer to encrypt
   * @param destPath Destination path for the encrypted file
   * @returns Object containing the file path and encryption key
   */
  static async encryptAndSave(
    buffer: Buffer,
    destPath: string,
  ): Promise<{ filePath: string; encryptionKey: string }> {
    // Generate encryption key and initialization vector
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    // Ensure directory exists
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Encrypt and save file
    const encryptedData = Buffer.concat([
      cipher.update(buffer),
      cipher.final(),
    ]);

    fs.writeFileSync(destPath, encryptedData);

    // Return file path and encryption key (as hex strings)
    return {
      filePath: destPath,
      encryptionKey: `${key.toString('hex')}:${iv.toString('hex')}`,
    };
  }

  /**
   * Decrypts a file
   * @param filePath Path to the encrypted file
   * @param encryptionKey Encryption key used to encrypt the file
   * @returns Decrypted file buffer
   */
  static async decrypt(
    filePath: string,
    encryptionKey: string,
  ): Promise<Buffer> {
    // Split encryption key into key and iv parts
    const [keyHex, ivHex] = encryptionKey.split(':');
    const key = Buffer.from(keyHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');

    // Read encrypted file
    const encryptedData = fs.readFileSync(filePath);

    // Create decipher
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);

    // Decrypt file
    const decryptedData = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decryptedData;
  }
}