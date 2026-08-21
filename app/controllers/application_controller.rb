frozen_string_literal: true
class ApplicationController < ActionController::Base

  before_action :configure_permitted_parameters, if: :devise_controller?

  before_action :authenticate_user!

  helper_method :current_or_guest_user

  #ログインユーザー、またはゲストユーザーを返すメインメソッド

  def current_or_guest_user

    if current_user

      if session[:guest_user_id] && session[:guest_user_id] != current_user.id

        logging_in(guest_user, current_user)

        guest_user.destroy

        session[:guest_user_id] = nil

      end

      current_user

    else

      guest_user

    end

  end

  protected

  #データベースに一時的なゲストユーザーを作製する。

  def create_guest_user

    # マイグレーション履歴にある username の追加（Add username to users）を考慮し、

    # username カラムに "ゲスト" などの初期値を入れておきます

    user = User.new(

      username: "ゲスト",

      email: "guest_#{Time.now.to_i}#{rand(100)}@example.com",

      guest:true # 追加したフラグを true に

    )

    # パスワード必須などのバリデーションを一旦スキップして、安全に保存します

    user.save!(validate: false)

    # セッションにゲストIDを保存

    session[:guest_user_id] =user.id

    user

  end

  def logging_in(guest_user, current_user)
    guest_user.posts.update_all(user_id: current_user.id)
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:username])
  end

end