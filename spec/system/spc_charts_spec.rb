# spec/system/spc_charts_spec.rb
# spec/system/spc_charts_spec.rb
require 'rails_helper'

RSpec.describe 'SPC管理図描画フロー', type: :system do
  # テスト用のユーザーデータをFactoryBotで生成
  let(:user) { create(:user) } 

  before do
    # Deviseを用いたログイン処理
    visit new_user_session_path # ログイン画面へアクセス
    
    # ログインフォームの入力
    fill_in 'Email', with: user.email
    fill_in 'password', with: user.password
    click_button 'ログイン'

    expect(page).to have_content 'CSVファイル読み込み'
  end

  it 'CSVをアップロードし、カラムを選択すると管理図が描画されること' do
    # 1. 解析対象のページ（ホーム画面）へアクセス
    visit root_path

    # 2. CSVファイルのアップロード
    csv_path = Rails.root.join('spec/fixtures/files/winequality-white.csv')
    
    # inputタグの id="csv_file" に対してアタッチ
    attach_file 'csv_file', csv_path 

    # 3. カラムの選択
    # selectタグの id="select_column_name" から、CSVに存在するカラムを選択
    select 'fixed acidity', from: 'select_column_name'

    # 4. 統計計算結果の出力検証
    # <h3 data-spc-chart-target="mean"> などに数値が出力されたかを検証
    within('[data-spc-chart-target="mean"]') do
      expect(page).to have_text(/\d+\.\d+/) # 数値が出力されているか
    end
    within('[data-spc-chart-target="ucl"]') do
      expect(page).to have_text(/\d+\.\d+/)
    end
    within('[data-spc-chart-target="lcl"]') do
      expect(page).to have_text(/\d+\.\d+/)
    end

    # 5. グラフ（Canvas）の描画検証
    click_button 'SPC管理図'
    # <canvas id="controlChart" data-spc-chart-target="canvas"> が存在することを確認
    expect(page).to have_css('canvas[data-spc-chart-target="canvas"]')
  end
end