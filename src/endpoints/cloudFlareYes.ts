import { Context } from 'hono'
import { OpenAPIRoute, Str } from 'chanfana'
import { objectOutputType, z, ZodEnum, ZodOptional, ZodString, ZodTypeAny } from 'zod'

export class CloudFlareYes extends OpenAPIRoute {
    schema = {
        tags: ['Xray'],
        summary: 'Generate xray url list via CloudFlareYes',
        request: {
            query: z
                .object({
                    lang: z.enum(['EN', 'ZH'], { description: 'Language of remark' }).optional(),
                    remark: Str({
                        required: false,
                        default: '{NAME}',
                        description:
                            "Remark's template, in placeholder format<br>" +
                            '{NAME}: Name of the node<br>' +
                            '{PROTOCOL}: Protocol of the node<br>' +
                            '{UUID}: UUID of the node<br>' +
                            '{COLO}: Colocation Center Code<br>' +
                            '{IP}: Cloudflare IP<br>' +
                            '{LATENCY}: Latency<br>' +
                            '{LINE}: Line supplier<br>' +
                            '{LOSS}: Packet loss rate<br>' +
                            '{NODE}: Cloudflare node<br>' +
                            '{SPEED}: Download speed<br>' +
                            '{TIME}: Update time'
                    }),
                    name: Str({ description: 'Name of the node' }),
                    protocol: z.enum(['vmess', 'vless'], { description: 'Protocol of the node' }),
                    uuid: Str({ description: 'UUID of the node' })
                })
                .passthrough()
        },
        responses: {
            '200': {
                description: 'Return xray url list'
            }
        }
    }

    async handle(c: Context<{ Bindings: Env }>) {
        const data = await this.getValidatedData<typeof this.schema>()

        const response = await this.requestYes(c.env.CLOUD_FLARE_YES_API, c.env.CLOUD_FLARE_YES_KEY)
        if (!response.ok) {
            return c.text('')
        }
        const cloudFlareYesResponse = await response.json<ICloudFlareYesResponse>()
        if (typeof cloudFlareYesResponse.info !== 'object') {
            return c.text(cloudFlareYesResponse.info)
        }

        const urlList = this.generateUrlList(cloudFlareYesResponse, data.query)

        return c.text(urlList.join('\n'))
    }

    async requestYes(api: string, key: string) {
        return await fetch(api, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ key })
        })
    }

    generateUrlList(
        cloudFlareYesResponse: ICloudFlareYesResponse,
        queryParams: objectOutputType<
            {
                lang: ZodOptional<ZodEnum<['EN', 'ZH']>>
                remark: ZodString
                name: ZodString
                protocol: ZodEnum<['vmess', 'vless']>
                uuid: ZodString
            },
            ZodTypeAny,
            'passthrough'
        >
    ) {
        const { lang, remark, name, protocol, uuid, ...otherParams } = queryParams

        return (cloudFlareYesResponse.info as ICloudFlareYesItem[]).map(
            (item: ICloudFlareYesItem) => {
                const url = new URL(
                    `${protocol}://${uuid}@${item.ip}:443#${this.formatRemark(lang, remark, name, protocol, uuid, item)}`
                )
                Object.entries(otherParams).forEach(([key, value]) => {
                    url.searchParams.append(key, value as string)
                })
                return url.toString()
            }
        )
    }

    formatRemark(
        lang: 'EN' | 'ZH' | undefined,
        remark: string,
        name: string,
        protocol: 'vmess' | 'vless',
        uuid: string,
        item: ICloudFlareYesItem
    ) {
        return remark
            .replace('{NAME}', name)
            .replace('{PROTOCOL}', protocol)
            .replace('{UUID}', uuid)
            .replace('{COLO}', item.colo)
            .replace('{IP}', item.ip)
            .replace('{LATENCY}', `${item.latency}ms`)
            .replace('{LINE}', this.translateLine(lang, item.line))
            .replace('{LOSS}', `${item.loss}%`)
            .replace('{NODE}', item.node)
            .replace('{SPEED}', `${item.speed}KB/s`)
            .replace('{TIME}', item.time)
    }

    translateLine(lang: 'EN' | 'ZH' | undefined, line: string) {
        switch (lang) {
            case 'EN':
                switch (line) {
                    case 'CM':
                        return 'China Mobile'
                    case 'CU':
                        return 'China Unicom'
                    case 'CT':
                        return 'China Telecom'
                    default:
                        return line
                }
            case 'ZH':
                switch (line) {
                    case 'CM':
                        return '中国移动'
                    case 'CU':
                        return '中国联通'
                    case 'CT':
                        return '中国电信'
                    default:
                        return line
                }
            default:
                return line
        }
    }
}
