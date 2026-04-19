import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { document_url, document_type, user_id } = await req.json();

    if (!document_url || !document_type || !user_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Step 1: Document Authenticity & OCR Analysis using AI
    const analysisResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional document verification expert. Analyze this document image and provide a comprehensive verification report.

Document Type: ${document_type}

Tasks:
1. AUTHENTICITY CHECK:
   - Is this a real official document or a fake/manipulated one?
   - Check for signs of tampering, editing, or photoshop
   - Verify document format consistency
   - Analyze image quality and integrity
   
2. OCR TEXT EXTRACTION:
   - Extract document number
   - Extract full name (owner name)
   - Extract expiration date (if applicable)
   - Extract issue date
   - For insurance/technical inspection: extract vehicle plate number
   - Extract any other relevant information
   
3. VALIDATION:
   - Check if expiration date is valid (not expired)
   - Verify all required fields are present
   - Check document layout matches official standards
   
Provide a detailed structured analysis with confidence scores.`,
      add_context_from_internet: false,
      file_urls: [document_url],
      response_json_schema: {
        type: "object",
        properties: {
          authenticity: {
            type: "object",
            properties: {
              is_authentic: { type: "boolean" },
              confidence_score: { type: "number", description: "0-100" },
              tampering_detected: { type: "boolean" },
              authenticity_notes: { type: "string" }
            }
          },
          ocr_data: {
            type: "object",
            properties: {
              document_number: { type: "string" },
              full_name: { type: "string" },
              expiration_date: { type: "string" },
              issue_date: { type: "string" },
              vehicle_plate: { type: "string" },
              other_info: { type: "object" }
            }
          },
          validation: {
            type: "object",
            properties: {
              is_expired: { type: "boolean" },
              has_all_required_fields: { type: "boolean" },
              matches_official_format: { type: "boolean" },
              validation_notes: { type: "string" }
            }
          },
          overall_verdict: {
            type: "object",
            properties: {
              status: { 
                type: "string",
                enum: ["auto_verified", "flagged", "rejected"]
              },
              ai_score: { type: "number", description: "Overall confidence 0-100" },
              risk_level: {
                type: "string",
                enum: ["low", "medium", "high"]
              },
              recommendations: { type: "string" }
            }
          }
        }
      }
    });

    // Step 2: Compare extracted name with registered user
    const targetUser = await base44.asServiceRole.entities.User.get(user_id);
    const nameMismatch = targetUser.full_name && analysisResult.ocr_data.full_name && 
      !targetUser.full_name.toLowerCase().includes(analysisResult.ocr_data.full_name.toLowerCase()) &&
      !analysisResult.ocr_data.full_name.toLowerCase().includes(targetUser.full_name.toLowerCase());

    if (nameMismatch) {
      analysisResult.overall_verdict.status = "flagged";
      analysisResult.overall_verdict.risk_level = "high";
      analysisResult.overall_verdict.recommendations += " NAME MISMATCH DETECTED.";
    }

    // Step 3: Update user record with verification data
    const verificationField = `${document_type}_verification`;
    const updateData = {
      [verificationField]: {
        status: analysisResult.overall_verdict.status,
        ai_score: analysisResult.overall_verdict.ai_score,
        ocr_data: analysisResult.ocr_data,
        verified_date: new Date().toISOString(),
        authenticity_check: analysisResult.authenticity,
        validation_check: analysisResult.validation,
        risk_level: analysisResult.overall_verdict.risk_level
      }
    };

    // Auto-approve if score is very high and no flags
    if (analysisResult.overall_verdict.ai_score >= 85 && 
        analysisResult.overall_verdict.status === "auto_verified" &&
        !nameMismatch) {
      updateData.driver_status = "approved";
    } else if (analysisResult.overall_verdict.status === "rejected") {
      updateData.driver_status = "rejected";
    } else {
      updateData.driver_status = "flagged";
    }

    await base44.asServiceRole.entities.User.update(user_id, updateData);

    // Step 4: Send notification to driver
    await base44.asServiceRole.entities.Notification.create({
      user_email: targetUser.email,
      title: `Document ${document_type} vérifié`,
      message: analysisResult.overall_verdict.status === "auto_verified" 
        ? `Votre document ${document_type} a été vérifié avec succès.`
        : `Votre document ${document_type} nécessite une vérification manuelle par notre équipe.`,
      type: "system"
    });

    return Response.json({
      success: true,
      verification_result: analysisResult,
      status: updateData.driver_status
    });

  } catch (error) {
    console.error("Document verification error:", error);
    return Response.json({ 
      error: error.message || "Verification failed" 
    }, { status: 500 });
  }
});