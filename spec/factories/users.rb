FactoryBot.define do
  factory :user do
    sequence(:username) { |n| "user_name#{n}" }
    sequence(:email) { |n| "user#{n}@example.com" }
    
    # 修正前: passworld { "password123" }
    password { "password123" } # ← 'l' を削除して正しいスペル（password）に直します
  end
end