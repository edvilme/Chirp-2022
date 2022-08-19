/******************+
 * TWEETS
 *******************/

Blockly.Blocks['tweet_create_new'] = {
    init: function(){
        this.jsonInit({
            message0: "Post tweet: %1", 
            args0: [
                {
                    type: "input_value",
                    name: "text",
                    check: "String"
                }
            ], 
            previousStatement: "Action",
            nextStatement: "Action"
        })
    }
}
Blockly.JavaScript['tweet_create_new'] = function(block){
    const text = Blockly.JavaScript.valueToCode(block, 'text', Blockly.JavaScript.ORDER_NONE);
    return `await event.tweet?.createNew(client, ${text})`;
}

Blockly.Blocks['tweet_possibly_sensitive'] = {
    init: function(){
        this.jsonInit({
            message0: "Is tweet possibly sensitive?",
            output: "Boolean"
        })
    }
}
Blockly.JavaScript['tweet_possibly_sensitive'] = function(block){
    return ['event.tweet?.possibly_sensitive', Blockly.JavaScript.ORDER_FUNCTION_CALL];
}

Blockly.Blocks['tweet_text'] = {
    init: function(){
        this.jsonInit({
            message0: "Tweet text",
            output: "String"
        })
    }
}
Blockly.JavaScript['tweet_text'] = function(block){
    return ['event.tweet?.text', Blockly.JavaScript.ORDER_FUNCTION_CALL];
}

Blockly.Blocks['tweet_urls'] = {
    init: function(){
        this.jsonInit({
            message0: "Tweet urls", 
            output: "Array"
        })
    }
}
Blockly.JavaScript['tweet_urls'] = function(block){
    return ['event.tweet?.urls', Blockly.JavaScript.ORDER_FUNCTION_CALL];
}

Blockly.Blocks['tweet_hashtags'] = {
    init: function(){
        this.jsonInit({
            message0: "Tweet hashtags", 
            output: "Array"
        })
    }
}
Blockly.JavaScript['tweet_hashtags'] = function(block){
    return ['event.tweet?.hashtags', Blockly.JavaScript.ORDER_FUNCTION_CALL];
}

Blockly.Blocks['tweet_mentions'] = {
    init: function(){
        this.jsonInit({
            message0: "Tweet mentions", 
            output: "Array"
        })
    }
}
Blockly.JavaScript['tweet_mentions'] = function(block){
    return ['event.tweet?.mentions', Blockly.JavaScript.ORDER_FUNCTION_CALL];
}

Blockly.Blocks['tweet_reply'] = {
    init: function(){
        this.jsonInit({
            message0: "Reply to tweet: %1", 
            args0: [
                {
                    type: "input_value",
                    name: "text",
                    check: "String"
                }
            ], 
            previousStatement: "Action",
            nextStatement: "Action"
        })
    }
}
Blockly.JavaScript['tweet_reply'] = function(block){
    const text = Blockly.JavaScript.valueToCode(block, 'text', Blockly.JavaScript.ORDER_NONE);
    return `await event.tweet?.reply(client, ${text})`;
}

Blockly.Blocks['tweet_retweet'] = {
    init: function(){
        this.jsonInit({
            message0: "Retweet", 
            previousStatement: "Action", 
            nextStatement: "Action"
        })
    }
}
Blockly.JavaScript['tweet_retweet'] = function(block){
    return 'await event.tweet?.retweet()';
}

Blockly.Blocks['tweet_quote'] = {
    init: function(){
        this.jsonInit({
            message0: "Quote tweet: %1", 
            args0: [
                {
                    type: "input_value",
                    name: "text",
                    check: "String"
                }
            ], 
            previousStatement: "Action",
            nextStatement: "Action"
        })
    }
}
Blockly.JavaScript['tweet_code'] = function(block){
    const text = Blockly.JavaScript.valueToCode(block, 'text', Blockly.JavaScript.ORDER_NONE);
    return `await event.tweet?.quote(client, ${text})`;
}

Blockly.Blocks['tweet_like'] = {
    init: function(){
        this.jsonInit({
            message0: "Like tweet", 
            previousStatement: "Action", 
            nextStatement: "Action"
        })
    }
}
Blockly.JavaScript['tweet_like'] = function(block){
    return 'await event.tweet?.like()';
}

Blockly.Blocks['tweet_unlike'] = {
    init: function(){
        this.jsonInit({
            message0: "Unlike tweet", 
            previousStatement: "Action", 
            nextStatement: "Action"
        })
    }
}
Blockly.JavaScript['tweet_unlike'] = function(block){
    return 'await event.tweet?.unlike()';
}

/*****************
 * USERS
 *****************/

Blockly.Blocks['user_name'] = {
    init: function(){
        this.jsonInit({
            message0: "User name", 
            output: "String"
        })
    }
}
Blockly.JavaScript['user_name'] = function(block){
    return ['event.user?.name', Blockly.JavaScript.ORDER_FUNCTION_CALL]
}

Blockly.Blocks['user_username'] = {
    init: function(){
        this.jsonInit({
            message0: "User username", 
            output: "String"
        })
    }
}
Blockly.JavaScript['user_username'] = function(block){
    return ['event.user?.username', Blockly.JavaScript.ORDER_FUNCTION_CALL]
}

Blockly.Blocks['user_description'] = {
    init: function(){
        this.jsonInit({
            message0: "User description", 
            output: "String"
        })
    }
}
Blockly.JavaScript['user_description'] = function(block){
    return ['event.user?.description', Blockly.JavaScript.ORDER_FUNCTION_CALL]
}

Blockly.Blocks['user_verified'] = {
    init: function(){
        this.jsonInit({
            message0: "Is user verified?",
            output: "Boolean"
        })
    }
}
Blockly.JavaScript['user_verified'] = function(block){
    return ['event.user?.verified', Blockly.JavaScript.ORDER_FUNCTION_CALL]
}

Blockly.Blocks['user_hashtags'] = {
    init: function(){
        this.jsonInit({
            message0: "User hashtags", 
            output: "Array"
        })
    }
}
Blockly.JavaScript['user_hashtags'] = function(block){
    return ['event.user?.hashtags', Blockly.JavaScript.ORDER_FUNCTION_CALL]
}

Blockly.Blocks['user_mentions'] = {
    init: function(){
        this.jsonInit({
            message0: "User mentions", 
            output: "Array"
        })
    }
}
Blockly.JavaScript['user_mentions'] = function(block){
    return ['event.user?.mentions', Blockly.JavaScript.ORDER_FUNCTION_CALL]
}

Blockly.Blocks['user_urls'] = {
    init: function(){
        this.jsonInit({
            message0: "User urls", 
            output: "Array"
        })
    }
}
Blockly.JavaScript['user_urls'] = function(block){
    return ['event.user?.urls', Blockly.JavaScript.ORDER_FUNCTION_CALL]
}

Blockly.Blocks['user_follow'] = {
    init: function(){
        this.jsonInit({
            message0: "Follow user", 
            previousStatement: "Action", 
            nextStatement: "Action"
        })
    }
}
Blockly.JavaScript['user_follow'] = function(block){
    return 'await event.user?.follow(client)'
}

Blockly.Blocks['user_unfollow'] = {
    init: function(){
        this.jsonInit({
            message0: "Unfollow user", 
            previousStatement: "Action", 
            nextStatement: "Action"
        })
    }
}
Blockly.JavaScript['user_unfollow'] = function(block){
    return 'await event.user?.unfollow(client)'
}

Blockly.Blocks['user_mute'] = {
    init: function(){
        this.jsonInit({
            message0: "Mute user", 
            previousStatement: "Action", 
            nextStatement: "Action"
        })
    }
}
Blockly.JavaScript['user_mute'] = function(block){
    return 'await event.user?.mute(client)'
}

Blockly.Blocks['user_unmute'] = {
    init: function(){
        this.jsonInit({
            message0: "Unmute user", 
            previousStatement: "Action", 
            nextStatement: "Action"
        })
    }
}
Blockly.JavaScript['user_unmute'] = function(block){
    return 'await event.user?.unmute(client)'
}

Blockly.Blocks['user_block'] = {
    init: function(){
        this.jsonInit({
            message0: "Block user", 
            previousStatement: "Action", 
            nextStatement: "Action"
        })
    }
}
Blockly.JavaScript['user_block'] = function(block){
    return 'await event.user?.block(client)'
}

Blockly.Blocks['user_unblock'] = {
    init: function(){
        this.jsonInit({
            message0: "Unblock user", 
            previousStatement: "Action", 
            nextStatement: "Action"
        })
    }
}
Blockly.JavaScript['user_unblock'] = function(block){
    return 'await event.user?.block(client)'
}