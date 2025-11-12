class IdVerificationService
  def initialize(verification)
    @verification = verification
    @rental_application = verification.rental_application
  end

  def verify
    Rails.logger.info "[ID Verification] Starting verification for rental_application_id: #{@rental_application.id}"
    Rails.logger.info "[ID Verification] Application name: #{@rental_application.first_name} #{@rental_application.middle_name} #{@rental_application.last_name}"
    
    return { error: 'No ID image attached' } unless @verification.id_image.attached?

    # Get the image data
    image_data = download_image
    Rails.logger.info "[ID Verification] Image downloaded, size: #{image_data.bytesize} bytes"
    
    # Call AI service (OpenAI Vision API)
    ai_result = call_openai_vision_api(image_data)
    Rails.logger.info "[ID Verification] AI API call completed"
    
    # Parse and validate results
    result = parse_and_validate(ai_result)
    Rails.logger.info "[ID Verification] Verification result: #{result.inspect}"
    result
  end

  private

  def download_image
    # Download the image from Active Storage
    @verification.id_image.download
  end

  def call_openai_vision_api(image_data)
    require 'net/http'
    require 'json'
    require 'base64'

    api_key = ENV['OPENAI_API_KEY']
    return { error: 'OpenAI API key not configured' } unless api_key

    uri = URI('https://api.openai.com/v1/chat/completions')
    
    # Convert image to base64
    base64_image = Base64.strict_encode64(image_data)
    
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    
    request = Net::HTTP::Post.new(uri)
    request['Authorization'] = "Bearer #{api_key}"
    request['Content-Type'] = 'application/json'
    
    prompt = <<~PROMPT
      Analyze this ID/license image and extract the following information:
      1. First name
      2. Middle name (if present, can be empty string if not found)
      3. Last name
      4. Date of birth (if visible)
      5. Determine if this appears to be a valid government-issued ID/license
      6. Check for any obvious signs of tampering or fraud
      
      Return a JSON object with:
      - first_name: extracted first name
      - middle_name: extracted middle name (empty string if not present)
      - last_name: extracted last name
      - date_of_birth: extracted DOB (if available)
      - is_valid_id: boolean indicating if it appears to be a valid ID
      - confidence_score: 0-1 indicating confidence in the validation
      - notes: any relevant observations
      
      Note: Middle names may appear as full names, initials, or may be absent entirely. Extract what you see.
      Respond ONLY with valid JSON, no additional text.
    PROMPT

    request.body = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: "data:image/jpeg;base64,#{base64_image}"
              }
            }
          ]
        }
      ],
      max_tokens: 500
    }.to_json

    response = http.request(request)
    parsed_response = JSON.parse(response.body)
    
    # Log the raw AI response for debugging
    Rails.logger.info "[ID Verification] OpenAI API Response Status: #{response.code}"
    if parsed_response['choices']&.first&.dig('message', 'content')
      Rails.logger.info "[ID Verification] OpenAI Response Content: #{parsed_response['choices'].first['message']['content']}"
    else
      Rails.logger.warn "[ID Verification] Unexpected OpenAI response structure: #{parsed_response.inspect}"
    end
    
    parsed_response
  rescue => e
    Rails.logger.error "[ID Verification] Error calling OpenAI API: #{e.class} - #{e.message}"
    Rails.logger.error "[ID Verification] Backtrace: #{e.backtrace.first(5).join("\n")}"
    { error: e.message }
  end

  def parse_and_validate(ai_result)
    if ai_result['error']
      Rails.logger.error "[ID Verification] AI service error: #{ai_result['error']}"
      Rails.logger.error "[ID Verification] Error details: #{ai_result.inspect}"
      return { error: 'AI service error', details: ai_result }
    end
    
    # Extract the message content
    content = ai_result.dig('choices', 0, 'message', 'content')
    unless content
      Rails.logger.error "[ID Verification] Invalid AI response - no content found"
      Rails.logger.error "[ID Verification] Full response: #{ai_result.inspect}"
      return { error: 'Invalid AI response' }
    end
    
    Rails.logger.info "[ID Verification] Raw AI content: #{content}"
    
    # Parse JSON from AI response
    # The AI might return JSON wrapped in markdown code blocks, so we need to extract it
    json_match = content.match(/\{[\s\S]*\}/)
    unless json_match
      Rails.logger.error "[ID Verification] Could not find JSON in AI response"
      Rails.logger.error "[ID Verification] Content: #{content}"
      return { error: 'Could not parse AI response as JSON' }
    end
    
    parsed = JSON.parse(json_match[0]) rescue {}
    if parsed.empty?
      Rails.logger.error "[ID Verification] Invalid JSON structure in AI response"
      Rails.logger.error "[ID Verification] Extracted JSON: #{json_match[0]}"
      return { error: 'Invalid JSON structure in AI response' }
    end
    
    Rails.logger.info "[ID Verification] Parsed AI response: #{parsed.inspect}"
    
    # Compare names with rental application
    app_first = @rental_application.first_name.downcase.strip
    app_middle = @rental_application.middle_name&.downcase&.strip || ''
    app_last = @rental_application.last_name.downcase.strip
    id_first = parsed['first_name']&.downcase&.strip || ''
    id_middle = parsed['middle_name']&.downcase&.strip || ''
    id_last = parsed['last_name']&.downcase&.strip || ''
    
    Rails.logger.info "[ID Verification] Name Comparison:"
    Rails.logger.info "  Application: First='#{app_first}' Middle='#{app_middle}' Last='#{app_last}'"
    Rails.logger.info "  ID Extracted: First='#{id_first}' Middle='#{id_middle}' Last='#{id_last}'"
    
    # Name matching logic:
    # - First and last names must match exactly
    # - Middle name matching is flexible:
    #   - If application has middle name and ID has middle name, they should match (or be compatible)
    #   - If application has middle name but ID doesn't, that's OK (ID might not show middle)
    #   - If application doesn't have middle name, ignore ID middle name
    first_match = app_first == id_first
    last_match = app_last == id_last
    first_last_match = first_match && last_match
    
    Rails.logger.info "  First name match: #{first_match} (#{app_first} vs #{id_first})"
    Rails.logger.info "  Last name match: #{last_match} (#{app_last} vs #{id_last})"
    
    middle_match = if app_middle.empty?
      # Application has no middle name - ignore ID middle name
      Rails.logger.info "  Middle name: Application has none, ignoring ID middle name"
      true
    elsif id_middle.empty?
      # Application has middle name but ID doesn't - this is acceptable
      Rails.logger.info "  Middle name: Application has '#{app_middle}' but ID doesn't - acceptable"
      true
    else
      # Both have middle names - check if they match
      # Allow for initials (e.g., "John" matches "J" or "J.")
      app_middle_normalized = app_middle.gsub(/[^a-z]/, '')
      id_middle_normalized = id_middle.gsub(/[^a-z]/, '')
      matches = app_middle_normalized == id_middle_normalized || 
                app_middle_normalized.start_with?(id_middle_normalized) || 
                id_middle_normalized.start_with?(app_middle_normalized)
      Rails.logger.info "  Middle name match: #{matches} (App: '#{app_middle_normalized}' vs ID: '#{id_middle_normalized}')"
      matches
    end
    
    name_match = first_last_match && middle_match
    
    id_valid = parsed['is_valid_id'] == true || parsed['is_valid_id'] == 'true'
    
    Rails.logger.info "[ID Verification] Final Results:"
    Rails.logger.info "  ID Valid: #{id_valid}"
    Rails.logger.info "  Name Match: #{name_match}"
    Rails.logger.info "  Overall Verification: #{id_valid && name_match ? 'PASSED' : 'FAILED'}"
    if !name_match
      Rails.logger.warn "[ID Verification] Name mismatch details:"
      Rails.logger.warn "    First name: #{first_match ? 'MATCH' : "MISMATCH (#{app_first} vs #{id_first})"}"
      Rails.logger.warn "    Last name: #{last_match ? 'MATCH' : "MISMATCH (#{app_last} vs #{id_last})"}"
      Rails.logger.warn "    Middle name: #{middle_match ? 'MATCH/OK' : 'MISMATCH'}"
    end
    if !id_valid
      Rails.logger.warn "[ID Verification] ID validation failed - AI marked ID as invalid"
    end
    
    {
      id_name_first: parsed['first_name'],
      id_name_middle: parsed['middle_name'],
      id_name_last: parsed['last_name'],
      id_valid: id_valid,
      name_match: name_match,
      confidence_score: parsed['confidence_score'] || 0,
      notes: parsed['notes'],
      raw_response: ai_result,
      debug_info: {
        app_first: @rental_application.first_name,
        app_middle: @rental_application.middle_name,
        app_last: @rental_application.last_name,
        id_first: parsed['first_name'],
        id_middle: parsed['middle_name'],
        id_last: parsed['last_name'],
        first_match: first_match,
        last_match: last_match,
        middle_match: middle_match,
        id_valid: id_valid
      }
    }
  end
end

