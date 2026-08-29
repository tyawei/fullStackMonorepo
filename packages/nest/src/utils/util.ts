import NodeRSA from 'node-rsa';
import { CryptoService } from 'src/crypto/crypto.service';

export const decryptPassword = (encryptedPassword: string, cryptoService: CryptoService) => {
    const privateKey = cryptoService.getPrivateKey()
    const key = new NodeRSA(privateKey);

    // 前端 jsencrypt 默认就是 pkcs1，后端这里必须声明
    key.setOptions({encryptionScheme: 'pkcs1'})

    const decryptedPassword = key.decrypt(encryptedPassword, 'utf8');

    return decryptedPassword
}