class Post < ApplicationRecord
    has_many :comments # これを追記して保存してください
end
