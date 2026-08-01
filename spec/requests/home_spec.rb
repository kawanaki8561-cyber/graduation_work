require 'rails_helper'

RSpec.describe 'Homes', type: :request do
  describe 'GET /home/index' do
    it '未ログイン時はログイン画面にリダイレクトされること' do
      # ルーティング設定に合わせて '/home/index' にアクセスします
      # （または `get root_path` と記述しても同じ結果になります）
      get '/home/index'

      # 200(成功)ではなく、302(リダイレクト)が返ってくることを期待するテストにします
      expect(response).to have_http_status(302)
    end
  end
end
