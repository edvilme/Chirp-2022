import { TwitterApiCachePluginCore } from '@twitter-api-v2/plugin-cache-core';
import { getDoc, setDoc, doc } from 'firebase/firestore';
import { TwitterApi } from 'twitter-api-v2';
import firestoreDatabase from './firebase.js';
import 'dotenv/config'

// Extend twitter client with firebase support
class TwitterFirestoreCache extends TwitterApiCachePluginCore {
    constructor(){
        super();
    }
    async hasKey(key){
        const documentReference = doc(firestoreDatabase, `twitter/${key}`);
        const document = await getDoc(documentReference);
        const exists = document.exists() && document.data().rateLimit.reset*1_000 > new Date();
        return exists;
    }
    async getKey(key){
        const documentReference = doc(firestoreDatabase, `twitter/${key}`);
        const document = await getDoc(documentReference);
        return document.data();
    }
    async setKey(key, response){
        const documentReference = doc(firestoreDatabase, `twitter/${key}`);
        setDoc(documentReference, response);
    }
}

// Hacks and extensions
// https://github.com/HitomaruKonpaku/twspace-crawler/blob/04de568e8145e240b2e5c33721831639fbd5c9cc/src/apis/TwitterApi.ts
TwitterApi.prototype.getGuestToken = async function(){
    const res = await this.post(`https://api.twitter.com/1.1/guest/activate.json`);
    return res.guest_token;
}

// https://github.com/anvaka/twitter-recommended-graph/blob/bdc2f98dff3cf5e12d5d0aa6fb1c8a4f757592b3/buildGraph.js
/**
 * @returns {Promise<import("twitter-api-v2").UserV1>}
 */
TwitterApi.prototype.getRelatedUsers = async function(user_id){
    const res = await this.get(`https://twitter.com/i/api/1.1/users/recommendations.json`, {user_id}, {
        headers: {
            'x-guest-token': await this.getGuestToken()
        }
    });
    return res.map(({user, user_id}) => user);
}

TwitterApi.prototype.getActivityWebhooks = async function () {
    return await this.get(`https://api.twitter.com/1.1/account_activity/all/webhooks.json`);
}
TwitterApi.prototype.registerActivityWebhook = async function (url) {
    return await this.post(`https://api.twitter.com/1.1/account_activity/all/chirp2022/webhooks.json?url=${url}`);
}
TwitterApi.prototype.deleteActivityWebhook = async function (id) {
    return await this.delete(`https://api.twitter.com/1.1/account_activity/all/chirp2022/webhooks/${id}.json`);
}
TwitterApi.prototype.subscribeToActivityWebhook = async function () {
    return await this.post(`https://api.twitter.com/1.1/account_activity/all/chirp2022/subscriptions.json`)
}
TwitterApi.prototype.unsubscribeFromActivityWebhook = async function () {
    const id = (await this.currentUserV2()).data.id;
    return await this.delete(`https://api.twitter.com/1.1/account_activity/all/chirp2022/subscriptions/${id}.json`);
}
TwitterApi.prototype.getActivityWebhooksSubscriptions = async function () {
    return await this.get(`https://api.twitter.com/1.1/account_activity/all/chirp2022/subscriptions/list.json`)
}

// Twitter clients
export const twitterAppClient = new TwitterApi({
    appKey: process.env.TWITTER_APP_KEY,
    appSecret: process.env.TWITTER_APP_SECRET,
    accessToken: process.env.TWITTER_APP_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_APP_ACCESS_SECRET
});
export const twitterGuestClient = new TwitterApi(process.env.PUBLIC_BEARER_TOKEN);

/**@type {Map<String, import('twitter-api-v2').LoginResult>} */
export const twitterSessionClientsStore = {}

/**
 * @returns {Promise<import('twitter-api-v2').LoginResult>}
 */
export const twitterSessionClient = async ({oauth_token, oauth_token_secret, oauth_verifier}) => {
    if(twitterSessionClientsStore[oauth_token])
        return twitterSessionClientsStore[oauth_token];
        const client = new TwitterApi({
            appKey: process.env.TWITTER_APP_KEY,
            appSecret: process.env.TWITTER_APP_SECRET,
            accessToken: oauth_token, 
            accessSecret: oauth_token_secret
        }, { 
            plugins: [ 
                new TwitterFirestoreCache() 
            ] 
        });
        const sessionClient = await client.login(oauth_verifier);
        twitterSessionClientsStore[oauth_token] = sessionClient;
        return sessionClient;
}

/**@returns {import('twitter-api-v2').LoginResult} */
export const getTwitterSessionClientById = userId => {
    return Object.values(twitterSessionClientsStore)
        .find(o => o.userId == userId)
}