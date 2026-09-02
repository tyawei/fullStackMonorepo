import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, setAccessToken } from './util'
import { apis } from './apis'

interface IRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean
}

console.log('next_env===', process.env.NEXT_PUBLIC_BASE_URL)
const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,       // nest 服务
    timeout: 30000,
    withCredentials: true,      // http 携带 cookie
})

// let accessToken = ''        // 这里初始值为状态管理中的值
let isRefreshing = false
let requestWaitList = [] as any[]

instance.interceptors.request.use((config) => {
    // const accessToken = store.getState().accessToken
    const accessToken = getAccessToken()
    if (accessToken) {
        config.headers.Authorization = 'Bearer ' + accessToken
    }
    return config
})

instance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response
    },
    async (error: AxiosError) => {
        console.log('http_error===', error)

        const originRequest = error.config as IRequestConfig
        // const { url, _retry } = originRequest || {}
        const { status, } = error.response || {}

        if (
            status === 401 && 
            !originRequest._retry && 
            !originRequest.url?.includes('/refreshToken') && 
            !originRequest.url?.includes('/logout')
        ) {
            if (isRefreshing) {
                // requestWaitList.push(originRequest)
                return new Promise((resolve, reject) => {
                    requestWaitList.push({resolve, reject, requestConfig: originRequest})
                })
            } else {
                try {
                    // 加锁，当前正在刷新
                    isRefreshing = true 
                    // 防止同一个请求进入拦截器逻辑
                    originRequest._retry = true
                    // 刷新token
                    const {data: { data }} = await instance.post(apis.refreshToken, {}, {withCredentials: true})

                    const accessToken = data?.accessToken || data

                    requestWaitList.forEach(({resolve, reject, requestConfig}) => {
                        requestConfig.headers.Authorization = 'Bearer ' + accessToken 
                        resolve(instance.request(requestConfig))
                    })

                    // store().setToken(accessToken)
                    setAccessToken(accessToken)

                    isRefreshing = false                 

                    // 重新请求最开始401这个
                    return instance.request(originRequest)

                } catch(e) {
                    requestWaitList = []
                    isRefreshing = false 
// window.location.href = '/' 

                    return Promise.reject(e)
                }
            }
        } else {
            // 刷新token时报401，refreshToken 过期；
            // 退出登录401，可能是前端 refreshToken 不正确/被篡改，重新登录
            if (
                status === 401 && 
                (originRequest.url?.includes('/refreshToken') || originRequest.url?.includes('/logout'))
            ) {
                console.log('token过期异常')
// window.location.href = '/'; 
            }
            return Promise.reject(error)
        }
        
    }
)

export default instance