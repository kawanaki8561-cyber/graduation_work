require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'バリデーションのテスト' do
    # 一意性のテストなどでエラーを防ぐため、事前に有効なデータを作成しておく
    subject { FactoryBot.build(:user) }

    context '必須項目の検証' do
      it { is_expected.to validate_presence_of(:username) } # usernameの必須テスト
      it { is_expected.to validate_presence_of(:email) }
      it { is_expected.to validate_presence_of(:password) }
    end

    context '一意性の検証' do
      it { is_expected.to validate_uniqueness_of(:username) } # usernameの重複テスト
      it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    end
  end
end