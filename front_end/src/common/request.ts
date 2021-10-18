import axios from "axios/index";
import CONSTS from "./consts";


const axiosProxy = axios.create({
    withCredentials: true,
    baseURL: CONSTS.BASE_URL,
    headers: {'Content-Type': 'application/json; charset=UTF-8'}
});

axiosProxy.interceptors.request.use(config => {
    return config;
}, error => {
    return Promise.reject(error);
});

axiosProxy.interceptors.response.use(response => {
    return response;
}, error => {
    return Promise.reject(error);
});

export function post<T>(url: string | undefined, data: any = {},  final = () => {
}): Promise<any> {
    return new Promise((resolve, reject) => {
        if (!url || url.trim() === '') {
            reject({});
            return;
        }
        axiosProxy.post(url, data)
            .then(response => {
                // @ts-ignore
                if (response.status === CONSTS.RESULT_CODE.SUCCESS && response.data.code === CONSTS.RESULT_CODE.SUCCESS) {
                    resolve(response.data)
                } else {
                    reject(response.data);
                }
            }, (err) => {
                reject(err);
            }).finally(() => {
            final()
        });
    });
}

export default axiosProxy;

