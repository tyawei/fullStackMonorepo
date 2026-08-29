import JSEncrypt from "jsencrypt";

export const encryptPassword = (password: string, publicKey: string) => {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  return encryptor.encrypt(password);
}

export const getAccessToken = () => {
  return localStorage.getItem('accessToken')
}

export const setAccessToken = (accessToken: string) => {
  localStorage.setItem('accessToken', accessToken)
}

export const getUserInfo = () => {
  let userInfo = localStorage.getItem('userInfo') as any
  try {
    userInfo = JSON.parse(userInfo || '{}')
    return userInfo
  } catch {
    return null
  }
}

export const setUserInfo = (userInfo: any) => {
  localStorage.setItem('userInfo', JSON.stringify(userInfo || {}))
}