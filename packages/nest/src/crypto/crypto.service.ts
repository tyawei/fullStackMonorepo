import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { readFileSync } from "fs";

@Injectable()
export class CryptoService {
    constructor(private readonly configService: ConfigService) {}

    getPrivateKey() {
        const privateKeyPath = this.configService.get('RSA_PRIVATE_KEY_PATH') || ''
        const privateKey = readFileSync(privateKeyPath, {encoding: 'utf-8'})
        return privateKey
    }
}