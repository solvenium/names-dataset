const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const util = require("util");

const writeFileSync = util.promisify(fs.writeFileSync);

async function scrapeNames(appendix, subpage) {
    const resp = await axios.get("https://en.wiktionary.org/wiki/Appendix:" + appendix + (subpage ? "/" + subpage : ""));
    const $ = cheerio.load(resp.data)
    const result = []
    $("div.derivedterms").each((i, elem) => {
        const headerText = $(elem).prev("h1,h2,h3,h4,h5,h6,h7").text();
        if (headerText.startsWith("Affixes") || headerText.startsWith("Prefixes") || headerText.startsWith("Suffixes")) {
            return;
        }
        $(elem).find("dl dd a").each((i, elem) => {
            result.push($(elem).text());
        });        
    });
    return result;
}

(async () => {
    try {
        const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        const groups = ["Female_given_names", "Male_given_names", "Surnames"];
        for (let group of groups) {
            const groupResult = []
            for (let letter of letters) {
                const groupLetterResult = await scrapeNames(group, letter);
                groupResult.push(...groupLetterResult);
                console.log("Processed %d entries from %s/%s", groupLetterResult.length, group, letter);
            }
            writeFileSync("./dataset/" + group + ".txt", groupResult.join("\n"));
        }
    } catch (error) {
        console.log("Error: %s, Stack: %s", error, (error || {}).stack);
    }
})();