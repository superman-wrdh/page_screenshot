const puppeteer = require('puppeteer');
const {v4: uuidv4} = require('uuid');
const path = require('path');

const screenshot = async (request, response) => {
    const body = request.body
    let {url, width, height, fileName} = body

    if (url === '' || url === undefined) {
        url = request.query.url
    }
    if (fileName === '' || fileName === undefined) {
        fileName = request.query.fileName
    }

    if (width === '' || width === undefined) {
        width = request.query.width
    }

    if (height === '' || height === undefined) {
        height = request.query.height
    }
    if (url === '' || url === undefined) {
        response.send("缺少url参数")
        return
    }

    width = width !== undefined ? parseInt(width) : 1920
    height = height !== undefined ? parseInt(height) : 1080
    let uuid = uuidv4().toString().replace(/-/g, "")
    fileName = fileName !== undefined ? fileName : `${uuid}.png`
    await pageScreenshot(url, width, height, fileName)
    response.sendFile(path.join(__dirname, "static", fileName))
}


async function autoScroll(page) {
    return page.evaluate(() => {
        return new Promise((resolve, reject) => {
            //滚动的总高度
            let totalHeight = 0;
            //每次向下滚动的高度 100 px
            const distance = 100;
            const timer = setInterval(() => {
                //页面的高度 包含滚动高度
                let scrollHeight = document.body.scrollHeight;
                //滚动条向下滚动 distance
                window.scrollBy(0, distance);
                totalHeight += distance;
                console.log(`totalHeight:${totalHeight}`)
                //当滚动的总高度 大于 页面高度 说明滚到底了。也就是说到滚动条滚到底时，以上还会继续累加，直到超过页面高度
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        })
    });
}

const pageScreenshot = async (url, width, height, fileName) => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        timeout: 100000,
    });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(url, {waitUntil: 'networkidle0'});
    await page.setViewport({width: width, height});
    await autoScroll(page);
    await page.screenshot({
        path: path.join(__dirname, "static", fileName),
        fullPage: true,
    });
    await page.close();
    await browser.close();
}

module.exports = {
    screenshot,
}
