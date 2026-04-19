export const analyticsEvents = {
  landingCtaClicked: 'landing_cta_clicked',
  registerSucceeded: 'register_succeeded',
  registerFailed: 'register_failed',
  loginSucceeded: 'login_succeeded',
  loginFailed: 'login_failed',
  logout: 'logout',
  forcedLogoutRefreshFailure: 'forced_logout_refresh_failure',
  bookCreated: 'book_created',
  bookUpdated: 'book_updated',
  bookDeleted: 'book_deleted',
  progressUpdated: 'progress_updated',
  readingSessionLogged: 'reading_session_logged',
  goalUpdated: 'goal_updated',
  reminderSettingsChanged: 'reminder_settings_changed',
  wishlistItemCreated: 'wishlist_item_created',
  wishlistItemDeleted: 'wishlist_item_deleted',
  wishlistLinkCreated: 'wishlist_link_created',
  localeChanged: 'locale_changed',
  themeChanged: 'theme_changed',
  coachInsightInteracted: 'coach_insight_interacted'
} as const

export type AnalyticsEventName = (typeof analyticsEvents)[keyof typeof analyticsEvents]
