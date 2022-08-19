import { doc, getDoc } from "firebase/firestore";
import { TwitterApi } from "twitter-api-v2";
import firestoreDatabase from "../firebase.js";
import TwitterTweet from "../models/tweet.js";
import TwitterUser from "../models/user.js";
import { getDomainsFromUrls, pageRankScore, threatsScore } from "./url-score.js";
import { getUserScore, getWeightedUserScore } from "./user-score.js";

Array.intersect = function(a, b){
    if(a == undefined || b == undefined) return [];
    return [a, b].reduce((_a, _b) => b.filter( Set.prototype.has.bind(new Set(a)) ));
}
Array.prototype.count = function(item){
    return this.filter( i => i === item ).length;
}

/**
 * @param {TwitterUser} user 
 * @param {import("twitter-api-v2").TweetV2} tweet 
 */
function tweetCommonHashtagsScore(user, tweet){
    const userHashtags =  [...new Set(user.hashtags)];
    const tweetHashtags = [...new Set(tweet.entities?.hashtags?.map(hashtag => hashtag.tag))];
    return Array.intersect(userHashtags, tweetHashtags).length / userHashtags.length;
}

/**
 * @param {TwitterUser} user 
 * @param {import("twitter-api-v2").TweetV2} tweet 
 */
function tweetCommonMentionsScore(user, tweet){
    const userMentions = [...new Set(user.mentions)];
    const tweetMentions = [...new Set(tweet.entities?.mentions?.map(entity => entity.id))]
    return Array.intersect(userMentions, tweetMentions).length / userMentions.length
}

/**
 * @param {TwitterUser} user 
 * @param {import("twitter-api-v2").TweetV2} tweet 
 */
function tweetCommonUrlsScore(user, tweet){
    const userDomains = [...new Set(getDomainsFromUrls( user.urls ))];
    const tweetDomains = [...new Set(getDomainsFromUrls(
        tweet.entities?.urls?.map(url => url.unwound_url || url.expanded_url) || []
    ))];
    const commonDomains = Array.intersect(userDomains, tweetDomains);
    return commonDomains.length / userDomains.length;
}

/**
 * @param {TwitterUser} user 
 * @param {import("twitter-api-v2").TweetV2} tweet 
 */
function tweetCommonTopicDomainsScore(user, tweet){
    const tweetTopicDomainsIds = tweet.context_annotations?.map(annotation => `${annotation.domain.id}.${annotation.entity.id}`) || [];
    let score = 0;
    for (let topicDomainId of tweetTopicDomainsIds){
        score += (user.topics.find(topic => topic.id == topicDomainId)?.weight || 0)
    }
    return score;
}

/**
 * @param {import("twitter-api-v2").TweetV2} tweet 
 */
async function tweetUrlsPageRankScore(tweet){
    const urls = tweet.entities?.urls
        ?.map(url => url.unwound_url || url.expanded_url);
    return await pageRankScore(urls);
}

/**
 * @param {import("twitter-api-v2").TweetV2} tweet 
 */
async function tweetUrlsNoThreatsScore(tweet){
    const urls = tweet.entities?.urls
        ?.map(url => url.expanded_url);
    return await threatsScore(urls);
}


/**
 * @param {TwitterApi} client 
 * @param {TwitterUser} user 
 * @param {TwitterTweet} tweet 
 */
export async function getTweetScore(client, user, tweet){
    const author = new TwitterUser({id: tweet.author_id});
    await author.getAll(client);
    const score = {
        authorRelation: await getUserScore(client, user, author), 
        commonHashtags: tweetCommonHashtagsScore(user, tweet), 
        commonMentions: tweetCommonMentionsScore(user, tweet), 
        commonUrls: tweetCommonUrlsScore(user, tweet), 
        commonTopics: tweetCommonTopicDomainsScore(user, tweet), 
        urlPageRank: await tweetUrlsPageRankScore(tweet), 
        urlNoThreats: await tweetUrlsNoThreatsScore(tweet)
    }
    return score;
}

export async function getWeightedTweetScore(client, currentUserId, user, tweet){
    try{
        // Get score
        const score = await getTweetScore(client, user, tweet);
        // Get weighted score for user
        score.authorRelation = await getWeightedUserScore(currentUserId, score.authorRelation);
        let weightedScore = 0;
        let weights = {}
        // Get settings
        const documentReference = doc(firestoreDatabase, `twitter-user-settings/${currentUserId}`);
        const document = await getDoc(documentReference);
        if(document.exists()) weights = document.data().tweetScoreWeights;
        // Calculate
        for (let key in score){
            if(key == "authorRelation"){
                weightedScore += score.authorRelation.weightedScore * (weights.author || 1);
            } else {
                weightedScore += score[key] * ( weights[key] || 1 )
            }
        }
        score.weightedScore = weightedScore;
        return score;
    } catch(e){
        console.log(e)
    }
}