class TestsController < ApplicationController
  def index
    # N+1を発生させるため、事前読み込み（includesなど）をせずに全件取得します
    @posts = Post.all
  end
end
