import TwitterUser from "../models/user.js";
import { getDoc, setDoc, doc } from "firebase/firestore";
import firestoreDatabase from '../firebase.js'

// Utils
Array.intersect = function (a, b) {
    if (a == undefined || b == undefined) return [];
    return [a, b].reduce((_a, _b) => b.filter(Set.prototype.has.bind(new Set(a))));
}
Array.prototype.count = function (item) {
    return this.filter(i => i === item).length;
}

/**
 * @param {TwitterUser} user_i 
 * @param {TwitterUser} user_j 
 */
function followersScore(user_i, user_j) {
    const commonFollowers = Array.intersect(user_i.followers_ids, user_j.followers_ids);
    return commonFollowers.length / (user_i.followers_ids.length + user_j.followers_ids.length - commonFollowers.length);
}

/**
 * @param {TwitterUser} user_i 
 * @param {TwitterUser} user_j 
 */
function followingsScore(user_i, user_j) {
    const commonFollowings = Array.intersect(user_i.following_ids, user_j.following_ids);
    return commonFollowings.length / (user_i.following_ids.length + user_j.following_ids.length - commonFollowings.length);
}

/**
 * @param {TwitterUser} user_i 
 * @param {TwitterUser} user_j 
 */
function mutualMentionsRelation(user_i, user_j) {
    const mentions_i_to_j = user_i.mentions.count(user_j.id),
        mentions_j_to_i = user_j.mentions.count(user_i.i);
    return 0.5 * (mentions_i_to_j / user_i.mentions.length) + 0.5 * (mentions_j_to_i / user_j.mentions.length);
}

/**
 * @param {TwitterUser} user_i 
 * @param {TwitterUser} user_j 
 */
function commonMentionsRelation(user_i, user_j) {
    const commonMentions = Array.intersect(user_i.mentions, user_j.mentions);
    let score = 0;
    for (let mention of new Set(commonMentions)) {
        let count_i = user_i.mentions.count(mention),
            count_j = user_j.mentions.count(mention);
        score += (1 - Math.abs(count_i / user_i.mentions.length - count_j / user_j.mentions.length))
            * ((count_i + count_j) / (user_i.mentions.length + user_j.mentions.length));
    }
    return score;
}

/**
 * @param {TwitterUser} user_i 
 * @param {TwitterUser} user_j 
 */
function mutualRetweetsScore(user_i, user_j) {
    if (user_i.retweets.length == 0 || user_j.retweets.length == 0) return 0;
    const retweets_i_to_j = user_i.retweets?.filter(tweet => tweet?.author_id == user_j.id),
        retweets_j_to_i = user_j.retweets?.filter(tweet => tweet?.author_id == user_i.id);
    return 0.5 * (retweets_i_to_j.length / user_i.retweets.length) + 0.5 * (retweets_j_to_i.length / user_j.retweets.length);
}

/**
 * @param {TwitterUser} user_i 
 * @param {TwitterUser} user_j 
 */
function commonRetweetedUsersScore(user_i, user_j) {
    const commonRetweets = Array.intersect(
        user_i.retweets.map(tweet => tweet?.author_id),
        user_j.retweets.map(tweet => tweet?.author_id)
    );
    let score = 0;
    for (let user of new Set(commonRetweets)) {
        let count_i = user_i.retweets.map(tweet => tweet.author_id).count(user),
            count_j = user_j.retweets.map(tweet => tweet.author_id).count(user);
        score += (1 - Math.abs(count_i / user_i.retweets.length - count_j / user_j.retweets.length))
            * ((count_i + count_j) / (user_i.retweets.length + user_j.retweets.length));
    }
    return score;
}

/**
 * @param {TwitterUser} user_i 
 * @param {TwitterUser} user_j 
 */
function mutualLikesScore(user_i, user_j) {
    const likes_i_to_j = user_i.likes.filter(tweet => tweet.author_id == user_j.id),
        likes_j_to_i = user_j.likes.filter(tweet => tweet.author_id == user_i.id);
    return 0.5 * (likes_i_to_j.length / user_i.likes.length + likes_j_to_i.length / user_j.likes.length)
}

/**
 * @param {TwitterUser} user_i 
 * @param {TwitterUser} user_j 
 */
function commonLikedAuthorsScore(user_i, user_j) {
    const commonLikes = Array.intersect(
        user_i.likes.map(tweet => tweet.author_id),
        user_j.likes.map(tweet => tweet.author_id)
    );
    let score = 0;
    for (let user of new Set(commonLikes)) {
        let count_i = user_i.likes.map(tweet => tweet.author_id).count(user),
            count_j = user_j.likes.map(tweet => tweet.author_id).count(user);
        score += (1 - Math.abs(count_i / user_i.likes.length - count_j / user_j.likes.length))
            * ((count_i + count_j) / (user_i.likes.length + user_j.likes.length));
    }
    return score;
}

/**
 * @param {TwitterUser} user_i 
 * @param {TwitterUser} user_j 
 */
function commonHashtagsScore(user_i, user_j) {
    const commonHashtags = Array.intersect(user_i.hashtags, user_j.hashtags);
    let score = 0;
    for (let hashtag of new Set(commonHashtags)) {
        let count_i = user_i.hashtags.count(hashtag),
            count_j = user_j.hashtags.count(hashtag);
        score += (1 - Math.abs(count_i / user_i.hashtags.length - count_j / user_j.hashtags.length))
            * ((count_i + count_j) / (user_i.hashtags.length + user_j.hashtags.length));
    }
    return score;
}

/**
 * @param {TwitterUser} user_i 
 * @param {TwitterUser} user_j 
 */
export async function getUserScore(client, user_i, user_j) {

    // Firebase doc reference
    const key = [user_i.id, user_j.id].sort().join('-');
    const docReference = doc(firestoreDatabase, `twitter-user-score/${key}`);
    const document = await getDoc(docReference);

    // Get if exists
    if (document.exists() && document.data().rateLimit.reset * 1_000 > new Date())
        return document.data().data;

    await user_i.getAll(client);
    await user_j.getAll(client);

    const data = {
        followers: followersScore(user_i, user_j),
        followings: followingsScore(user_i, user_j),
        mutualMentions: mutualMentionsRelation(user_i, user_j),
        commonMentions: commonMentionsRelation(user_i, user_j),
        mutualRetweets: mutualRetweetsScore(user_i, user_j),
        commonRetweets: commonRetweetedUsersScore(user_i, user_j),
        mutualLikes: mutualLikesScore(user_i, user_j),
        commonLikes: commonLikedAuthorsScore(user_i, user_j),
        commonHashtags: commonHashtagsScore(user_i, user_j),
    }

    // Update
    await setDoc(docReference, {
        data: data,
        rateLimit: {
            reset: new Date().getTime() / 1_000 + 15 * 60
        }
    })

    return data;
}

export async function getWeightedUserScore(currentUserId, score) {
    // Get score 
    // const score = await getUserScore(client, user_i, user_j);
    let weightedScore = 0;
    let weights = {};
    // Get settings
    const documentReference = doc(firestoreDatabase, `twitter-user-settings/${currentUserId}`);
    const document = await getDoc(documentReference);
    if(document.exists()) weights = document.data().userScoreWeights;
    // Calculate
    for (let key in score){
        weightedScore += score[key] * ( weights[key] || 1 );
    }
    score.weightedScore = weightedScore;
    return score;
}