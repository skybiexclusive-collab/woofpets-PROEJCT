require('dotenv').config();
const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// .env'den okunan sistem konfigürasyonu
const CONFIG = {
    siteName: process.env.SITE_NAME || "WoofPets",
    siteLogo: process.env.SITE_LOGO || "🐶 WoofPets",
    botUser: process.env.BOT_USERNAME || "ilgazko130",
    botCookie: process.env.ROBLOX_COOKIE || "",
    bank: {
        bankName: process.env.ISBANK_BANKA || "Türkiye İş Bankası",
        recipient: process.env.ISBANK_ALICI || "Hesap Sahibi",
        iban: process.env.ISBANK_IBAN || "TR00..."
    }
};

let botRuntime = {
    status: "Çevrimiçi & Hazır",
    busy: false,
    currentTask: null
};

const PET_CATALOG = [
    { id: 1, name: "Frost Dragon", rarity: "Legendary", flyRide: "FR", price: 540, img: "🐉", stock: 2 },
    { id: 2, name: "Shadow Dragon", rarity: "Legendary", flyRide: "FR", price: 920, img: "🦇", stock: 1 },
    { id: 3, name: "Bat Dragon", rarity: "Legendary", flyRide: "FR", price: 810, img: "🎃", stock: 1 },
    { id: 4, name: "Turtle", rarity: "Legendary", flyRide: "FR", price: 135, img: "🐢", stock: 5 },
    { id: 5, name: "Kangaroo", rarity: "Legendary", flyRide: "R", price: 110, img: "🦘", stock: 3 },
    { id: 6, name: "Sea Lion", rarity: "Ultra-Rare", flyRide: "Normal", price: 35, img: "🦭", stock: 12 },
    { id: 7, name: "Cow", rarity: "Rare", flyRide: "FR", price: 95, img: "🐄", stock: 4 },
    { id: 8, name: "Elephant", rarity: "Rare", flyRide: "R", price: 80, img: "🐘", stock: 2 }
];

let paymentAudits = [];

// Ana Sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Dinamik Konfigürasyon ve Envanter API'si
app.get('/api/bootstrap', (req, res) => {
    res.json({
        success: true,
        meta: {
            siteName: CONFIG.siteName,
            siteLogo: CONFIG.siteLogo,
            botUser: CONFIG.botUser,
            botStatus: botRuntime.status,
            isBusy: botRuntime.busy
        },
        bank: CONFIG.bank,
        catalog: PET_CATALOG
    });
});

// İş Bankası Havale Bildirim API'si
app.post('/api/havale/bildir', (req, res) => {
    const { username, senderName, amount, orderCode } = req.body;

    if (!username || !senderName || !amount || !orderCode) {
        return res.status(400).json({ success: false, message: "Lütfen bildirim formundaki tüm alanları doldurunuz." });
    }

    const record = {
        id: "IS-" + Date.now(),
        orderCode,
        username,
        senderName,
        amount: parseFloat(amount),
        date: new Date().toLocaleString("tr-TR"),
        status: "İş Bankası Onayı Bekleniyor"
    };

    paymentAudits.unshift(record);
    console.log(`[Yeni Havale Bildirimi] Kod: ${orderCode} | Oyuncu: ${username} | Tutar: ${amount} TL | Gönderen: ${senderName}`);

    res.json({
        success: true,
        message: "Bildiriminiz başarıyla sisteme iletildi! İşCep transferiniz kontrol edilip bakiye teslim edilecektir."
    });
});

// Puppeteer Otomasyon Motoru
async function executeDeliveryAutomation(targetUser, item) {
    botRuntime.busy = true;
    botRuntime.status = `${targetUser} için takas hazırlanıyor...`;
    console.log(`[Puppeteer] Teslimat görevi başladı: ${targetUser} -> ${item}`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--window-size=1280,800'
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        // .env çerezini enjekte et
        if (CONFIG.botCookie && CONFIG.botCookie.length > 20) {
            await page.setCookie({
                name: '.ROBLOSECURITY',
                value: CONFIG.botCookie.replace(/"/g, ''),
                domain: '.roblox.com',
                path: '/',
                httpOnly: true,
                secure: true
            });
        }

        // Oyuncu arama sayfasına gir
        await page.goto(`https://www.roblox.com/search/users?keyword=${encodeURIComponent(targetUser)}`, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        botRuntime.status = `Oyunda Bekleniyor (${CONFIG.botUser})`;
        console.log(`[Puppeteer] ${targetUser} oyuncu araması açıldı. Bot hazır.`);

        // 40 saniye sonra oturumu temizle
        setTimeout(async () => {
            if (browser) await browser.close();
            botRuntime.busy = false;
            botRuntime.status = "Çevrimiçi & Hazır";
            console.log("[Puppeteer] Görev tamamlandı, tarayıcı sonlandırıldı.");
        }, 40000);

        return { success: true };
    } catch (err) {
        console.error("[Puppeteer Hatası]", err.message);
        if (browser) await browser.close();
        botRuntime.busy = false;
        botRuntime.status = "Çevrimiçi & Hazır";
        return { success: false, error: err.message };
    }
}

// Teslimat Tetikleme API'si
app.post('/api/bot/teslimat-baslat', (req, res) => {
    const { username, petName } = req.body;

    if (!username || !petName) {
        return res.status(400).json({ success: false, message: "Kullanıcı adı veya pet seçimi eksik." });
    }

    if (botRuntime.busy) {
        return res.status(429).json({ success: false, message: "Bot şu an başka bir teslimatta. Lütfen 30 saniye sonra tekrar deneyin." });
    }

    executeDeliveryAutomation(username, petName);

    res.json({
        success: true,
        message: `${petName} siparişiniz alındı! Bot oyuna katılıyor, lütfen Adopt Me meydanında takası bekleyin.`,
        botName: CONFIG.botUser
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`  ${CONFIG.siteName} Sunucusu Başlatıldı!`);
    console.log(`  Adres: http://0.0.0.0:${PORT}`);
    console.log(`  Bot Hesabı: ${CONFIG.botUser}`);
    console.log(`  Banka: ${CONFIG.bank.bankName} (${CONFIG.bank.recipient})`);
    console.log(`===============================================`);
});
