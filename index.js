import express from 'express';
import session from 'express-session';
import 'dotenv/config';
import { twitterAppClient, twitterSessionClient } from './twitter.js';
import TwitterUser from './models/user.js';
import { getUserScore, getWeightedUserScore } from './scores/user-score.js';
import TwitterTweet from './models/tweet.js';
import { getTweetScore, getWeightedTweetScore } from './scores/tweet-score.js';
import { collection, query, where, getDocs, setDoc, doc, getDoc, deleteDoc, addDoc } from "firebase/firestore";
import firestoreDatabase from './firebase.js';
import crypto from "crypto";
import TwitterEvent from './models/event.js';

const app = express();

app.use(
    session({
        secret: "AppTwitter",
        cookie: {maxAge: 2*60_000},
        saveUninitialized: false,
        resave: true,
        rolling: true,
    })
);

app.use(express.json());


const requireAuthentication = async (req, res, next) => {
    if(req.session.user_token == undefined)
        return res.redirect('/api/login');
    const {oauth_token, oauth_token_secret, oauth_verifier} = req.session.user_token;
    if(!oauth_token || !oauth_token_secret || !oauth_verifier)
        return res.redirect('/api/login');
    return next()
}

app.use('/static/', requireAuthentication, express.static('static'));


// https://github.com/twitterdev/account-activity-dashboard/blob/master/helpers/security.js
function get_challenge_response(crc_token, consumer_secret){
    return crypto.createHmac("sha256", consumer_secret).update(crc_token).digest("base64");
}

app.get('/api/isloggedin', async (req, res) => {
    if(req.session.user_token == undefined)
        return res.json({message: "false"});
    const {oauth_token, oauth_token_secret, oauth_verifier} = req.session.user_token;
    if(!oauth_token || !oauth_token_secret || !oauth_verifier)
        return res.json({message: "false"});
    return res.json({message: "true"})
})

app.get('/api/login', async (req, res) => {
    const authUrl = await twitterAppClient.generateAuthLink('https://twitter-plus-plus.herokuapp.com/api/login/callback');
    // store in session
    req.session.user_token = {
        oauth_token_secret: authUrl.oauth_token_secret
    }
    res.redirect(authUrl.url);
})

app.get('/api/logout', async (req, res) => {
    req.session.user_token = {}
    res.json({
        message: "success"
    })
})

app.get('/api/login/callback', (req, res) => {
    const {oauth_token, oauth_verifier} = req.query;
    const {oauth_token_secret} = req.session.user_token;

    req.session.user_token = {oauth_token, oauth_verifier, oauth_token_secret}

    res.json(req.session.user_token)
})

app.get('/api/me', requireAuthentication, async (req, res) => {
    // Twitter
    const twitter = (await twitterSessionClient(req.session.user_token)).client;
    // ME
    const me = (await twitter.currentUserV2()).data;
    res.json({tokens: req.session.user_token, me})
});


app.get('/api/settings', requireAuthentication, async (req, res) => {
    // Twitter
    const twitter = (await twitterSessionClient(req.session.user_token)).client;
    const userId = (await twitter.currentUserV2()).data.id;
    // Get data
    const documentReference = doc(firestoreDatabase, `twitter-user-settings/${userId}`);
    const document = await getDoc(documentReference);
    if(!document.exists()){
        res.status(404);
        return res.json({error: "Not found"});
    }
    return res.json(document.data())
});

app.post('/api/settings', requireAuthentication, async (req, res) => {
    // Twitter
    const twitter = (await twitterSessionClient(req.session.user_token)).client;
    const userId = (await twitter.currentUserV2()).data.id;
    // Get data
    const documentReference = doc(firestoreDatabase, `twitter-user-settings/${userId}`);
    await setDoc(documentReference, req.body);
    return res.json({message: "success"})
})

app.get('/api/score/user/:username', requireAuthentication, async (req, res) => {
    // Twitter
    const twitter = (await twitterSessionClient(req.session.user_token)).client;
    try {
        // Data 
        const me = new TwitterUser( 
            (await twitter.v2.me({
                "user.fields": ["created_at", "description", "id", "location", "name", "username", "verified"]
            })).data
        );
        const user = new TwitterUser( 
            (await twitter.v2.userByUsername(req.params.username, {
                "user.fields": ["created_at", "description", "id", "location", "name", "username", "verified"]
            })).data
        );
        // Objects
        await me.getAll(twitter);
        await user.getAll(twitter);
        // Compare
        const score = await getUserScore(twitter, me, user);
        const weightedScore = await getWeightedUserScore(me.id, score);
        res.json(weightedScore);
    } catch(e){
        console.log(e)
        res.status(404)
        res.json({error: "Error"})
    }
});

app.get('/api/score/tweet/:tweet_id', requireAuthentication, async (req, res) => {
    // Twitter
    const twitter = (await twitterSessionClient(req.session.user_token)).client;
    try {
        // Data
        const me = new TwitterUser( 
            (await twitter.v2.me({
                "user.fields": ["created_at", "description", "id", "location", "name", "username", "verified"]
            })).data
        );
        const tweet = new TwitterTweet(
            (await twitter.v2.singleTweet(req.params.tweet_id, {
                "tweet.fields": ["id", "author_id", "created_at", "context_annotations", "entities", "possibly_sensitive", "public_metrics", "referenced_tweets", "text"]
            })).data
        );
        // Get data
        await me.getAll(twitter);
        // Get score
        //const score = await getTweetScore(twitter, me, tweet);
        const score = await getWeightedTweetScore(twitter, me.id, me, tweet);
        res.json(score);
    } catch(e){
        res.status(404);
        res.json({error: "Error"});
    }
});

app.get('/api/shortcuts', requireAuthentication, async (req, res) => {
    const data = [];
    // Twitter
    const twitter = (await twitterSessionClient(req.session.user_token)).client;
    const user = (await twitter.currentUserV2()).data;
    // Get all from firebase
    const q = query( collection(firestoreDatabase, "twitter-user-events"), where("userId", "==", user.id) );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
        data.push({
            id: doc.id, 
            ...doc.data()
        });
    })
    return res.json(data);
})

app.get('/api/shortcuts/:id', requireAuthentication, async (req, res) => {
    const twitter = (await twitterSessionClient(req.session.user_token)).client;
    const user = (await twitter.currentUserV2()).data;
    // Get
    console.log("Made it this far")
    const documentReference = doc(firestoreDatabase, `twitter-user-events/${req.params.id}`);
    const document = await getDoc(documentReference);
    if(!document.exists()){
        res.status(404);
        return res.json({error: "Not found"});
    }
    if(document.data().userId != user.id){
        res.status(401);
        return res.json({error: "Unauthorized"})
    }
    res.json(document.data())
})


app.post('/api/shortcuts', requireAuthentication, async (req, res) => {
    // Twitter
    const twitter = (await twitterSessionClient(req.session.user_token)).client;
    const user = (await twitter.currentUserV2()).data;
    const {blocklyXml, type, jsCode} = req.body;
    // Create document
    const doc = await addDoc( collection(firestoreDatabase, "twitter-user-events"), {
        blocklyXml, type, jsCode, 
        userId: user.id
    } );
    res.json({message: "Success", doc: doc.id})
})


app.post('/api/shortcuts/:id', requireAuthentication, async (req, res) => {
    // Twitter
    const twitter = (await twitterSessionClient(req.session.user_token)).client;
    const user = (await twitter.currentUserV2()).data;
    const {blocklyXml, type, jsCode} = req.body;
    // Get doc
    const documentReference = doc(firestoreDatabase, `twitter-user-events/${req.params.id}`);
    const document = await getDoc(documentReference);
    if(!document.exists()){
        res.status(404);
        return res.json({error: "Not found"});
    }
    if(document.data().userId != user.id){
        res.status(401);
        return res.json({error: "Unauthorized"})
    }
    // Update
    await setDoc(documentReference, {
        blocklyXml, type, jsCode, 
        userId: user.id
    });
    res.json({message: "Success"})
})

app.post('/api/shortcuts/:id/delete', requireAuthentication, async (req, res) => {
    // Twitter
    const twitter = (await twitterSessionClient(req.session.user_token)).client;
    const user = (await twitter.currentUserV2()).data;
    // Get doc
    const documentReference = doc(firestoreDatabase, `twitter-user-events/${req.params.id}`);
    const document = await getDoc(documentReference);
    if(!document.exists()){
        res.status(404);
        return res.json({error: "Not found"});
    }
    if(document.data().userId != user.id){
        res.status(401);
        return res.json({error: "Unauthorized"})
    }
    // Update
    await deleteDoc(documentReference);
    res.json({message: "Success"})
})


app.get('/api/subscriptions/list', async (req, res) => {
    const data = await twitterAppClient.getActivityWebhooksSubscriptions();
    res.json(data);
})

app.get('/api/subscriptions/subscribe', requireAuthentication, async (req, res) => {
    // TODO: If already exists
    const twitter = (await twitterSessionClient(req.session.user_token)).client;
    await twitter.subscribeToActivityWebhook();
    res.json({message: "success"});
})

app.get('/api/subscriptions/unsubscribe', requireAuthentication, async (req, res) => {
    // TODO: If doesn't exist
    const twitter = (await twitterSessionClient(req.session.user_token)).client;
    await twitter.unsubscribeFromActivityWebhook();
    res.json({message: "success"});
})

app.get('/api/subscriptions/callback', (req, res) => {
    const crc_token = req.query.crc_token;
    if(crc_token){
        const hash = get_challenge_response(crc_token, process.env.TWITTER_APP_SECRET);
        res.status(200);
        res.send({
            response_token: `sha256=${hash}`
        })
    } else {
        res.status(400);
        res.send("Error: crc_token missing from request");
    }
})

app.post('/api/subscriptions/callback', (req, res) => {
    req.on('data', async data => {
        /*console.dir(JSON.parse(data), {depth: null})*/
        const event = new TwitterEvent(JSON.parse(data));
        console.log(event)
        await event.executeActions();
    })
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Go here to login: http://127.0.0.1:3000/login`);
  });