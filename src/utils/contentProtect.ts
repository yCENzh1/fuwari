import { 
  encryptContent, 
  generatePasswordVerification,
  obfuscateForStorage 
} from './crypto-client';

// 生成密码验证数据
export function generatePasswordData(password: string): { token: string; salt: string } {
  return generatePasswordVerification(password);
}

// 加密并混淆内容
export function obfuscateContent(content: string, password: string): string {
  // 先使用AES加密
  const encrypted = encryptContent(content, password);
  // 再进行混淆存储
  return obfuscateForStorage(encrypted);
}