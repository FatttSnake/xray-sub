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
