import { TwitterApi } from "twitter-api-v2";

export default class TwitterTweet {
    // Blockly added
    static async createNew(/**@type {TwitterApi}*/ client, text){
        const tweet = await client.v2.tweet(text);
    }

    constructor(/**@type {import("twitter-api-v2").TweetV2|import("twitter-api-v2").TweetV1} */ data){
        this.id = data.id_str || data.id; // b
        this.author_id = data.author_id || data.user.id_str; // b
        this.created_at = data.created_at; // b
        this.context_annotations = data.context_annotations; // b
        this.entities = data.entities; // b
        this.public_metrics = data.public_metrics; // b, pending
        this.possibly_sensitive = data.possibly_sensitive; // b, added
        /**@type {Array<ReferencedTweetV2>} */
        this.referenced_tweets = data.referenced_tweets; //b
        this.text = data.extended_tweet?.full_text || data.text; // b, added

        this.in_reply_to_user_id_str = data.in_reply_to_user_id_str;
        this.quoted_status_id_str = data.quoted_status_id_str;
        this.retweeted_status_id_str = data.retweeted_status?.id_str;
        this.retweeted_user_id_str = data.retweeted_status?.user.id_str;
    }
    // b, added
    get urls(){
        return this.entities?.urls?.map(url => url.expanded_url) || [];
    }
    // b, added
    get hashtags(){
        return this.entities?.hashtags?.map(hashtag => hashtag.tag) || [];
    }
    // b, added
    get mentions(){
        return this.entities?.mentions?.map(mention => mention.id) || [];
    }
    // b, added
    async reply(/**@type {TwitterApi}*/ client, text){
        const tweet = await client.v2.reply(text, this.id);
    }
    // b, added
    async retweet(/**@type {TwitterApi}*/ client){
        const userId = (await client.currentUserV2()).data.id
        const tweet = await client.v2.retweet(userId, this.id);
    }
    async quote(/**@type {TwitterApi}*/ client, text){
        const tweet = await client.v2.quote(text, this.id);
    }
    async like(/**@type {TwitterApi}*/ client){
        const userId = (await client.currentUserV2()).data.id
        await client.v2.like(userId, this.id);
    }
    async unlike(/**@type {TwitterApi}*/ client){
        const userId = (await client.currentUserV2()).data.id
        await client.v2.unlike(userId, this.id);
    }

}