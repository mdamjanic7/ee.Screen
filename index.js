const fs = require('fs');
const puppeteer = require('puppeteer');
const sharp = require('sharp');

const delayBeforeProceeding = 2500;
const pageLoadTimeout = 60000;
const desktopDevicePixelRatio = 2;
const desktopShotHeight = 900;
const desktopShotWidth = 1260;
const desktopResizeHeight = 700;
const desktopResizeWidth = 980;
const mobileDevicePixelRatio = 1;
const mobileShotHeight = 1600;
const mobileShotWidth = 720;
const mobileResizeHeight = 1600;
const mobileResizeWidth = 720;

const baseURL = "https://drafts.editmysite.com/theme-preview/"
const locales = [
    "ca_ES",
    "en_AU",
    "en_CA",
    "en_GB",
    "en_IE",
    "en_US",
    "es_ES",
    "es_US",
    "fr_CA",
    "fr_FR",
    "ja_JP",
]

const themes = [
    "all-day-clay",
    "alluring-decor",
    "bartolomo-wines",
    "brass-wolf",
    "free-appointments",
    "free-order-online",
    "free-shop-all",
    "green-trowel",
    "iris-et-onyx",
    "joy-bakeshop",
    "kale-n-things",
    "lavenderia-wine",
    "leaf-lemon",
    "olive-gloria",
    "olympio",
    "ordering-leaf-lemon?location=11edfa7f18d8ab59870fac1f6bbba82c", // Location ID needed to avoid the location modal
    "ordering-olympio?location=11edd266af4665ef9f8bac1f6bbbd01e",
    "ordering-youngs-place?location=11ee16e8067a3e3e9387ac1f6bbbd01e",
    "sala",
    "salt-sea-market",
    "seed-sun-sprout",
    "shape-and-form",
    "free-order-online",
    "stem-water",
    "stevie-marcel",
    "studio-clotilde",
    "the-clothiers",
    "youngs-place"
 ]

let allURLs = {};

var desktopScreenshotsFolder = './screenshots/desktop';
var mobileScreenshotsFolder = './screenshots/mobile';

var customUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36';

const pupArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-position=0,0',
    '--ignore-certificate-errors',
    '--ignore-certificate-errors-spki-list'];
const pupOptions = { 
    pupArgs, 
    ignoreHTTPSErrors: true 
}

if (require.main === module) {
    main();
}

async function main() {
    generateAllURLs();

    const browser = await puppeteer.launch(pupOptions);

    console.log("*** DESKTOP ***")
    await takeScreenshots(browser, desktopScreenshotsFolder, desktopDevicePixelRatio, desktopShotHeight, desktopShotWidth, desktopResizeHeight, desktopResizeWidth);

    console.log("*** MOBILE ***")
    await takeScreenshots(browser, mobileScreenshotsFolder, mobileDevicePixelRatio, mobileShotHeight, mobileShotWidth);
    
    await browser.close();
}


function sleep(ms) { 
    ms += new Date().getTime(); 
    while (new Date() < ms) {}
}

function generateAllURLs() {
    for (l in locales) {
        let locale = locales[l];
        allURLs[locale] = [];

        for (t in themes) {
            let theme = themes[t];
            let symbol = "?";
            if (theme.includes("?")) {
                symbol = "&";
            }
            allURLs[locale].push(baseURL + theme + symbol + "lang=" + locale);
        }
    }
    console.log();
}

async function takeScreenshots(browser, folderPath, devicePixelRatio, shotHeight, shotWidth, resizeHeight, resizeWidth) {

    // if (!fs.existsSync(folderPath)){
    //     fs.mkdirSync(folderPath, { recursive: true });
    // }

    for (const [lang, urls] of Object.entries(allURLs)) {
        console.log("Processing " + lang);
        let langFolderPath = folderPath + "/" + lang;
        if (!fs.existsSync(langFolderPath)) {
            fs.mkdirSync(langFolderPath, { recursive: true });
        }

        for (u in urls) {
            let url = urls[u];
            await takeScreenshot(browser, url, langFolderPath, devicePixelRatio, shotHeight, shotWidth, resizeHeight, resizeWidth);
        }
    }


    
}

async function takeScreenshot(browser, url, path, devicePixelRatio, shotHeight, shotWidth, resizeHeight, resizeWidth) {

    console.log(url);
    let themeName = url.split("/")[4].split("?")[0];

    const page = await browser.newPage();
       
    await page.setUserAgent(customUserAgent);
    await page.setViewport({ 
        width: shotWidth,
        height: shotHeight,
        deviceScaleFactor: devicePixelRatio
    });
    await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: pageLoadTimeout
    });
    await sleep(delayBeforeProceeding/2);
    await page.reload();
    await sleep(delayBeforeProceeding/2);

    let ss = await page.screenshot({
        fullPage: true,
        type: "jpeg"
    });
    await sharp(ss)
        .resize(resizeWidth, resizeHeight)
        .jpeg({ mozjpeg: true })
        .toFile(path + "/" + themeName + ".jpg", (err, info) => { });

}