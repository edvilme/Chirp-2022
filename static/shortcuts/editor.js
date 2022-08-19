import '/static/shortcuts/blocks.js';

const toolbox = {
    kind: "categoryToolbox",
    contents: [
        {
            kind: "category",
            name: "Logic",
            contents: [
                {
                    kind: "block",
                    type: "logic_boolean"
                },
                {
                    kind: "block",
                    type: "logic_compare"
                },
                {
                    kind: "block",
                    type: "logic_operation"
                },
                {
                    kind: "sep",
                    gap: 60
                },
                {
                    kind: "block",
                    type: "controls_if"
                },
                {
                    kind: "block",
                    type: "controls_repeat"
                },
                {
                    kind: "block",
                    type: "controls_forEach"
                }
            ]
        },
        {
            kind: "category",
            name: "Text",
            contents: [
                {
                    kind: "block",
                    type: "text"
                },
                {
                    kind: "block",
                    type: "text_join"
                },
                {
                    kind: "sep",
                    gap: 60
                },
                {
                    kind: "block",
                    type: "text_indexOf"
                },
                {
                    kind: "sep",
                    gap: 30
                },
                {
                    kind: "block",
                    type: "text_replace"
                },
                {
                    kind: "block",
                    type: "text_changeCase"
                }
            ]
        },
        {
            kind: "category",
            name: "Numbers",
            contents: [
                {
                    kind: "block",
                    type: "math_number"
                },
                {
                    kind: "block",
                    type: "math_random_int"
                },
                {
                    kind: "sep",
                    gap: 60
                },
                {
                    kind: "block",
                    type: "math_arithmetic"
                }
            ]
        },
        {
            kind: "category",
            name: "Lists",
            contents: [
                {
                    kind: "block",
                    type: "lists_length"
                },
                {
                    kind: "block",
                    type: "lists_indexOf"
                }
            ]
        },
        {
            "kind": "category",
            "name": "Variables",
            "custom": "VARIABLE"
        },
        {
            kind: "sep"
        },
        {
            kind: "category",
            name: "User",
            contents: [
                {
                    kind: "category",
                    name: "Interact",
                    contents: [
                        {
                            kind: 'block',
                            type: 'user_follow'
                        },
                        {
                            kind: 'block',
                            type: 'user_unfollow'
                        },
                        {
                            kind: "sep",
                            gap: 60
                        },
                        {
                            kind: 'block',
                            type: 'user_mute'
                        },
                        {
                            kind: 'block',
                            type: 'user_unmute'
                        },
                        {
                            kind: "sep",
                            gap: 60
                        },
                        {
                            kind: 'block',
                            type: 'user_block'
                        },
                        {
                            kind: 'block',
                            type: 'user_unblock'
                        }
                    ]
                },
                {
                    kind: "category",
                    name: "Get info",
                    contents: [
                        {
                            kind: 'block',
                            type: 'user_name'
                        },
                        {
                            kind: 'block',
                            type: 'user_username'
                        },
                        {
                            kind: 'block',
                            type: 'user_description'
                        },
                        {
                            kind: 'block',
                            type: 'user_verified'
                        },
                        {
                            kind: "sep",
                            gap: 60
                        },
                        {
                            kind: 'block',
                            type: 'user_hashtags'
                        },
                        {
                            kind: 'block',
                            type: 'user_mentions'
                        },
                        {
                            kind: 'block',
                            type: 'user_urls'
                        }
                    ]
                }
            ]
        },
        {
            kind: "category",
            name: "Tweet",
            contents: [
                {
                    kind: "category",
                    name: "Create",
                    contents: [
                        {
                            kind: 'block',
                            type: 'tweet_create_new'
                        },
                        {
                            kind: 'block',
                            type: 'tweet_reply'
                        },
                        {
                            kind: 'block',
                            type: 'tweet_retweet'
                        },
                        {
                            kind: 'block',
                            type: 'tweet_quote'
                        },
                    ]
                },
                {
                    kind: "category",
                    name: "Interact",
                    contents: [
                        {
                            kind: 'block',
                            type: 'tweet_like'
                        },
                        {
                            kind: 'block',
                            type: 'tweet_unlike'
                        },
                        {
                            kind: 'block',
                            type: 'tweet_retweet'
                        },
                    ]
                },
                {
                    kind: "category",
                    name: "Get info",
                    contents: [
                        {
                            kind: 'block',
                            type: 'tweet_possibly_sensitive'
                        },
                        {
                            kind: 'block',
                            type: 'tweet_text'
                        },
                        {
                            kind: 'block',
                            type: 'tweet_urls'
                        },
                        {
                            kind: 'block',
                            type: 'tweet_hashtags'
                        },
                        {
                            kind: 'block',
                            type: 'tweet_mentions'
                        },
                    ]
                }
            ]
        }
    ]
}

export default toolbox;