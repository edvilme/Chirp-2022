import TwitterTweet from "./tweet.js";
import TwitterUser from "./user.js";
import { TwitterApi } from "twitter-api-v2";
import { collection, getDocs, where, query } from "firebase/firestore";
import firestoreDatabase from "../firebase.js";
import { getTwitterSessionClientById, twitterSessionClientsStore } from "../twitter.js";
import { getUserScore } from "../scores/user-score.js";
import { getTweetScore } from "../scores/tweet-score.js";


export default class TwitterEvent {
    constructor(data){
        this.for_user_id = data.for_user_id;
        if(data.mute_events)
            this.data = new TwitterMuteEventData(data.mute_events[0]);
        if(data.block_events)
            this.data = new TwitterBlockEventData(data.block_events[0]);
        if(data.follow_events)
            this.data = new TwitterFollowEventData(this.for_user_id, data.follow_events[0]);
        if(data.favorite_events)
            this.data = new TwitterFavoriteEventData(this.for_user_id, data.favorite_events[0]);
        if(data.tweet_create_events)
            this.data = new TwitterTweetCreateEventData(this.for_user_id, data.tweet_create_events[0]);
    }

    async executeActions(){
        // Get twitter client
        const twitter = getTwitterSessionClientById(this.for_user_id).client;
        const me = new TwitterUser( 
            (await twitter.v2.me({
                "user.fields": ["created_at", "description", "id", "location", "name", "username", "verified"]
            })).data
        );
        // Get all events from userId that correspond to type
        const q = query(
            collection(firestoreDatabase, "twitter-user-events"), 
            where("userId", "==", this.for_user_id), 
            where("type", "==", this.data.type)
        )
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
            console.log(doc.data())
            const action = new Function('client', 'event', 'me', 'score', doc.data().jsCode);
            action(twitter, this.data, me, {getUserScore, getTweetScore})
        })
    }
}

class TwitterMuteEventData {
    constructor(data){
        if(data.type == "mute") this.type = "mute_event";
        else if(data.type == "unmute") this.type = "unmute_event";
        this.user = new TwitterUser(data.target);
    }
}

class TwitterBlockEventData {
    constructor(data){
        if(data.type == "block") this.type = "block_event";
        else if(data.type == "unblock") this.type = "unblock_event";
        this.user = new TwitterUser(data.target);
    }
}

class TwitterFollowEventData {
    constructor(for_user_id, data){
        if(data.type == "unfollow"){
            this.type = "unfollow_event";
            this.user = new TwitterUser(data.target);
        }
        if(data.type == "follow"){
            // Incoming (target is me)
            if(data.target.id == for_user_id || data.target.id_str == for_user_id){
                this.type = "follow_event_incoming";
                this.user = new TwitterUser(data.source)
            }
            // Outgoing
            else if(data.source.id == for_user_id || data.source.id_str == for_user_id){
                this.type = "follow_event_incoming";
                this.user = new TwitterUser(data.target);
            }
        }
    }
}

class TwitterFavoriteEventData {
    constructor(for_user_id, data){
        // Outgoing 
        if(data.user.id == for_user_id || data.user.id_str == for_user_id){
            this.type = "favorite_event_outgoing"
        }
        // Incoming
        else {
            this.type = "favorite_event_incoming";
            this.user = new TwitterUser(data.user);
        }
        // Tweet
        this.tweet = new TwitterTweet(data.favorited_status)
    }
}

class TwitterTweetCreateEventData {
    constructor(for_user_id, data){
        this.tweet = new TwitterTweet(data);

        // Incoming
        if(this.tweet.author_id != for_user_id){
            this.user = new TwitterUser(data.user);
            // - Incoming replies (vvv)
            if(this.tweet.in_reply_to_user_id_str == for_user_id)
                this.type = "reply_event_incoming";
            // - Incoming retweets (vvvv)
            else if(this.tweet.retweeted_user_id_str == for_user_id)
                this.type = "retweet_event_incoming";
            // - Incoming mentions
            else if(this.tweet.entities.user_mentions.find(e => e.id_str == for_user_id))
                this.type = "mention_event_incoming";
            // - Incoming quotes
            else if(this.tweet.quoted_status_id_str)
                this.type = "quote_event_incoming"
        }
        // Outgoing
            // - Outgoing retweets
            // - Outgoing replies
            // - Outgoing quotes
            // - Outgoing tweets
        else {
            this.type = "tweet_event_outgoing";
        }
    }
}