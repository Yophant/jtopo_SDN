class SwitchInfo {
  constructor(dpid, ports) {
    this.dpid = dpid;
    this.ports = ports;
  }
}

export class SwitchInfoWrapper {
  constructor(json_res) {
    this.switch_infos = [];
    this.parse_json(json_res);
  }

  parse_json(json_res) {
    for (const item of json_res) {
      const dpid = item["dpid"];
      const ports = item["ports"];
      this.switch_infos.push(new SwitchInfo(dpid, ports));
    }
  }

  get_switch_infos() {
    return this.switch_infos;
  }
}