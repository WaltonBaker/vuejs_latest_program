import axios from 'axios'

export function request(config) {
    const instance1 = axios.create({
        baseURL: 'http://127.0.0.1:8888/api/private/v1/',
        timeout: 5000
    })
    // 通过axios的请求拦截器添加token
    instance1.interceptors.request.use(config => {
        config.headers.Authorization = window.sessionStorage.getItem('token')
        return config
    })
    return instance1(config)
}
