import CryptoJS from 'crypto-js';

// 配置常量
const SALT_LENGTH = 128; // 盐值长度（位）
const IV_LENGTH = 128;   // 初始化向量长度（位）
const KEY_SIZE = 256;    // AES密钥大小
const ITERATIONS = 10000; // PBKDF2迭代次数

/**
 * 生成随机盐值
 */
function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(SALT_LENGTH / 8).toString();
}

/**
 * 生成随机初始化向量
 */
function generateIV(): string {
  return CryptoJS.lib.WordArray.random(IV_LENGTH / 8).toString();
}

/**
 * 从密码派生密钥（使用PBKDF2）
 */
function deriveKey(password: string, salt: string): CryptoJS.lib.WordArray {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: KEY_SIZE / 32,
    iterations: ITERATIONS,
    hasher: CryptoJS.algo.SHA256
  });
}

/**
 * 加密数据
 * @param plaintext 明文内容
 * @param password 密码
 * @returns 加密后的数据包
 */
export function encryptContent(plaintext: string, password: string): string {
  try {
    // 生成随机盐值和IV
    const salt = generateSalt();
    const iv = generateIV();
    
    // 从密码派生密钥
    const key = deriveKey(password, salt);
    
    // 创建HMAC密钥（用于认证）
    const hmacKey = CryptoJS.SHA256(key + 'hmac').toString();
    
    // AES-256-CBC加密
    const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // 创建认证标签（HMAC-SHA256）
    const authTag = CryptoJS.HmacSHA256(
      salt + iv + encrypted.toString(),
      hmacKey
    ).toString();
    
    // 组合加密数据包
    const encryptedPackage = {
      salt: salt,
      iv: iv,
      ciphertext: encrypted.toString(),
      authTag: authTag,
      version: '1.0'
    };
    
    // 返回Base64编码的JSON
    return btoa(JSON.stringify(encryptedPackage));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt content');
  }
}

/**
 * 解密数据
 * @param encryptedData Base64编码的加密数据
 * @param password 密码
 * @returns 解密后的明文
 */
export function decryptContent(encryptedData: string, password: string): string | null {
  try {
    // 解析加密数据包
    const encryptedPackage = JSON.parse(atob(encryptedData));
    const { salt, iv, ciphertext, authTag, version } = encryptedPackage;
    
    // 版本检查
    if (version !== '1.0') {
      throw new Error('Unsupported encryption version');
    }
    
    // 从密码派生密钥
    const key = deriveKey(password, salt);
    
    // 创建HMAC密钥
    const hmacKey = CryptoJS.SHA256(key + 'hmac').toString();
    
    // 验证认证标签
    const computedTag = CryptoJS.HmacSHA256(
      salt + iv + ciphertext,
      hmacKey
    ).toString();
    
    // 使用恒定时间比较防止时序攻击
    if (!constantTimeCompare(computedTag, authTag)) {
      return null; // 认证失败
    }
    
    // AES解密
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // 转换为UTF-8字符串
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    
    // 验证解密结果
    if (!plaintext) {
      return null;
    }
    
    return plaintext;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

/**
 * 生成密码验证数据
 * 使用动态盐值，更安全
 */
export function generatePasswordVerification(password: string): { token: string; salt: string } {
  // 生成随机盐值
  const salt = generateSalt();
  
  // 生成令牌
  const token = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 5000,
    hasher: CryptoJS.algo.SHA256
  }).toString().substring(0, 32);
  
  return { token, salt };
}

/**
 * 验证密码
 * @param password 输入的密码
 * @param token 存储的令牌
 * @param salt 存储的盐值
 */
export function verifyPassword(password: string, token: string, salt: string): boolean {
  const computedToken = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 5000,
    hasher: CryptoJS.algo.SHA256
  }).toString().substring(0, 32);
  
  return constantTimeCompare(computedToken, token);
}

/**
 * 恒定时间字符串比较（防止时序攻击）
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * 混淆内容（用于在HTML中存储）
 */
export function obfuscateForStorage(content: string): string {
  // 将内容分块并打乱
  const chunkSize = 100;
  const chunks: string[] = [];
  
  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.slice(i, i + chunkSize));
  }
  
  // 生成随机排序
  const indices = chunks.map((_, i) => i);
  const shuffled = [...indices].sort(() => Math.random() - 0.5);
  
  return JSON.stringify({
    chunks: shuffled.map(i => chunks[i]),
    order: shuffled
  });
}

/**
 * 反混淆内容
 */
export function deobfuscateFromStorage(obfuscated: string): string {
  try {
    const { chunks, order } = JSON.parse(obfuscated);
    const original = new Array(chunks.length);
    
    order.forEach((originalIndex: number, currentIndex: number) => {
      original[originalIndex] = chunks[currentIndex];
    });
    
    return original.join('');
  } catch {
    return '';
  }
}

/**
 * 生成内容指纹（用于完整性验证）
 */
export function generateContentFingerprint(content: string): string {
  return CryptoJS.SHA256(content).toString().substring(0, 16);
}

/**
 * 安全清除字符串（尝试从内存中清除敏感数据）
 */
export function secureClear(str: string): void {
  if (typeof str === 'string') {
    const arr = new Array(str.length + 1).join('\x00');
    try {
      Object.assign(str, arr);
    } catch {
      // 某些环境下可能失败
    }
  }
}

/**
 * 创建安全的密码输入处理器
 */
export class SecurePasswordHandler {
  private timeout: number | null = null;
  private attempts = 0;
  private readonly maxAttempts = 5;
  private readonly lockoutTime = 300000; // 5分钟
  
  checkAttempts(): boolean {
    const lockoutUntil = sessionStorage.getItem('password_lockout');
    if (lockoutUntil) {
      const now = Date.now();
      const lockoutTime = parseInt(lockoutUntil);
      if (now < lockoutTime) {
        return false;
      } else {
        sessionStorage.removeItem('password_lockout');
        this.attempts = 0;
      }
    }
    return true;
  }
  
  recordFailedAttempt(): void {
    this.attempts++;
    if (this.attempts >= this.maxAttempts) {
      const lockoutUntil = Date.now() + this.lockoutTime;
      sessionStorage.setItem('password_lockout', lockoutUntil.toString());
    }
  }
  
  resetAttempts(): void {
    this.attempts = 0;
    sessionStorage.removeItem('password_lockout');
  }
  
  getRemainingAttempts(): number {
    return Math.max(0, this.maxAttempts - this.attempts);
  }
  
  isLockedOut(): boolean {
    const lockoutUntil = sessionStorage.getItem('password_lockout');
    if (lockoutUntil) {
      return Date.now() < parseInt(lockoutUntil);
    }
    return false;
  }
  
  getLockoutRemainingTime(): number {
    const lockoutUntil = sessionStorage.getItem('password_lockout');
    if (lockoutUntil) {
      const remaining = parseInt(lockoutUntil) - Date.now();
      return Math.max(0, Math.ceil(remaining / 1000)); // 返回秒数
    }
    return 0;
  }
}