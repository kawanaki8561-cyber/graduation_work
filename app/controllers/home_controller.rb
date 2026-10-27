# frozen_string_literal: true

class HomeController < ApplicationController
  skip_before_action :authenticate_user!, only: %i[privacy terms], raise: false

  def index; end

  def privacy; end

  def terms; end
end
