import { TwitterApi } from "twitter-api-v2";

class Message {
    static async createNew(/**@type {TwitterApi}*/ client, {recipient_id, text}){
        await client.v1.sendDm({
            recipient_id, 
            text
        })
    }
    
    constructor(data){  
        this.author_id = data.author_id;
        this.recipient_id = data.recipient_id;
        this.text = data.text;
    }
}