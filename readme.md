前后端密码加密传输：
在Linux环境下（linux系统或者windows安装 WSL），使用如下命令生成密钥文件：
openssl genrsa -out private_key.pem 2048
再根据密钥文件生成公钥文件：
openssl rsa -in private_key.pem -pubout -out public_key.pem