function changeLineNum(lineNumPair, id) {
    var eArfd = document.getElementById(id);
    var td_gutter = eArfd.children[0].children[1].children[0].children[0].children[0].children;
    var i = 0;
    for (i = 0; i < lineNumPair.length - 1; i++) {
        var lineNum = lineNumPair[i][0];
        var nextLineNum = lineNumPair[i + 1][0];
        var j = 0;
        var k = 0;
        for (j = lineNum; j < nextLineNum - 1; j++) {
            td_gutter[j - 1].innerHTML = lineNumPair[i][1] + k;
            k++;
        }
        td_gutter[j - 1].innerHTML = ":";
    }
    var k = 0;
    for (; j < td_gutter.length; j++) {
        td_gutter[j].innerHTML = lineNumPair[i][1] + k;
        k++;
    }
}
