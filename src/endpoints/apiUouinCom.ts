import { Context } from 'hono'
import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { createHash } from 'node:crypto'

export class ApiUouinCom extends OpenAPIRoute {
    schema = {
        tags: ['Xray'],
        summary: 'Generate xray url list via api.uouin.com',
        request: {
            query: z.looseObject({
                lang: z.enum(['EN', 'ZH']).describe('Language of remark').optional(),
                remark: z
                    .string()
                    .default('{NAME}')
                    .describe(
                        "Remark's template, in placeholder format<br>" +
                            '{NAME}: Name of the node<br>' +
                            '{PROTOCOL}: Protocol of the node<br>' +
                            '{UUID}: UUID of the node<br>' +
                            '{LINE}: Line supplier<br>' +
                            '{TIME}: Update time' +
                            '{IP}: Cloudflare IP<br>' +
                            '{LOSS}: Packet loss rate<br>' +
                            '{LATENCY}: Latency<br>' +
                            '{SPEED}: Download speed<br>' +
                            '{BANDWIDTH}: Bandwidth'
                    ),
                name: z.string().describe('Name of the node'),
                protocol: z.enum(['vmess', 'vless']).describe('Protocol of the node'),
                uuid: z.string().describe('UUID of the node')
            })
        },
        responses: {
            '200': {
                description: 'Return xray url list'
            }
        }
    }

    async handle(c: Context<{ Bindings: Env }>) {
        const data = await this.getValidatedData<typeof this.schema>()

        const response = await this.requestUouin(c.env.UOUIN_API)
        if (!response.ok) {
            return c.text('')
        }
        const uouinResponse = await response.json<UouinResponse>()
        if (!uouinResponse.statu) {
            return c.text(uouinResponse.msg)
        }

        const urlList = this.generateUrlList(uouinResponse, data.query)

        return c.text(urlList.join('\n'))
    }

    async requestUouin(api: string) {
        const url = new URL(api)
        const { hash, timestamp } = this.generateSign()
        url.searchParams.append('key', hash)
        url.searchParams.append('time', timestamp.toString())

        return await fetch(url)
    }

    hex_md5(str: string) {
        return createHash('md5').update(str).digest('hex')
    }

    generateSign() {
        const timestamp = Date.now()
        const keyMd5 = this.hex_md5('DdlTxtN0sUOu')
        const signStr = `${keyMd5}70cloudflareapikey${timestamp}`
        const hash = this.hex_md5(signStr)

        return {
            hash,
            timestamp
        }
    }

    generateUrlList(
        uouinResponse: UouinResponse,
        queryParams: {
            lang?: 'EN' | 'ZH'
            remark: string
            name: string
            protocol: 'vmess' | 'vless'
            uuid: string
        } & Record<string, unknown>
    ) {
        const { lang, remark, name, protocol, uuid, ...otherParams } = queryParams

        const urlList: string[] = []

        Object.entries(uouinResponse.data).forEach(([line, value]) => {
            value.info.forEach((item) => {
                const str = `${protocol}://${uuid}@${line === 'ipv6' ? `[${item.ip}]` : item.ip}:443#${this.formatRemark(lang, remark, name, protocol, uuid, line, value.uptime, item)}`
                const url = new URL(
                    `${protocol}://${uuid}@${line === 'ipv6' ? `[${item.ip}]` : item.ip}:443#${this.formatRemark(lang, remark, name, protocol, uuid, line, value.uptime, item)}`
                )

                Object.entries(otherParams).forEach(([key, value]) => {
                    url.searchParams.append(key, value as string)
                })
                urlList.push(url.toString())
            })
        })

        return urlList
    }

    formatRemark(
        lang: 'EN' | 'ZH' | undefined,
        remark: string,
        name: string,
        protocol: 'vmess' | 'vless',
        uuid: string,
        line: string,
        time: number,
        item: UouinItem
    ) {
        return remark
            .replace('{NAME}', name)
            .replace('{PROTOCOL}', protocol)
            .replace('{UUID}', uuid)
            .replace('{LINE}', this.translateLine(lang, line))
            .replace('{TIME}', this.formatDate(time))
            .replace('{IP}', item.ip)
            .replace('{LOSS}', item.loss)
            .replace('{LATENCY}', item.ping)
            .replace('{SPEED}', item.speed)
            .replace('{BANDWIDTH}', item.bandwidth)
    }

    translateLine(lang: 'EN' | 'ZH' | undefined, line: string) {
        switch (lang) {
            case 'EN':
                switch (line) {
                    case 'bgp':
                        return 'BGP'
                    case 'cmcc':
                        return 'China Mobile'
                    case 'cucc':
                        return 'China Unicom'
                    case 'ctcc':
                        return 'China Telecom'
                    case 'ipv6':
                        return 'IPv6'
                    default:
                        return line
                }
            case 'ZH':
                switch (line) {
                    case 'bgp':
                        return '多线'
                    case 'cmcc':
                        return '中国移动'
                    case 'cucc':
                        return '中国联通'
                    case 'ctcc':
                        return '中国电信'
                    case 'ipv6':
                        return 'IPv6'
                    default:
                        return line
                }
            default:
                return line
        }
    }

    formatDate(timestamp: number) {
        const date = new Date(timestamp * 1000)
        const formatNumber = (num: number) => num.toString().padStart(2, '0')

        return `${date.getFullYear()}-${formatNumber(date.getMonth() + 1)}-${formatNumber(date.getDate())} ${formatNumber(date.getHours())}:${formatNumber(date.getMinutes())}:${formatNumber(date.getSeconds())}`
    }
}
