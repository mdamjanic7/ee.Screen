const fs = require('fs');
const puppeteer = require('puppeteer');

const delayBeforeProceeding = 3000;
const pageLoadTimeout = 60000;
const desktopDevicePixelRatio = 1;
const desktopShotHeight = 700;
const desktopShotWidth = 980;
const mobileDevicePixelRatio = 1;
const mobileShotHeight = 1600;
const mobileShotWidth = 720;

const baseURL = "https://drafts.editmysite.com/theme-preview/"
const locales = [
    "en_US",
    "es_US",
    "fr_FR"
]

const themes = [
    "leaf-lemon",
    "the-clothiers"
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
    await takeScreenshots(browser, desktopScreenshotsFolder, desktopDevicePixelRatio, desktopShotHeight, desktopShotWidth);

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
            allURLs[locale].push(baseURL + theme + "?lang=" + locale);
        }
    }
    console.log();
}

async function takeScreenshots(browser, folderPath, devicePixelRatio, shotHeight, shotWidth) {

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
            await takeScreenshot(browser, url, langFolderPath, devicePixelRatio, shotHeight, shotWidth);
        }
    }


    
}

async function takeScreenshot(browser, url, path, devicePixelRatio, shotHeight, shotWidth) {

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
    await page.screenshot({ 
        path: path + "/" + themeName + ".png",
        fullPage: true 
    });
}