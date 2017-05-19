/* Main config */

export const APP_TITLE = 'ATS Garage';
export const APP_LAYOUT = 'atsgarage';

/* API end-points config */

export const API_USER_DETAILS = '/user/profile';
export const API_USER_UPDATE = '/user/profile';
export const API_USER_UPDATE_BILLING = '/user/profile/billing_info';
export const API_USER_CHANGE_PASSWORD = '/user/change_password';
export const API_USER_ACTIVE_DEVICE_COUNT = '/api/v1/active_device_count';
export const API_USER_DEVICES_SEEN = '/api/v1/auditor/devices_seen_in';

export const API_FEATURES_FETCH = '/api/v1/features';
export const API_FEATURES_TREEHUB_ACTIVATE = '/api/v1/features/treehub';

export const API_DEVICES_SEARCH = '/api/v1/devices';
export const API_DEVICES_CREATE = '/api/v1/devices';
export const API_DEVICES_UPDATE = '/api/v1/devices';
export const API_DEVICES_DEVICE_DETAILS = '/api/v1/devices';
export const API_DEVICES_RENAME = '/api/v1/devices';

export const API_ECUS_FETCH = '/api/v1/devices';
export const API_ECUS_PUBLIC_KEY_FETCH = '/api/v1/admin/devices';

export const API_GROUPS_FETCH = '/api/v1/device_groups';
export const API_GROUPS_CREATE = '/api/v1/device_groups';
export const API_GROUPS_RENAME = '/api/v1/device_groups';
export const API_GROUPS_DEVICES_FETCH = '/api/v1/device_groups';
export const API_GROUPS_ADD_DEVICE = '/api/v1/device_groups';
export const API_GROUPS_REMOVE_DEVICE = '/api/v1/device_groups';

export const API_PACKAGES = '/api/v1/packages';
export const API_PACKAGES_COUNT_VERSION_BY_NAME = '/api/v1/device_packages';
export const API_PACKAGES_COUNT_DEVICE_AND_GROUP = '/api/v1/device_count';
export const API_PACKAGES_BLACKLIST_FETCH = '/api/v1/blacklist';
export const API_PACKAGES_PACKAGE_BLACKLISTED_FETCH = '/api/v1/blacklist';
export const API_PACKAGES_BLACKLIST = '/api/v1/blacklist';
export const API_PACKAGES_UPDATE_BLACKLISTED = '/api/v1/blacklist';
export const API_PACKAGES_REMOVE_FROM_BLACKLIST = '/api/v1/blacklist';
export const API_PACKAGES_AFFECTED_DEVICES_COUNT_FETCH = '/api/v1/blacklist';
export const API_PACKAGES_DEVICE_PACKAGES = '/api/v1/devices';
export const API_PACKAGES_DEVICE_AUTO_INSTALLED_PACKAGES = '/api/v1/auto_install';
export const API_PACKAGES_DEVICE_QUEUE = '/api/v1/device_updates';
export const API_PACKAGES_DEVICE_HISTORY = '/api/v1/history';
export const API_PACKAGES_DEVICE_UPDATES_LOGS = '/api/v1/device_updates';
export const API_PACKAGES_DEVICE_AUTO_INSTALL = '/api/v1/auto_install';
export const API_PACKAGES_DEVICE_INSTALL = '/api/v1/device_updates';
export const API_PACKAGES_DEVICE_CANCEL_INSTALLATION = '/api/v1/device_updates';

export const API_CAMPAIGNS_FETCH = '/api/v1/campaigns';
export const API_CAMPAIGNS_CAMPAIGN_DETAILS = '/api/v1/campaigns';
export const API_CAMPAIGNS_CAMPAIGN_STATISTICS = '/api/v1/campaigns';
export const API_CAMPAIGNS_CREATE = '/api/v1/campaigns';
export const API_CAMPAIGNS_PACKAGE_SAVE = '/api/v1/campaigns';
export const API_CAMPAIGNS_GROUPS_SAVE = '/api/v1/campaigns';
export const API_CAMPAIGNS_LAUNCH = '/api/v1/campaigns';
export const API_CAMPAIGNS_RENAME = '/api/v1/campaigns';
export const API_CAMPAIGNS_CANCEL = '/api/v1/campaigns';
export const API_CAMPAIGNS_CANCEL_REQUEST = '/api/v1/update_requests';

export const API_IMPACT_ANALYSIS_FETCH = '/api/v1/impact/blacklist';

export const API_PROVISIONING_STATUS = '/api/v1/provisioning/status';
export const API_PROVISIONING_ACTIVATE = '/api/v1/provisioning/activate';
export const API_PROVISIONING_DETAILS = '/api/v1/provisioning';
export const API_PROVISIONING_KEYS_FETCH = '/api/v1/provisioning/credentials/registration';
export const API_PROVISIONING_KEY_CREATE = '/api/v1/provisioning/credentials/registration';