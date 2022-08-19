/**
 * @author Eduardo Villalpando Mello
 * @date 2022-07-11
 * 
 * This script uses Google's Safe Browsing API to determine the threats of a specific URL
 * https://developers.google.com/safe-browsing/v4/
 * 
 * Malicious sites can be reported here: https://safebrowsing.google.com/safebrowsing/report_phish/?hl=es
 */

/**
 * @param {Array<string>} urls 
 * @returns {Array<string>}
 */
 export function getDomainsFromUrls(urls){
    return urls.map(url => new URL(url).hostname )
}

/**
 * @param {Array<string>} urls 
 */
export async function threatsScore(urls){
    if(urls == undefined || urls.length == 0) return 1;
    const API_KEY = "AIzaSyAp-fewDzP7ttxq7uQPwjdUVgAsI5AlriA";
    const req = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`, {
        method: 'POST', 
        body: JSON.stringify({
            threatEntries: ["MALWARE", "SOCIAL_ENGINEERING"], 
            platformTypes: ["ALL_PLATFORMS"], 
            threatEntryTypes: ["URL"], 
            threatEntries: urls.map(url => ({url}))
        })
    });
    const res = await req.json();
    return (urls.length - (res.matches?.length || 0)) / urls.length;
}

/**
 * @param {Array<string>} urls 
 */
export async function pageRankScore(urls){
    if(urls == undefined || urls.length == 0) return 0;
    const API_KEY = "ookwkc4go4w8sw808ggc8ggsgko888g4wswcwsoo";
    // Get domains as domain[i]=XXXX
    const domains = getDomainsFromUrls(urls)
        .reduce((accum, item, index) => {
            accum[`domains[${index}]`] = item;
            return accum;
        }, {});
    const req = await fetch(`https://openpagerank.com/api/v1.0/getPageRank?${new URLSearchParams(domains)}`, {
        headers: {'API-OPR': API_KEY},
    });
    const res = await req.json();
    // Get avg
    return res.response
        .reduce((accum, item) => accum+=item.page_rank_decimal/10, 0) / res.response.length;
}
