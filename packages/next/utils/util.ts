import JSEncrypt from "jsencrypt";

export const encryptPassword = (password: string, publicKey: string) => {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  return encryptor.encrypt(password);
}