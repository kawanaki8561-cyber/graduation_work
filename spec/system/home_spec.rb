require 'rails_helper'

RSpec.describe 'ホーム画面', type: :system do
  let(:user) { create(:user) }

  before do
    sign_in user
    visit root_path
  end

  context 'ログイン時' do
    it '画面にSPC統計計解析画面が表示されること' do
      expect(page).to have_content('SPC統計計算結果')
    end
  end
end
