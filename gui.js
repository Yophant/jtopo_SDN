import jtopo from './lib/jtopo_npm/bin/jtopo-1.3.8_trial-esm-min.js';

var Stage = jtopo.Stage;
var Layer = jtopo.Layer;
var Node = jtopo.Node;
var Link = jtopo.Link;
// 根据一个DIV的id创建顶层对象：Stage
// 注：'divId' 需换成你页面实际的div的id或者dom对象
var stage = new Stage('divId');
// 一个Stage下面可以有多个'层',Layer
// 多个Layer可以配合，比如有背景层，有动画层，有交互、展示层等
var layer = new Layer();
// 一般步骤，将Layer放入到‘场景’中
stage.addChild(layer);
// 创建一个节点：new Node('文本', x，y，宽度, 高度)';
// 所有参数都是可选项，也可以稍后赋值
var fromNode = new Node('From', 200, 200, 48, 48);
// 设置图片
fromNode.setImage('imgs/server_icon.png');
// 创建另一个节点
var toNode = new Node('To');
// x,y
toNode.setXY(400, 200);
// 大小
toNode.resizeTo(48, 48);
toNode.setImage('imgs/server_icon.png');
// 连线 new Link('文本',开始节点,结束节点);
var link = new Link('Link', fromNode, toNode);
// 设置样式：粗细
link.setStyles('lineWidth', 2);
// 将节点和连线都加入到Layer中
layer.addChild(fromNode);
layer.addChild(toNode);
layer.addChild(link);
// 按画布居中
stage.translateToCenter();
// 最后一步：显示
stage.show();