var imgStepInto = "../images/stepinto_co.png";
var imgStepIntoDisable = "../images/stepinto_co_disable.png";
var imgStepOver = "../images/stepover_co.png";
var imgStepOverDisable = "../images/stepover_co_disable.png";
var imgStepReturn = "../images/stepreturn_co.png";
var imgStepReturnDisable = "../images/stepreturn_co_disable.png";

function setToolBarClickable(flag) {
    var eBtStepInto = self.document.getElementById("bt_stepinto");
    var eBtStepOver = self.document.getElementById("bt_stepover");
    if (flag && eBtStepInto.disabled && eBtStepOver.disabled) { // ボタン有効
        eBtStepInto.src = imgStepInto;
        eBtStepOver.src = imgStepOver;
        eBtStepInto.disabled = "";
        eBtStepOver.disabled = "";
    }
    if (!flag && !eBtStepInto.disabled && !bt_stepover.disabled) { // ボタン無効化
        self.document.getElementById("bt_stepinto").disabled = "disabled";
        self.document.getElementById("bt_stepover").disabled = "disabled";
        eBtStepInto.src = imgStepIntoDisable;
        eBtStepOver.src = imgStepOverDisable;
    }
}

function setStepReturnClickable(flag) {
    var eBtStepReturn = self.document.getElementById("bt_stepreturn");
    if (flag && eBtStepReturn.disabled) { // ボタン有効化
        eBtStepReturn.src = imgStepReturn;
        eBtStepReturn.disabled = "";
    }
    if (!flag && !eBtStepReturn.disabled) { // ボタン無効化
        eBtStepReturn.src = imgStepReturnDisable;
        eBtStepReturn.disabled = "disabled";
    }
}
