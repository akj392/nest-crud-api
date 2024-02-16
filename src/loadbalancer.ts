import axios, { AxiosRequestConfig } from 'axios';
import * as http from 'http';
const dotenv = require('dotenv');
dotenv.config();

const servers = [
    'http://localhost:4001',
    'http://localhost:4002',
    'http://localhost:4003'
];

let counter = 0;

export function proxyRequest(req: any, res: any,) {
    const targetUrl = servers[counter];
    counter = (counter + 1) % servers.length;
    return proxy(req, res, targetUrl);
}

async function proxy(req: any, res: any, targetUrl: string) {
    let body = {};
    const requestData: AxiosRequestConfig = {
        method: req.method,
        url: targetUrl + req.url,
        params: req.params,
        data: req.body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    console.debug(`Method:${requestData.method}---Url:${requestData.url}`)
    axios(requestData).then((response) => {
        res.json(response.data)
        res.end()
    }).catch(err => {
        console.log(err)
    })
}
