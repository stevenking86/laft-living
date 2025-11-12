class Api::V1::VerificationsController < ApplicationController
  before_action :authenticate_user
  before_action :set_rental_application, only: [:create, :show_by_application]
  before_action :set_verification, only: [:show, :verify]

  def create
    @verification = Verification.find_or_initialize_by(
      rental_application: @rental_application,
      user: @current_user
    )
    
    if params[:id_image]
      @verification.id_image.attach(params[:id_image])
      @verification.verification_status = 'pending'
      @verification.save
      
      # Trigger AI verification in background (or synchronously)
      verify_id
      
      render json: verification_json(@verification), status: :created
    else
      render json: { error: 'ID image is required' }, status: :unprocessable_entity
    end
  end

  def verify
    verify_id
    render json: verification_json(@verification)
  end

  def show
    render json: verification_json(@verification)
  end

  def show_by_application
    @verification = Verification.find_by(
      rental_application: @rental_application,
      user: @current_user
    )
    return render json: { error: 'Verification not found' }, status: :not_found unless @verification
    render json: verification_json(@verification)
  end

  private

  def set_rental_application
    @rental_application = RentalApplication.find_by(
      id: params[:rental_application_id],
      user_id: @current_user.id
    )
    return render json: { error: 'Rental application not found' }, status: :not_found unless @rental_application
  end

  def set_verification
    @verification = Verification.find_by(
      id: params[:id],
      user_id: @current_user.id
    )
    return render json: { error: 'Verification not found' }, status: :not_found unless @verification
  end

  def verify_id
    Rails.logger.info "[Verification Controller] Starting verification for verification_id: #{@verification.id}"
    Rails.logger.info "[Verification Controller] Rental Application ID: #{@rental_application.id}"
    
    service = IdVerificationService.new(@verification)
    result = service.verify
    
    if result[:error]
      Rails.logger.error "[Verification Controller] Verification failed with error: #{result[:error]}"
      @verification.verification_status = 'failed'
      @verification.ai_response = result
      @verification.save
    else
      verification_passed = result[:id_valid] && result[:name_match]
      Rails.logger.info "[Verification Controller] Verification result: #{verification_passed ? 'PASSED' : 'FAILED'}"
      Rails.logger.info "[Verification Controller] ID Valid: #{result[:id_valid]}, Name Match: #{result[:name_match]}"
      
      @verification.update(
        id_name_first: result[:id_name_first],
        id_name_middle: result[:id_name_middle],
        id_name_last: result[:id_name_last],
        id_valid: result[:id_valid],
        name_match: result[:name_match],
        verification_status: verification_passed ? 'verified' : 'failed',
        ai_response: result
      )
      
      unless verification_passed
        Rails.logger.warn "[Verification Controller] Verification failed - stored in database"
        Rails.logger.warn "[Verification Controller] Debug info: #{result[:debug_info].inspect}" if result[:debug_info]
      end
    end
  end

  def verification_json(verification)
    json = {
      id: verification.id,
      rental_application_id: verification.rental_application_id,
      verification_status: verification.verification_status,
      id_valid: verification.id_valid,
      name_match: verification.name_match,
      id_name_first: verification.id_name_first,
      id_name_middle: verification.id_name_middle,
      id_name_last: verification.id_name_last,
      id_image_url: verification.id_image.attached? ? 
        url_for(verification.id_image) : nil,
      created_at: verification.created_at,
      updated_at: verification.updated_at
    }
    
    # Include debug info in development
    if Rails.env.development? && verification.ai_response&.dig('debug_info')
      json[:debug_info] = verification.ai_response['debug_info']
      json[:failure_reason] = if !verification.id_valid && !verification.name_match
        'ID validation failed and name does not match'
      elsif !verification.id_valid
        'ID validation failed'
      elsif !verification.name_match
        'Name does not match application'
      else
        nil
      end
    end
    
    json
  end
end

