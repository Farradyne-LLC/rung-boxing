export type AnalyticsEvent='contact_saved'|'boxing_saved'|'apply_clicked'|'application_started'|'application_submitted'|'session_viewed'|'match_confirmation_viewed'|'match_confirmed'|'checkout_started'|'content_pack_purchased'|'fighter_profile_viewed';
// Provider-neutral hook. Do not include names, emails, invitation tokens, URLs or form contents.
export function track(name:AnalyticsEvent){if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('punch:analytics',{detail:{name}}));}
