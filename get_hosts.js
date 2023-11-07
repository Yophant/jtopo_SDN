class HostInfo {
    constructor(mac, ipv4, ipv6, port) {
        this.mac = mac;
        this.ipv4 = ipv4;
        this.ipv6 = ipv6;
        this.port = port;
    }
}

export class HostInfoWrapper {
    constructor(json_res) {
        this.host_infos = [];
        this.parse_json(json_res);
    }

    parse_json(json_res) {
        // const data = JSON.parse(json_res);
        for (const item of json_res) {
            const mac = item["mac"];
            const ipv4 = item["ipv4"];
            const ipv6 = item["ipv6"];
            const port = item["port"];
            this.host_infos.push(new HostInfo(mac, ipv4, ipv6, port));
        }
    }

    get_port_infos() {
        return this.host_infos;
    }
}