/*
    This file is based on Nitter, and is therefore licenced under AGPLv3, NOT MIT.
    See LICENCE in the current folder for more information.
*/

export const AUTH_HEADER = "Bearer AAAAAAAAAAAAAAAAAAAAAFQODgEAAAAAVHTp76lzh3rFzcHbmHVvQxYYpTw%3DckAlMINMjmCwxUcaXbAN4XqJVdgMJaHqNOFgPMK0zN1qLqLQCF";
export const BASE_URL = "https://api.twitter.com/graphql/";

// new releases of chrome are released ~ every month, so this'll calculate
// the "current" version - 2 based on the current date
const getChromeVersion = () => {
    let currentDate = new Date();
    return 70 + ((currentDate.getFullYear() - 2020) * 12) + currentDate.getMonth();
}

export const USER_AGENT = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${getChromeVersion()}.0.4472.124 Safari/537.36`

export const GRAPHQL = {
    UserResultByScreenName: BASE_URL + "u7wQyGi6oExe8_TRWGMq4Q/UserResultByScreenNameQuery",
    UserResultById: BASE_URL + "oPppcargziU1uDQHAUmH-A//UserResultByIdQuery",
    UserProfileWithTweetsV2: BASE_URL + "3JNH4e9dq1BifLxAa3UMWg/UserWithProfileTweetsQueryV2",
}

export const GRAPHQL_FEATURES = {
    "android_graphql_skip_api_media_color_palette": false,
    "blue_business_profile_image_shape_enabled": false,
    "creator_subscriptions_subscription_count_enabled": false,
    "creator_subscriptions_tweet_preview_api_enabled": true,
    "freedom_of_speech_not_reach_fetch_enabled": false,
    "graphql_is_translatable_rweb_tweet_is_translatable_enabled": false,
    "hidden_profile_likes_enabled": false,
    "highlights_tweets_tab_ui_enabled": false,
    "interactive_text_enabled": false,
    "longform_notetweets_consumption_enabled": true,
    "longform_notetweets_inline_media_enabled": false,
    "longform_notetweets_richtext_consumption_enabled": true,
    "longform_notetweets_rich_text_read_enabled": false,
    "responsive_web_edit_tweet_api_enabled": false,
    "responsive_web_enhance_cards_enabled": false,
    "responsive_web_graphql_exclude_directive_enabled": true,
    "responsive_web_graphql_skip_user_profile_image_extensions_enabled": false,
    "responsive_web_graphql_timeline_navigation_enabled": false,
    "responsive_web_media_download_video_enabled": false,
    "responsive_web_text_conversations_enabled": false,
    "responsive_web_twitter_article_tweet_consumption_enabled": false,
    "responsive_web_twitter_blue_verified_badge_is_enabled": true,
    "rweb_lists_timeline_redesign_enabled": true,
    "spaces_2022_h2_clipping": true,
    "spaces_2022_h2_spaces_communities": true,
    "standardized_nudges_misinfo": false,
    "subscriptions_verification_info_enabled": true,
    "subscriptions_verification_info_reason_enabled": true,
    "subscriptions_verification_info_verified_since_enabled": true,
    "super_follow_badge_privacy_enabled": false,
    "super_follow_exclusive_tweet_notifications_enabled": false,
    "super_follow_tweet_api_enabled": false,
    "super_follow_user_api_enabled": false,
    "tweet_awards_web_tipping_enabled": false,
    "tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled": false,
    "tweetypie_unmention_optimization_enabled": false,
    "unified_cards_ad_metadata_container_dynamic_card_content_query_enabled": false,
    "verified_phone_label_enabled": false,
    "vibe_api_enabled": false,
    "view_counts_everywhere_api_enabled": false
};

