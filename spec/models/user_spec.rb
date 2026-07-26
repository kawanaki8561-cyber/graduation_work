require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'バリデーションのテスト' do
    subject { FactoryBot.build(:user) }

    context '必須項目の検証' do
      it { is_expected.to validate_presence_of(:username) } # ←これは残す（必須チェック）
      it { is_expected.to validate_presence_of(:email) }
      it { is_expected.to validate_presence_of(:password) }
    end

    context '一意性の検証' do
      # usernameの validate_uniqueness_of の行は削除します
      it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    end
  end
end