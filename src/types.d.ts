interface ICloudFlareYesItem {
    colo: string
    ip: string
    latency: number
    line: string
    loss: number
    node: string
    speed: number
    time: string
}

interface ICloudFlareYesResponse {
    code: number
    info: ICloudFlareYesItem[] | string
    total?: number
}

interface UouinItem {
    ip: string
    loss: string
    ping: string
    speed: string
    bandwidth: string
}

interface UouinResponse {
    statu: boolean
    code: number
    msg: string
    data: Record<string, { code: number; uptime: number; info: UouinItem[] }>
}
