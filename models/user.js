import TwitterTweet from "./tweet.js";
import { TwitterApi } from "twitter-api-v2";

export default class TwitterUser {
    constructor(/**@type {import("twitter-api-v2").UserV1|import("twitter-api-v2").UserV2} */data) {
        this.id = data.id;
        this.name = data.name || ""; // b, added
        this.usernmae = data.username || data.screen_name || ""; // b, added
        this.profile_image_url = data.profile_image_url || "";
        this.profile_banner_url = data.profile_banner_url || "";
        this.description = data.description || ""; // b, added
        this.verified = data.verified || ""; // b, added
        this.public_metrics = data.public_metrics || { followers_count: data.followers_count, following_count: data.friends_count };

        /**@type {Array<String>} */ this.following_ids = [];
        /**@type {Array<String>} */ this.followers_ids = [];
        /**@type {Array<TwitterTweet>} */ this.tweets = [];
        /**@type {Array<TwitterTweet>} */ this.likes = [];
    }

    get hashtags(){ //b, added
        return this.tweets.map(tweet => tweet.hashtags).flat();
    }
    get mentions(){ //b, added
        return this.tweets.map(tweet => tweet.mentions).flat();
    }
    get urls(){ //b, added
        return this.tweets.map(tweet => tweet.urls).flat();
    }
    get retweets(){
        return this.tweets.filter(tweet => 
            tweet.referenced_tweets?.some(t => t.type == 'retweeted' || t.type == 'quoted')
        )
    }
    get topics(){
        const topics = {}
        const annotations = this.tweets
            .filter(tweet => tweet.context_annotations?.length > 0)
            .map(tweet => tweet.context_annotations)
            .flat();
        annotations.forEach(annotation => {
            const id = `${annotation.domain.id}.${annotation.entity.id}`;
            topics[id] ??= {id, domain: annotation.domain.name, entity: annotation.entity.name, weight: 0}
            topics[id].weight += 1 / annotations.length;
        });
        return Object.values(topics);
    }

    async getAll(client){
        await this.getTweets(client);
        await this.getLikes(client);
        await this.getFollowerIds(client);
        await this.getFollowingIds(client);
    }

    async getFollowerIds(/**@type {TwitterApi}*/ client) {
        const request = await client.v2.followers(this.id, {
            max_results: 1_000,
            asPaginator: true
        });
        for await (const user of request) {
            this.followers_ids.push(user.id);
            if (this.followers_ids.length > 100_000) break;
        }
    }
    async getFollowingIds(/**@type {TwitterApi}*/ client) {
        const request = await client.v2.following(this.id, {
            max_results: 1_000,
            asPaginator: true
        });
        for await (const user of request) {
            this.following_ids.push(user.id);
            if (this.following_ids.length > 100_000) break;
        }
    }
    async getTweets(/**@type {TwitterApi}*/ client) {
        const request = await client.v2.userTimeline(this.id, {
            max_results: 100,
            "tweet.fields": ["created_at", "author_id", "context_annotations", "text", "entities", "referenced_tweets"]
        });
        for await (const tweet of request) {
            this.tweets.push(
                new TwitterTweet(tweet)
            )
            if(this.tweets.length > 1_000) break;
        }
    }
    async getLikes(/**@type {TwitterApi}*/ client){
        const request = await client.v2.userLikedTweets(this.id, {
            max_results: 100, 
            "tweet.fields": ["created_at", "author_id", "context_annotations", "text", "entities", "referenced_tweets"]

        });
        for await (const tweet of request) {
            this.likes.push(
                new TwitterTweet(tweet)
            )
            if(this.likes.length > 500) break;
        }
    }

    async follow(/**@type {TwitterApi}*/ client){
        const userId = (await client.currentUserV2()).data.id;
        await client.v2.follow(userId, this.id)
    }
    async unfollow(/**@type {TwitterApi}*/ client){
        const userId = (await client.currentUserV2()).data.id;
        await client.v2.unfollow(userId, this.id)
    }
    async mute(/**@type {TwitterApi}*/ client){
        const userId = (await client.currentUserV2()).data.id;
        await client.v2.mute(userId, this.id)
    }
    async unmute(/**@type {TwitterApi}*/ client){
        const userId = (await client.currentUserV2()).data.id;
        await client.v2.unmute(userId, this.id)
    }
    async block(/**@type {TwitterApi}*/ client){
        const userId = (await client.currentUserV2()).data.id;
        await client.v2.block(userId, this.id)
    }
    async unblock(/**@type {TwitterApi}*/ client){
        const userId = (await client.currentUserV2()).data.id;
        await client.v2.unblock(userId, this.id)
    }

}