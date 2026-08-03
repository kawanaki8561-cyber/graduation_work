# frozen_string_literal: true

# Pin npm packages by running ./bin/importmap

pin 'application'
pin '@hotwired/turbo-rails', to: '@hotwired--turbo-rails.js' # @8.0.23
pin '@hotwired/turbo', to: '@hotwired--turbo.js' # @8.0.23
pin '@rails/actioncable/src', to: '@rails--actioncable--src.js' # @8.1.300

# Stimulus（コントローラー）の設定
pin '@hotwired/stimulus', to: 'stimulus.min.js'
pin '@hotwired/stimulus-loading', to: 'stimulus-loading.js'
pin_all_from 'app/javascript/controllers', under: 'controllers'

# 外部ライブラリの設定
pin 'chart.js', to: 'https://ga.jspm.io/npm:chart.js@4.5.1/dist/chart.js'
pin '@kurkle/color', to: 'https://ga.jspm.io/npm:@kurkle/color@0.3.4/dist/color.esm.js'
pin 'papaparse' # @5.5.4
pin 'simple-statistics' # @7.9.3

# 【追加】utilsフォルダ内の自作ファイルを本番環境でも読み込ませるための設定
pin_all_from "app/javascript/utils", under: "utils"