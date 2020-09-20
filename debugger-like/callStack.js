var flag = false;
var curCallStackStyle = {
    background: "#d8dadb",
    display: "table",
    margin: "0px",
    marginTop: "10px",
    whiteSpace: "nowrap",
    fontSize: "small"
};

var callStackStyle = {
    background: "#fff",
    marginTop: "0px"
};

function onRestartCallStack() {
    console.log("-----onRestartCallStack()-----");
    removeAllCallStack();
    createCallStack();
}

function stepIntoCallStack() {
    var curRoot = parent.curRoot;
    var stackIndex = parent.stackIndex;
    var stack = parent.stack;
    var stackLen = stack.length;
    var curLine = stack[stackLen - 1].line;

    if (!curRoot.children) { // childrenがnullのとき
        return stepOverCallStack();
    }

    if (curRoot.children.length <= stackIndex[stackLen - 1] + 1) { // 読むchildrenがないとき
        return stepOverCallStack();
    }

    var eCallStack = parent.callStackFrame.document.getElementById("callStack");
    var eCallStackChLen = eCallStack.childNodes.length;

    if (flag) {
        eCallStackChLen -= 1;
    }
    console.log(`callStackLength=${eCallStackChLen}, stackLength=${stackLen}`)
    // 子要素の削除
    if (eCallStack.hasChildNodes() && eCallStackChLen > stackLen) {
        while (eCallStackChLen > stackLen) {
            eCallStack.removeChild(eCallStack.firstChild);
            eCallStackChLen -= 1;
        }
        if (flag && !eCallStackChLen) {
            eCallStack.removeChild(eCallStack.firstChild);
        }
        setCallStackStyle();
    } else {
        if (curLine <= parent.curRoot.lastLine) {
            stepOverCallStack();
        } else {
            createCallStack();
        }
    }
}

function stepOverCallStack() {
    var eCallStack = parent.callStackFrame.document.getElementById("callStack");
    var stack = parent.stack;
    var stackLen = stack.length;
    var curLine = stack[stackLen - 1].line;
    var eCallStackChLen = eCallStack.children.length;

    if (flag) {
        eCallStackChLen -= 1;
    }
    console.log(`callStackLength=${eCallStackChLen}, stackLength=${stackLen}`)
    // 子要素の削除
    if (eCallStack.hasChildNodes()) {
        while (eCallStackChLen >= stackLen) {
            eCallStack.removeChild(eCallStack.firstChild);
            eCallStackChLen -= 1;
        }
        if (flag && !eCallStackChLen) {
            eCallStack.removeChild(eCallStack.firstChild);
        }
    }

    if (curLine <= parent.curRoot.lastLine) {
        createCallStack();
    }
}

function stepReturnCallStack() {
    var curRoot = parent.curRoot;
    stepOverCallStack();
    if (curRoot.children) { // childrenがnullでないとき
        if (curRoot != parent.root) { //curRootがrootでないとき
            stepOverCallStack();
        }
    }
}

function createCallStack() {
    var eCallStack = parent.callStackFrame.document.getElementById("callStack");

    if (flag && !eCallStack.hasChildNodes()) {
        var eP = parent.callStackFrame.document.createElement("p");
        var eImg = parent.callStackFrame.document.createElement("img");
        var newCallStackNode = parent.callStackFrame.document.createTextNode("     :");

        // 画像に生成する要素と属性
        eImg.setAttribute("src", "../images/stckframe_obj.png");
        eImg.setAttribute("alt", "stackframe_obj");
        eImg.style.verticalAlign = "middle";
        eP.appendChild(eImg); // pに画像を追加

        // divにテキストノードを追加
        eP.appendChild(newCallStackNode);
        if (!eCallStack.hasChildNodes()) {
            eCallStack.appendChild(eP);
        }
    }

    var eP = parent.callStackFrame.document.createElement("p");
    var eImg = parent.callStackFrame.document.createElement("img");
    var splitSignature = (parent.curRoot.signature).split(" ");
    var newCallStackText;
    if (splitSignature.length > 3) {
        for(var i = 3; i < splitSignature.length; i++) {
            splitSignature[2] += " " + splitSignature[i];
        }
        splitSignature.splice(3, splitSignature.length - 3) ;
    }
    if (splitSignature[splitSignature.length - 1].includes(parent.curClassName)) {
        splitSignature[splitSignature.length - 1] =
            splitSignature[splitSignature.length - 1].replace(parent.curClassName, "<init>")
    }
    if (!parent.curRoot.actualClass) {
        newCallStackText =
            parent.curClassName + "." + splitSignature[splitSignature.length - 1] + " line: " + parent.stack[parent.stack.length - 1].line;
    } else {
        newCallStackText =
            parent.curRoot.actualClass + "(" + parent.curClassName + ")." + splitSignature[splitSignature.length - 1] + " line: " + parent.stack[parent.stack.length - 1].line;

    }
    var newCallStackNode = parent.callStackFrame.document.createTextNode(newCallStackText);

    // 画像に生成する要素と属性
    eImg.setAttribute("src", "../images/stckframe_obj.png");
    eImg.setAttribute("alt", "stackframe_obj");
    eImg.style.verticalAlign = "middle";
    eP.title = newCallStackText;
    eP.appendChild(eImg); // pに画像を追加

    // divにテキストノードを追加
    eP.appendChild(newCallStackNode);
    if (!eCallStack.hasChildNodes()) {
        eCallStack.appendChild(eP);
    } else {
        eCallStack.insertBefore(eP, eCallStack.firstChild);
    }
    setCallStackStyle();
//    setDivWidth(eCallStack);
}

function removeAllCallStack() {
    var eCallStack = parent.callStackFrame.document.getElementById("callStack");

    // 子要素の削除
    if (eCallStack.hasChildNodes()) {
        while (eCallStack.firstChild) {
            eCallStack.removeChild(eCallStack.firstChild);
        }
    }
}

function setCallStackStyle() {
    var eCallStack = parent.callStackFrame.document.getElementById("callStack");

    if (eCallStack.hasChildNodes()) {
        for (var key in curCallStackStyle) {
            eCallStack.firstChild.style[key] = curCallStackStyle[key];
        }
        if (eCallStack.children.length > 1) { // second children
            for (var key in callStackStyle) {
                eCallStack.children[1].style[key] = callStackStyle[key];
            }
        }
    }
}

function setFlag() { // CallStackに呼び出しの省略が必要かどうか
    var eSrcCodeText = parent.srcCodeFrame.document.getElementById("srcCodeText");
    var curSrcCodeText = eSrcCodeText.contentDocument.querySelector('#' + parent.curClassName);
    var td_code = curSrcCodeText.children[0].children[1].children[0].children[0].children[1].children[0].children;
    var curLine = parent.stack[parent.stack.length - 1].line;
    if (td_code.length < curLine) {
        flag = true;
    }
}
