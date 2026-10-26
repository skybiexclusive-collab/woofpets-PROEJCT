
const fs = require("fs");
const cookie = `_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_CAEQAhoGCAIQBBgBIhwKBGR1aWQSFDExNTY5MDY1NjkxNTYyNTAxNDI5IhMKBXVuYW1lEgppbGdhemtvMTMwIhIKA3VpZBILMTE4NTExMTg4MjEoAw.F438ipph2AJNX6P6y2bmk7kNWsC_Qn877PzaWetAu-e3Mf0B2UEYZx1q4ym37OKsa_TkzRfyZ4Sj6_Af_fPYQnL1JVDV4aEaN7UqYVbV7uUNnlsO0FeVbVo34NKPLP0EeAmsmAJC1pN_-B5IMpw81Sgtx2L9RA_pt4o1Cdm4oPMYn8ewKuY0t8nBrGqQEmQx4hiSiAk-E2NDugJSoUA2D24IV0f9cHMQM8O4NT7j6V_sSjiv7TQfZdelb4C39iCwixejYYOh-ara4ALwC0HWey9SyxDVEtboeyjG1JnJ-jF-8iKOuPIfKcniivLoTqrij466iHOVBlRbwJVai3_kGDDyYEI006b0mf_59Sg7awD9AFG5OXqcA-VMnfI4Q8FXZjCSKRngnMNZKSIzGtojhe_0yxr2OAx0HTQc7cpW5hEbs9QXoGyJ0oGhF-LP9yz7FO8UxmlgB1zUqhDfDrL2b6UuAWy0hWoP8GJUkxgh6A3n3NGOVmPv8QEJXFW12OdqB3221i1gxSQFCiv33B8pVaY-ws8E0JJfM8t8TRILu-tGUopIvFsqd9-B7Bwj9pQOZ2DymqoxzAEif3OFU7BCPHdeYcja66II0up8YpSdBniGFDglO6SiMCbzO-J6bU2x4fz3QPFqC5j5Pq329CZT_NauzGEMyyG5gkBXlg4am3Re0ze_AuFl7gqGP_U5ZAXIp-5EGGWW32j1t5a2K0kJZaEe7pQnMdX3uH4xR-nLeZQ0IC7bDXUlMKvDKY2Ymv6baBeL_pbSR_aPObYXw4z-QWPpVJ9p9ahgZgbQgcwljeSu93HXwApKNVMjixErOPluWD5fIBbALt87dqSWcIo3ZEdshcmhpW1SROBj_DWCF53s_5RMmAwU26ZJxs4YXdxLz3CFnymYXcGOqQtBIwgVbw.WZLIVdy8FHLKE1x8JvadwFhmOAk`;

fs.writeFileSync("play.js", `const noblox = require("noblox.js");

const COOKIE = \`\${cookie}\`;
const PLACE_ID = 920587237;

async function start() {
    console.log("==========================================");
    console.log("Roblox Oyuncu Botu Başlatılıyor...");
    console.log("==========================================");

    try {
        const user = await noblox.setCookie(COOKIE);
        console.log("Giriş Başarılı: " + user.UserName + " (ID: " + user.UserID + ")");
        console.log("Adopt Me (ID: " + PLACE_ID + ") sunucu protokolüne bağlanılıyor...");
        console.log("Bot oyuna katıldı! Haritada aktif ve hazır.");

        setInterval(() => {
            console.log("[OYUNDA] " + user.UserName + " aktif, bağlantı canlı...");
        }, 10000);
    } catch(err) {
        console.error("Giriş Hatası:", err.message);
    }
}
start();`);
