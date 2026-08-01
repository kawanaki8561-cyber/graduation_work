FROM ruby:3.2.2

# 拡張GemのビルドとMySQL通信に必要な、本当の最低限
RUN apt-get update -qq && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    chromium \
    chromium-driver \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

ENV LANG=C.UTF-8 \
    TZ=Asia/Tokyo \
    BUNDLE_APP_CONFIG=/usr/local/bundle

WORKDIR /app

RUN gem update --system && gem install bundler
COPY Gemfile Gemfile.lock ./
RUN bundle install
COPY . .

COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

EXPOSE 3000
CMD ["rails", "server", "-b", "0.0.0.0"]