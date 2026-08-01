# frozen_string_literal: true

source 'https://rubygems.org'
ruby '3.2.2'

gem 'devise', '~> 4.9'
gem 'importmap-rails'
gem 'mysql2', '~> 0.5'
gem 'puma', '>= 5.0'
gem 'rails', '~> 7.1.6'
gem 'sprockets-rails'
gem 'stimulus-rails'

group :development, :test do
  gem 'debug', platforms: %i[mri]
  gem 'factory_bot_rails'
  gem 'rspec-rails', '~> 7.0'
  gem 'capybara' # E2Eテスト用のDSL
  gem 'selenium-webdriver' # ブラウザ操作用ドライバ
  gem 'rubocop', require: false
  gem 'rubocop-performance', require: false 
  gem 'rubocop-rails', require: false

end

group :development do
  gem 'bullet'
end

group :test do
  gem 'shoulda-matchers', '~> 5.0' # ← この行を追加します
  gem 'simplecov', require: false
end
