namespace :guest do
  desc "指定時間（デフォルト24時間）以上経過した不要なゲストユーザーをデータベースから一括削除します"
  
  # 引数 :hoursを受けとり、Rails環境（:environment）をロードしてから実行する定義
  task :cleanup, [:hours] => :environment do |t, args|
    # 1. 引数の受け取りとデフォルト値の設定
    # args[:hours] が未指定（nil）の場合は、デフォルト値として 24 時間を使用し、整数型（.to_i）に変換します
    hours_limit = (args[:hours] || 24).to_i

    # 安全対策（バリデーション）：不正な数値（0やマイナス）が渡された場合は、処理を中断（next）します
    if hours_limit <= 0
      puts "[Error] 1以上の整数を指定してください。処理を中止します。"
      next
    end

    # 2. 削除基準となる過去の境界時刻を動的に計算
    threshold_time = hours_limit.hours.ago

    # 3. 条件に合致するゲストユーザーを検索
    expired_guests = User.where(guest: true).where("created_at < ?", threshold_time)
    count = expired_guests.count

     # 4. アソシエーションデータ（紐づくCSVデータ等）も連動して安全に一括削除
    expired_guests.destroy_all

    puts "[Cleanup] #{hours_limit}時間以上経過した古いゲストユーザーを #{count}件 削除しました"

  end

end
