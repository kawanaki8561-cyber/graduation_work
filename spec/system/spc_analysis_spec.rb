require 'rails_helper'

RSpec.describe 'SPC管理解析フロー', type: :system do
    let(:user) { create(:user) }
    describe '相関関係の計算機能' do
        before do
            visit new_user_session_path # ログイン画面へアクセス

            # ログインフォームの入力
            fill_in 'Email', with: user.email
            fill_in 'password', with: user.password

            click_button 'ログイン'

            visit root_path

            click_button 'サンプルデータで試す', exact_text: false
        end
        context 'I管理TEST1検知デモの項目解析' do
            before do
                select 'I管理TEST1検知デモ', from: 'select_column_name'

                find('#other-tab', text: 'STEP4: 相関関係の解析').click
            end
            it '相関関係の解析結果画面が表示されること' do
                # select 'I管理TEST1検知デモ', from: 'select_column_name'

                # find('#other-tab', text: 'STEP4: 相関関係の解析').click

                expect(page).to have_content '要因解析：相関係数一覧'
            end
            it '基準項目「I管理TEST1検知デモ」が表示されていること' do
                #  select 'I管理TEST1検知デモ', from: 'select_column_name'

                # find('#other-tab', text: 'STEP4: 相関関係の解析').click

                expect(page).to have_content '基準項目：I管理TEST1検知デモ'
            end
        end
    end
end