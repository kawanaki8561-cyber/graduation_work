source "https://rubygems.org"

ruby "3.2.2"

gem "rails", "~> 7.1.6"

# アセットパイプライン
gem "sprockets-rails"

# データベース接続
gem "mysql2", "~> 0.5"

# Webサーバー
gem "puma", ">= 5.0"

# JavaScriptの依存関係管理（Chart.jsやPapa Parseの導入に必須）
gem "importmap-rails"

# ユーザー認証
gem "devise", "~> 4.9"

gem "tzinfo-data", platforms: %i[ windows jruby ]
gem "bootsnap", require: false

group :development, :test do
  gem "debug", platforms: %i[ mri windows ]
end

group :development do
  gem "web-console"
end

group :test do
  gem "capybara"
  gem "selenium-webdriver"
end