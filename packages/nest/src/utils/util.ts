import { ConfigService } from '@nestjs/config';
import NodeRSA from 'node-rsa';
import * as bcrypt from 'bcrypt'
import { CryptoService } from 'src/crypto/crypto.service';

export const decryptPassword = (encryptedPassword: string, cryptoService: CryptoService) => {
    const privateKey = cryptoService.getPrivateKey()
    const key = new NodeRSA(privateKey);
    const decryptedPassword = key.decrypt(encryptedPassword, 'utf8');
    return decryptedPassword
}