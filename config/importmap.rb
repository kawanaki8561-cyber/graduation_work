# frozen_string_literal: true

# Pin npm packages by running ./bin/importmap

pin 'application'
pin '@hotwired/turbo-rails', to: '@hotwired--turbo-rails.js' # @8.0.23
# ↓ 以下の3行の先頭に # をつけてコメントアウトします
# pin '@hotwired/stimulus', to: 'stimulus.min.js'
# pin '@hotwired/stimulus-loading', to: 'stimulus-loading.js'
# pin_all_from 'app/javascript/controllers', under: 'controllers'

pin 'chart.js', to: 'https://ga.jspm.io/npm:chart.js@4.5.1/dist/chart.js'
pin '@kurkle/color', to: 'https://ga.jspm.io/npm:@kurkle/color@0.3.4/dist/color.esm.js'

pin 'papaparse' # @5.5.4
pin 'simple-statistics' # @7.9.3
# ↓ 以下の2行を「to: "URL"」の形式に書き換えます
pin '@hotwired/turbo', to: '@hotwired--turbo.js' # @8.0.23
pin '@rails/actioncable/src', to: '@rails--actioncable--src.js' # @8.1.300
pin '@hotwired/stimulus', to: 'stimulus.min.js'
pin '@hotwired/stimulus-loading', to: 'stimulus-loading.js'
pin_all_from 'app/javascript/controllers', under: 'controllers'
