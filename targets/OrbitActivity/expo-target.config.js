/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: 'widget',
  name: 'OrbitActivity',
  displayName: 'Orbit Pay',
  bundleIdentifier: '.activity',
  deploymentTarget: '16.4',
  frameworks: ['SwiftUI', 'WidgetKit', 'ActivityKit'],
};
