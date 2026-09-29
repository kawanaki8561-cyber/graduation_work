require 'rails_helper'

RSpec.describe 'サンプルデモ機能', type: :system do
  let(:user) { create(:user) }

  before do
    page.driver.browser.manage.window.resize_to(1920, 1080)
    sign_in user
    visit root_path
    click_button 'サンプルデータで試す'
    
  end

  it '項目を選択すると、統計値が正しく算出・表示されること' do
    # 1. サンプルデータ読み込みボタンをクリック（通常のCapybara操作で確実に発火）
    #click_button 'サンプルデータで試す'

    # 2. CSV読み込み完了（ファイル名反映）を待機
    # expect(page).to have_field('CSVファイル読み込み', with: /demo\.csv$/)

    # 3. カラムを選択（value属性で確実に特定）
    # find('#select_column_name').find("option[value='I管理TEST1検知デモ']").select_option
    select 'I管理TEST1検知デモ', from: 'select_column_name'
    # 4. セレクトボックスの選択値を確認
    # expect(find('#select_column_name').value).to eq 'I管理TEST1検知デモ'

    # 5. 統計値（平均値）の反映を確認
    expect(find('[data-spc-chart-target="mean"]')).to have_content('9.854')

    click_button 'SPC管理図'

    expect(page).to have_css('canvas[data-spc-chart-target="canvas"]')
  
    click_button '計算データ'

    select 'I管理TEST3検知デモ', from: 'select_column_name'

    # . 統計値（平均値）の反映を確認
    expect(find('[data-spc-chart-target="mean"]')).to have_content('9.988')
    
    click_button 'SPC管理図'

    expect(page).to have_css('canvas[data-spc-chart-target="canvas"]')


  end
end