// import $ from 'jquery';
import jtopo from './lib/jtopo_npm/bin/jtopo-1.3.8_trial-esm-min.js';
import { HostInfoWrapper } from './get_hosts.js';
import { SwitchInfoWrapper } from './get_switches.js';
const BASE_URL = 'http://192.168.147.130:8080';
var host_infos = [];
var switch_infos = [];
var link_infos = [];
var stage;
var layer = null;
$(function () {
    const divId = document.getElementById('divId');
    stage = new jtopo.Stage(divId);    // 一个Stage下面可以有多个'层',Layer

    const getHostsBtn = document.getElementById("get-hosts-btn");
    getHostsBtn.addEventListener("click", function () {
        // 在这里编写点击事件的代码
        getTopo();
    });
    const form = document.querySelector('form');
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // 阻止表单提交的默认行为
        const timeInput = document.getElementById('time');
        send_hard_time_out_flow(timeInput.value);
    });
});
function send_hard_time_out_flow(time) {
    const data = {
        "dpid": 1,
        "cookie": 1,
        "cookie_mask": 1,
        "table_id": 0,
        "hard_timeout": time,
        "priority": 65534,
        "flags": 1,
        "match": {
            "in_port": 1
        },
        "actions": []
    };
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE_URL}/stats/flowentry/add`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status !== 200) {
            console.error('请求失败');
        }
    };
    xhr.onerror = function () {
        console.error('请求失败');
    };
    xhr.send(JSON.stringify(data));
};
function draw() {
    if (layer !== null) {
        layer.removeAllChild();
        stage.removeChild(layer);
    }
    layer = new jtopo.Layer();
    var Node = jtopo.Node;
    var Link = jtopo.Link;
    // 根据一个DIV的id创建顶层对象：Stage
    // 多个Layer可以配合，比如有背景层，有动画层，有交互、展示层等
    // 一般步骤，将Layer放入到‘场景’中
    stage.addChild(layer);
    let nodes = [];
    let switches = [];
    let links = [];
    let count = 0;
    const set = new Set();
    for (const switch_info of switch_infos) {
        count++;
        for (const port_info of switch_info.ports) {
            set.add(port_info["hw_addr"]); // 将元素添加到Set中
        }
        var node = new Node(switch_info.dpid, 800 / switch_infos.length * count, 100, 48, 48);
        node.setImage('imgs/switch.png');
        node.addEventListener("click", function (event) {
            $.ajax({
                url: `${BASE_URL}/stats/flow/` + Number(switch_info.dpid).toString(),
                method: 'GET',
                success: (resp) => {
                    let flows = resp[Number(switch_info.dpid).toString()];
                    document.getElementById("get-flows").innerHTML = "";
                    for (const flow of flows) {
                        const jsonStr = JSON.stringify(flow);
                        document.getElementById("get-flows").innerHTML += jsonStr;
                    }
                    console.log(`active-flows: ${count}`);
                },
                error: (xhr, status, error) => {
                    console.error(error);
                }
            });
        });
        switches.push(node);
        layer.addChild(node);
    }
    count = 0;
    for (const host_info of host_infos) {
        if (set.has(host_info.mac)) {
            continue; // 如果Set中已经存在该元素，就跳过本次循环
        }
        count++;
        // 创建一个节点：new Node('文本', x，y，宽度, 高度)';
        var node = new Node(host_info.mac, 800 / host_infos.length * count, 400, 48, 48);
        node.setImage('imgs/host.png');
        nodes.push(node);
        layer.addChild(node);
    }
    for (const link_info of link_infos) {
        for (const switch_info of switches) {
            for (const node of nodes) {
                if (node.text == link_info[0] && switch_info.text == link_info[1]) {
                    // 连线 new Link('文本',开始节点,结束节点);
                    var link = new Link('Link', node, switch_info);
                    link.setStyles('lineWidth', 2);
                    layer.addChild(link);
                }
            }
            for (const switch_info2 of switch_infos) {
                for (const port_info of switch_info2.ports) {
                    if (port_info['hw_addr'] == link_info[0] && switch_info.text == link_info[1]) {
                        for (const switch_2 of switches) {
                            if (switch_2.text == port_info['dpid']) {
                                var link = new Link('Link', switch_2, switch_info);
                                // 连线 new Link('文本',开始节点,结束节点);
                                link.setStyles('lineWidth', 2);
                                layer.addChild(link);
                            }
                        }
                    }
                }
            }
        }
    }
    // 按画布居中
    stage.translateToCenter();
    // 最后一步：显示
    stage.show();
};
function getTopo() {
    getHosts(() => {
        getSwitches(() => {
            draw();
        });
    });
};
function getHosts(callback) {
    $.ajax({
        url: `${BASE_URL}/v1.0/topology/hosts`,
        method: 'GET',
        success: (resp) => {
            const host_info_wrapper = new HostInfoWrapper(resp);
            host_infos = host_info_wrapper.get_port_infos();
            callback();
        },
        error: (xhr, status, error) => {
            console.error(error);
        }
    })
};
function getSwitches(callback) {
    $.ajax({
        url: `${BASE_URL}/v1.0/topology/switches`,
        method: 'GET',
        success: (resp) => {
            const switch_info_wrapper = new SwitchInfoWrapper(resp);
            switch_infos = switch_info_wrapper.get_switch_infos();
            for (const host_info of host_infos) {
                for (const switch_info of switch_infos) {
                    for (const port_info of switch_info.ports) {
                        if (host_info.port["name"] == port_info["name"]) {
                            link_infos.push([host_info.mac, port_info["dpid"]]);
                        }
                    }
                }
            }
            callback();
        },
        error: (xhr, status, error) => {
            console.error(error);
        }
    })
};
