# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  # before_action :configure_sign_in_params, only: [:create]

  # GET /resource/sign_in
  # def new
  #   super
  # end

  # POST /resource/sign_in
  # def create
  #   super
  # end

  # DELETE /resource/sign_out
  # def destroy
  #   super
  # end

  def guest_sign_in
    # ゲストユーザーを取得または作成
    user = guest_user
    # Deviseのサインインメソッドでゲストユーザーをログイン状態にする
    sign_in user
    
    flash[:notice] = "ゲストユーザーとしてログインしました（お試し中）。"

    redirect_to root_path, status: :see_other
  end

  def create
    # ログイン前に、現在のセッションに紐づいているゲストユーザーを一時保存
    handing_over_guest = guest_user if session[:guest_user_id]

    # Deviseデフォルトの新規登録処理を実行
    super do |user|
      # 登録（保存）が成功し、かつ事前に一時ゲストが存在していた場合、データを本ユーザーに引き継ぐ
      if handing_over_guest && handing_over_guest != user
        logging_in(handing_over_guest, user) #データの引継ぎ
        handing_over_guest.destroy # 引き継ぎ後にゲストレコードを削除
        session[:guest_user_id] = nil # ゲストセッションのクリア
      end
    end
  end

  # protected

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_in_params
  #   devise_parameter_sanitizer.permit(:sign_in, keys: [:attribute])
  # end



end
