# spec\system\guest_sessions_spec.rb

require 'rails_helper'

RSpec.describe 'ログイン機能', type: :system do
  before do
    # Deviseを用いたログイン処理
    visit new_user_session_path # ログイン画面へアクセス
  end

  describe '通常ログイン機能' do
    let(:user) { create(:user) }
    before do
      fill_in 'Email', with: user.email
      fill_in 'password', with: user.password
      click_button 'ログイン'
    end
    context 'ログイン' do
      it 'トップページに「ログインしました」と表示されること' do
        expect(page).to have_content 'ログインしました'
        expect(page).to have_current_path root_path
      end
    end
    context 'ログアウト' do
      it 'ログアウトボタンを押すと「アカウント登録もしくはログインしてください。」と表示されること' do
        click_button 'ログアウト'
        expect(page).to have_content 'アカウント登録もしくはログインしてください。'
        expect(page).to have_current_path new_user_session_path
      end
    end
  end
  describe 'ゲストユーザーログイン機能' do
    before do
      click_button 'ゲストログイン（お試し機能）'
    end
    context 'ログイン' do
      it 'トップページにゲストログインメッセージが表示されること' do
        expect(page).to have_content 'ゲストユーザーとしてログインしました（お試し中）。'
        expect(page).to have_current_path root_path
      end
    end
    context 'ログアウト' do
      it 'ログアウトボタンを押すと「アカウント登録もしくはログインしてください。」と表示されること' do
        click_button 'ログアウト'
        expect(page).to have_content 'アカウント登録もしくはログインしてください。'
        expect(page).to have_current_path new_user_session_path
      end
    end
  end
end
