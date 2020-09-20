function onRestartSrcCode() {
    var eSrcCodeText = parent.srcCodeFrame.document.getElementById("srcCodeText");

    parent.init_globals(); // globals.js
    onStartSrcCode();
    eSrcCodeText.addEventListener('load', function () {
        changeHighlighted(-1, parent.stack[0].line);
        setToolBarClickable(true); // toolBar.js
    }, {
        once: true
    });
}

function onStartSrcCode() { // call from globals.js
    console.log("-----onStartSrcCode()-----")
    var eClassName = parent.srcCodeFrame.document.getElementById("className");
    var eSrcCodeText = parent.srcCodeFrame.document.getElementById("srcCodeText");

    setEClassNameInner(parent.curClassName);
    loadParentsSrcCode(parent.root.parents);
    loadSrcCode(parent.curHtml);
    eSrcCodeText.addEventListener('load', function () {
        setFlag(); // callStack.js
    }, {
        once: true
    });
}

function onFinishSrcCode() {
    setToolBarClickable(false); // toolBar.js
}

function loadParentsSrcCode(parents) {
    var srcCodeFrameDocument = parent.srcCodeFrame.document;

    if (srcCodeFrameDocument.body.hasChildNodes()) {
        while (srcCodeFrameDocument.body.children.length > 2) {
            srcCodeFrameDocument.body.removeChild(srcCodeFrameDocument.body.firstChild);
        }
    }
    if (parents) {
        var eIframe;
        for (var i = 0; i < parents.length; i++) {
            var curPtsHtmlPath = parent.path + parents[i].html;
            var eP = srcCodeFrameDocument.createElement("p");
            var eImg = srcCodeFrameDocument.createElement("img");
            var splitHtml = (parents[i].html).split(".");
            var classNameTextNode = srcCodeFrameDocument.createTextNode(splitHtml[0] + ".java");
            eIframe = srcCodeFrameDocument.createElement("iframe"); // IFRAME作成
            var eDiv = srcCodeFrameDocument.createElement("div");

            eImg.setAttribute("src", "../images/jcu_obj.png");
            eImg.setAttribute("alt", "jcu_obj");
            eP.appendChild(eImg); // pに画像を追加
            eP.appendChild(classNameTextNode); // pにテキストノードを追加
            eP.classList.add("tab-title");
            eDiv.appendChild(eP);

            eIframe.setAttribute('scrolling', "no");
            eIframe.classList.add("tab-content");
            eDiv.appendChild(eIframe); // IFRAMEを実装

            srcCodeFrameDocument.body.insertBefore(eDiv, srcCodeFrameDocument.body.firstChild);
            eDiv.setAttribute('id', parents[i].html);
            eIframe.setAttribute("src", curPtsHtmlPath);
        }
        // TODO: Optimisation(includes)
        eIframe.addEventListener('load', function () {
            for (var i = parents.length - 1; i >= 0; i--) { // 中身が違う場合
                var eDiv = srcCodeFrameDocument.getElementById(parents[i].html);
                var eIframe = eDiv.lastChild;
                if (eIframe) {
                    iframeResize(eIframe);
                }
            }
        }, {
            once: true
        });
    }
}

function loadSrcCode(curHtml, from = null, to = null) {
    var curHtmlPath = parent.path + curHtml;
    var eSrcCodeText = parent.srcCodeFrame.document.getElementById("srcCodeText");

    eSrcCodeText.setAttribute("src", curHtmlPath);
    eSrcCodeText.addEventListener('load', function () {
        if (from && to) {
            changeHighlighted(from, to);
        }
        iframeResize(eSrcCodeText);
        srcCodeFrameScroll();
    }, {
        once: true
    });
}

function changeHighlighted(from, to) {
    var eSrcCodeText = parent.srcCodeFrame.document.getElementById("srcCodeText");
    var curSrcCodeText;
    var regex = /^(\s*:)|(\s{8,}})$|@Override/g;
    if (!parent.curClassName.includes("$")) {
        curSrcCodeText = eSrcCodeText.contentDocument.querySelector('#' + parent.curClassName);
    } else {
        tempClassName = (parent.curClassName).split("$");
        curSrcCodeText =
            eSrcCodeText.contentDocument.querySelector('#' + tempClassName[tempClassName.length - 1]);
        regex = /^(\s*:)|(\s{12,}})$|@Override/g;
    }
    var td_code = curSrcCodeText.children[0].children[1].children[0].children[0].children[1].children[0].children;
    var td_gutter = curSrcCodeText.children[0].children[1].children[0].children[0].children[0].children;

    if (to != -1) {
        if (td_code.length < to) {
            var toFlag = false;
            for (var i = 0; i < td_code.length; i++) {
                if (td_gutter[i].innerHTML == to
                    && td_code[i].innerHTML != "&nbsp;" && !regex.test(td_code[i].innerText)) {
                    if ((td_code[i].innerText).includes("public") && !(td_code[i].innerText).includes(parent.curClassName)) {
                        break;
                    }
                    // srcCode(1 origin line num -> 0 origin syntax highlighter)
                    td_code[i].classList.add("highlighted");
                    // lineNum(1 origin line num -> 0 origin syntax highlighter)
                    td_gutter[i].classList.add("highlighted");
                    toFlag = true;
                    break;
                }
            }
            if (!toFlag) {
                changeHighlighted(-1, Number(to) + 1);
                var stackLen = parent.stack.length;
                parent.stack[stackLen - 1].line = Number(parent.stack[stackLen - 1].line) + 1;
            }
        } else {
            // srcCode(1 origin line num -> 0 origin syntax highlighter)
            td_code[to - 1].classList.add("highlighted");
            // lineNum(1 origin line num -> 0 origin syntax highlighter)
            td_gutter[to - 1].classList.add("highlighted");
        }
    }
    if (from != -1) {
        if (td_code.length < from) {
            var fromFlag = false;
            for (var i = 0; i < td_code.length; i++) {
                if (td_gutter[i].innerHTML == from && td_code[i].innerHTML != "&nbsp;" && !regex.test(td_code[i].innerText)) {
                    // srcCode(1 origin line num -> 0 origin syntax highlighter)
                    td_code[i].classList.remove("highlighted");
                    // lineNum(1 origin line num -> 0 origin syntax highlighter)
                    td_gutter[i].classList.remove("highlighted");
                    fromFlag = true;
                    break;
                }
            }
            if (!fromFlag) {
                changeHighlighted(Number(from) + 1, -1);
            }
        } else {
            // srcCode(1 origin)
            td_code[from - 1].classList.remove("highlighted");
            // lineNum(1 origin)
            td_gutter[from - 1].classList.remove("highlighted");
        }
    }
}

function iframeResize(element) {
    //    var clientHeight = parent.srcCodeFrame.document.documentElement.clientHeight;
    //    var clientHeight = element.contentDocument.body.clientHeight;
    var clientHeight = element.contentWindow.document.body.scrollHeight;
    var clientWidth = parent.srcCodeFrame.document.body.clientWidth;
    element.style.height = clientHeight + 'px';
    element.style.width = clientWidth + 'px';
}

function srcCodeFrameScroll() {
    var clientHeight = parent.srcCodeFrame.document.documentElement.clientHeight;
    var scrollHeight = parent.srcCodeFrame.document.body.scrollHeight;
    console.log(clientHeight + ", " + scrollHeight);
    if (clientHeight < scrollHeight) {
        var eClassName = parent.srcCodeFrame.document.getElementById("className");
        parent.srcCodeFrame.scrollTo(0, eClassName.offsetTop); /* 親ページをスクロールしない場合はこの行を削除 */
    }
}

function stepIntoSrcCode() {
    console.log("-----stepIntoSrcCode()-----")
    outputLog(parent.curRoot);

    var stackLen = parent.stack.length;
    var curLine = parent.stack[stackLen - 1].line;
    var children = parent.curRoot.children;

    if (!children) { // childrenがnullで, 読むchildrenがないとき
        return stepOverSrcCode();
    }

    if (parent.stackIndex.length < stackLen) {
        if (curLine <= parent.curRoot.lastLine) {
            parent.stackIndex.push(0);
        }
    } else {
        // 読むchildrenがないとき
        if (children.length <= parent.stackIndex[stackLen - 1] + 1) {
            if (curLine >= parent.curRoot.lastLine) {
                return stepOverSrcCode();
            }
        }
        parent.stackIndex[stackLen - 1] += 1;
        if (stackLen == 1 && parent.stackIndex.length > 1) {
            while (parent.stackIndex.length > 1) {
                parent.stackIndex.pop();
            }
        }
    }

    var curStackIndex = parent.stackIndex[stackLen - 1];
    var callFromLine;
    if (curStackIndex < children.length) {
        callFromLine = children[curStackIndex].callFrom;
    }
    if (callFromLine && curLine == callFromLine) {
        parent.stack.push({
            "num": curStackIndex,
            "line": children[curStackIndex].callee.firstLine
        });
        stackLen = parent.stack.length;

        outputLog(parent.curRoot, parent.stack[stackLen - 1].line, callFromLine, curStackIndex);
        // curHtml, curClassName変更, global.js
        parent.setCurHtml(children[curStackIndex].callee.html);
        parent.setClassName(parent.curHtml);

        setEClassNameInner(parent.curClassName);
        // srcCode読み込み
        loadParentsSrcCode(children[curStackIndex].callee.parents);
        loadSrcCode(parent.curHtml, -1, parent.stack[stackLen - 1].line);
        parent.curRoot = children[curStackIndex].callee;
        outputLog(parent.curRoot);
    } else {
        if (parent.stackIndex[stackLen - 1]) {
            parent.stackIndex[stackLen - 1] -= 1;
        } else {
            parent.stackIndex.pop();
        }
        return stepOverSrcCode();
    }
}

function stepOverSrcCode() {
    console.log("-----stepOverSrcCode()-----")

    var stackLength = parent.stack.length;
    var curLine = parent.stack[stackLength - 1].line;
    var curStackIndex = parent.stackIndex[stackLength - 1];
    var children = parent.curRoot.children;
    var eSrcCodeText = parent.srcCodeFrame.document.getElementById("srcCodeText");

    if (curLine < parent.curRoot.lastLine) { // curLineがlastLineより前にあるとき
        changeHighlighted(curLine, Number(curLine) + 1);
        parent.stack[stackLength - 1].line = Number(parent.stack[stackLength - 1].line) + 1;

        if (stackLength == 1 && parent.stackIndex.length > 1) {
            while (parent.stackIndex.length > 1) {
                parent.stackIndex.pop();
            }
        }

        var callFromLine;
        if (children) {
            if (parent.stackIndex.length < stackLength) {
                parent.stackIndex.push(0);
                curStackIndex = parent.stackIndex[stackLength - 1];
                callFromLine = children[curStackIndex].callFrom;
                if (callFromLine && curLine != callFromLine) {
                    parent.stackIndex.pop();
                } else {
                    while (curStackIndex + 1 < children.length) {
                        parent.stackIndex[stackLength - 1] += 1;
                        curStackIndex = parent.stackIndex[stackLength - 1];
                        callFromLine = children[curStackIndex].callFrom;
                        if (callFromLine && curLine != callFromLine) {
                            parent.stackIndex[stackLength - 1] -= 1;
                            curStackIndex = parent.stackIndex[stackLength - 1];
                            break;
                        }
                    }
                }
            } else {
                while (curStackIndex + 1 < children.length) {
                    parent.stackIndex[stackLength - 1] += 1;
                    curStackIndex = parent.stackIndex[stackLength - 1];
                    callFromLine = children[curStackIndex].callFrom;
                    if (callFromLine && curLine != callFromLine) {
                        parent.stackIndex[stackLength - 1] -= 1;
                        break;
                    }
                }
            }
        }

        outputLog(parent.curRoot, curLine, callFromLine, curStackIndex);
        return;

    } else { // curLineがlastLineより同じか後ろにあるとき
        outputLog(parent.curRoot, curLine, callFromLine, curStackIndex);
        if (parent.root == parent.curRoot) { // callStackに呼び出しが残っていないとき
            changeHighlighted(curLine, -1);
            parent.stack[stackLength - 1].line = Number(parent.stack[stackLength - 1].line) + 1;
            return onFinishSrcCode();

        } else { // callStackに呼び出しが残っているとき
            var tempRoot = parent.root;

            parent.stack.pop(); //　一つ前のスタックに戻る
            stackLength = parent.stack.length;
            curLine = parent.stack[stackLength - 1].line;
            for (var i = 0; i < (stackLength - 1); i++) {
                if (tempRoot.children.length - 1 < parent.stack[i + 1].num) {
                    return;
                }
                tempRoot = tempRoot.children[parent.stack[i + 1].num].callee;
            }
            parent.curRoot = tempRoot;
            children = parent.curRoot.children;
            // curHtml, curClassName変更, globals.js
            parent.setCurHtml(parent.curRoot.html);
            parent.setClassName(parent.curHtml);

            setEClassNameInner(parent.curClassName);
            loadParentsSrcCode(parent.curRoot.parents);
            if (children.length > parent.stackIndex[stackLength - 1] + 1) { // 読むchildrenがあるとき
                // srcCode読み込み
                loadSrcCode(parent.curHtml, -1, curLine);
                outputLog(parent.curRoot, curLine, callFromLine, curStackIndex);
                return;
            } else { // 読むchildrenがないとき
                if (curLine < parent.curRoot.lastLine) { // curLineがlastLineより前にあるとき
                    // srcCode読み込み
                    loadSrcCode(parent.curHtml, curLine, Number(curLine) + 1);
                    parent.stack[stackLength - 1].line = Number(parent.stack[stackLength - 1].line) + 1;

                    outputLog(parent.curRoot, curLine, callFromLine, curStackIndex);
                    return;
                } else {
                    // srcCode読み込み
                    loadSrcCode(parent.curHtml, -1, curLine);

                    outputLog(parent.curRoot, curLine, callFromLine, curStackIndex);
                    return;
                }
            }
        }
    }

    var callFromLine = children[curStackIndex].callFrom;

    outputLog(children[curStackIndex], parent.stack[stackLength - 1].line, callFromLine, curStackIndex)
    // curHtml, curClassName変更, globals.js
    parent.setCurHtml(children[curStackIndex].callee.html);
    parent.setClassName(parent.curHtml);

    setClassName(parent.curClassName);
    // srcCode読み込み
    loadParentsSrcCode(children[curStackIndex].callee.parents);
    loadSrcCode(parent.curHtml, -1, parent.stack[stackLength - 1].line);

    parent.curRoot = children[curStackIndex].callee;
}

function stepReturnSrcCode() {
    console.log("-----stepReturnSrcCode()-----");
    var preRoot = parent.curRoot;
    while (preRoot == parent.curRoot) {
        stepOverSrcCode();
    }
    outputLog(parent.curRoot);
    //    stepOverSrcCode();
    //    console.log("-----stepReturnSrcCode()-----");
    //    outputLog(parent.curRoot);
    //    if (preRoot == parent.curRoot) {
    //        stepOverSrcCode();
    //    }
}

function isStepReturn() {
    if (parent.stack.length > 1) {
        return setStepReturnClickable(true); //toolBar.js
    }
    return setStepReturnClickable(false); //toolBar.js;
}

function outputLog(curRoot, curLine, callFromLine, curStackIndex) {
    console.log(curRoot);
    console.log(`curLine=${curLine}, callFromLine=${callFromLine}`);
    console.log(`stackLength=${parent.stack.length}, curStackIndex=${curStackIndex}, stackIndex=${parent.stackIndex}`);
    for (var i = 0; i < parent.stack.length; i++) {
        console.log(`stack[${i}]=${parent.stack[i].line}, ${parent.stack[i].num}`)
    }
}

function setEClassNameInner(className) {
    var eClassName = parent.srcCodeFrame.document.getElementById("className");
    eClassName.lastChild.textContent = className + ".java";
}
