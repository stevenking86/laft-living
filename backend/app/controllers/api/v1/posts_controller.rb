class Api::V1::PostsController < ApplicationController
  before_action :set_post, only: [:show, :update, :destroy]

  # GET /api/v1/posts
  def index
    @posts = Post.includes(:user).all
    render json: @posts, include: :user
  end

  # GET /api/v1/posts/1
  def show
    render json: @post, include: :user
  end

  # POST /api/v1/posts
  def create
    @post = Post.new(post_params)

    if @post.save
      render json: @post, include: :user, status: :created
    else
      render json: @post.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/posts/1
  def update
    if @post.update(post_params)
      render json: @post, include: :user
    else
      render json: @post.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/posts/1
  def destroy
    @post.destroy
    head :no_content
  end

  private

  def set_post
    @post = Post.find(params[:id])
  end

  def post_params
    params.require(:post).permit(:title, :content, :user_id)
  end
end
