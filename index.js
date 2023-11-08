const { error } = require('console');
const fs = require('fs');
const puppeteer = require('puppeteer');
const sharp = require('sharp');

const baseURL = "https://drafts.editmysite.com/theme-preview/"
const desktopScreenshotsFolder = './screenshots/desktop';
const mobileScreenshotsFolder = './screenshots/mobile';
const settingsPath = "./settings.json"

const customUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36';

const pupArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-position=0,0',
    '--ignore-certificate-errors',
    '--ignore-certificate-errors-spki-list'];
const pupOptions = { 
    pupArgs, 
    ignoreHTTPSErrors: true,
    headless: "new"
}

var allURLs = {};
var settings = {};


if (require.main === module) {
    main();
}

async function main() {
    readSettings();
    generateAllURLs();

    const browser = await puppeteer.launch(pupOptions);
    if (settings.desktop.takeScreenshots) {
        console.log("*** DESKTOP ***")
        await takeScreenshots(browser, desktopScreenshotsFolder, settings.desktop.devicePixelRatio, settings.desktop.shotHeight, settings.desktop.shotWidth,settings.desktop.resizeHeight, settings.desktop.resizeWidth);
    }
    else {
        console.log("*** Skipping DESKTOP ***")
    }

    if (settings.mobile.takeScreenshots) {

        console.log("*** MOBILE ***")
        await takeScreenshots(browser, mobileScreenshotsFolder, settings.mobile.devicePixelRatio, settings.mobile.shotHeight, settings.mobile.shotWidth, settings.mobile.resizeHeight, settings.mobile.resizeWidth);
    }
    else {
        console.log("*** Skipping MOBILE ***")
    }

    await browser.close();
    console.log("Finished")
}


function sleep(ms) { 
    ms += new Date().getTime(); 
    while (new Date() < ms) {}
}

function generateAllURLs() {
    for (l in settings.locales) {
        let locale = settings.locales[l];
        allURLs[locale] = [];

        for (t in settings.themes) {
            let theme = settings.themes[t];
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
        waitUntil: 'networkidle0',
        timeout: settings.pageLoadTimeout
    });

    await sleep(settings.delayBeforeProceeding);

    let ss = await page.screenshot({
        type: "jpeg"
    });
    await sharp(ss)
        .resize(resizeWidth, resizeHeight)
        .jpeg({ mozjpeg: true })
        .toFile(path + "/" + themeName + ".jpg", (err, info) => { });

}

async function readSettings() {
    let data = fs.readFileSync(settingsPath);
    settings = JSON.parse(data);

    if (!settings?.delayBeforeProceeding) {
        console.error("delayBeforeProceeding is missing");
        process.exit(1)
    }
    if (!settings?.pageLoadTimeout) {
        console.error("pageLoadTimeout is missing");
        process.exit(1)
    }

    if (!settings?.desktop?.devicePixelRatio) {
        console.error("desktopDevicePixelRatio is missing");
        process.exit(1)
    }
    if (!settings?.desktop?.shotHeight) {
        console.error("desktopShotHeight is missing");
        process.exit(1)
    }
    if (!settings?.desktop?.shotWidth) {
        console.error("desktopShotWidth is missing");
        process.exit(1)
    }
    if (!settings?.desktop?.resizeHeight) {
        console.error("desktopResizeHeight is missing");
        process.exit(1)
    }
    if (!settings?.desktop?.resizeWidth) {
        console.error("desktopResizeWidth is missing");
        process.exit(1)
    }

    if (!settings?.mobile?.devicePixelRatio) {
        console.error("mobileDevicePixelRatio is missing");
        process.exit(1)
    }
    if (!settings?.mobile?.shotHeight) {
        console.error("mobileShotHeight is missing");
        process.exit(1)
    }
    if (!settings?.mobile?.shotWidth) {
        console.error("mobileShotWidth is missing");
        process.exit(1)
    }
    if (!settings?.mobile?.resizeHeight) {
        console.error("mobileResizeHeight is missing");
        process.exit(1)
    }
    if (!settings?.mobile?.resizeWidth) {
        console.error("mobileResizeWidth is missing");
        process.exit(1)
    }

    if (!settings?.locales) {
        console.error("locales are missing");
        process.exit(1)
    }
    if (!settings?.themes) {
        console.error("themes are missing");
        process.exit(1)
    }
}
