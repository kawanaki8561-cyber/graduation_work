FactoryBot.define do
  factory :user do
    sequence(:username) { |n| "user_name#{n}" }
    sequence(:email){ |n| "user#{n}@example.com" }
    passworld{ "password123" }
    
  end
end
