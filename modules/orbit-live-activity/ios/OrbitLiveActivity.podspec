Pod::Spec.new do |s|
  s.name           = 'OrbitLiveActivity'
  s.version        = '1.0.0'
  s.summary        = 'Starts and updates the Orbit Pay Live Activity'
  s.description    = 'Local ActivityKit bridge for Orbit Pay'
  s.license        = 'MIT'
  s.author         = 'Orbit Pay'
  s.homepage       = 'https://example.com/orbit-pay'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.{h,m,swift}'
  s.frameworks = 'ActivityKit'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
