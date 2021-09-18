var title = ["実験課題1", "ArgoUML 図形削除機能", "ArgoUML 図形選択機能", "JHotDraw 図形移動機能", "JHotDraw 図形選択機能", "Eclipse デバッグ機能"];
var titleToJson = new Map([[title[0], "../toyPrograms/pre_Exp7/pre_Exp7.json"],
                           [title[1],
                            "../realPrograms/ArgoUML/actionRemoveFromDiagram/actionRemoveFromDiagram.json"],
                           [title[2],
                            "../realPrograms/ArgoUML/modeSelect/modeSelect.json"],
                           [title[3],
                            "../realPrograms/JHotDraw/defaultDragTracker/defaultDragTracker.json"],
                           [title[4],
                            "../realPrograms/JHotDraw/selectionTool/selectionTool.json"],
                          [title[5],
                            "../realPrograms/Eclipse/eclipseDebug/eclipseDebug.json"]
                         ]);
var key = title[2]; //Change here!
var root;
var stack = [{
    "num": "0",
    "line": "0"
}];
var stackIndex = [];
var path;

var curHtml;
var curClassName;
var curRoot;

function init(param) {
    console.log("-----init()-----")
    if (!param) {
        parent.document.title = key;
    } else {
        var k = getParam('key', param);
        key = title[k];
        parent.document.title = key;
    }
    $.getJSON(titleToJson.get(key), (data) => {
        root = data.root;
        init_globals();
        parent.toolBarFrame.onStartSrcCode(); // srcCode.js
    });
}

function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function init_globals() {
    if (stack.length > 1) {
        while (stack.length > 1) {
            stack.pop();
        }
    }
    if (stackIndex.length > 0) {
        while (stackIndex.length > 0) {
            stackIndex.pop();
        }
    }

    stack[0].line = root.firstLine;
    curRoot = root;
    setPath(titleToJson.get(key));

    // curHtml, curClassName変更
    setCurHtml(root.html);
}

function setCurHtml(htmlPath) {
    curHtml = htmlPath;
    setClassName(htmlPath);
}

function setClassName(htmlPath) {
    var splitHtml = htmlPath.split(".");
    curClassName = splitHtml[0];
}

function setPath(value) {
    var splitValue = value.split(`/`);
    var removeValue = splitValue[splitValue.length - 1];
    path = value.replace(removeValue, "");
}
