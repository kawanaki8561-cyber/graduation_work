# frozen_string_literal: true

source 'https://rubygems.org'
ruby '3.2.2'

gem 'devise', '~> 4.9'
gem 'importmap-rails'
gem 'mysql2', '~> 0.5'
gem 'puma', '>= 5.0'
gem 'rails', '~> 7.1.6'
gem 'sprockets-rails'

group :development, :test do
  gem 'debug', platforms: %i[mri]
  gem 'rubocop', require: false
  gem 'rubocop-performance', require: false # Issue記載の要件に準拠
  gem 'rubocop-rails', require: false
  gem 'rspec-rails', '~> 7.0'
  gem 'factory_bot_rails'
end

group :test do
  gem 'simplecov', require: false
end
