import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from './user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService implements OnModuleInit {
  // getHello(): string {
  //   return 'Hello World!';
  // }

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    try {
      const accounts = this.configService.get('ACCOUNTS') || ''
      const passwords = this.configService.get('PASSWORDS') || ''
      if (!accounts || !passwords || !accounts.includes('admin')) {
        throw new HttpException('account or password of admin was not configurated', HttpStatus.INTERNAL_SERVER_ERROR)
      }

      const accountList = accounts.split(',')
      const passwordList = passwords.split(',')
      if (accountList.length !== passwordList.length) {
        throw new HttpException('account or password configuration is incorrect', HttpStatus.INTERNAL_SERVER_ERROR)
      }

      accountList.forEach((a, i) => {
        const config = {account: a, password: passwordList[i]}
        this.userService.create(config)
      })

    } catch(err) {
      throw new HttpException(JSON.stringify(err), HttpStatus.INTERNAL_SERVER_ERROR)
    }  
  }
}
