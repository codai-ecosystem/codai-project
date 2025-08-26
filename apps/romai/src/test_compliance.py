#!/usr/bin/env python3
"""
Test the complete compliance system
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

def test_compliance_system():
    try:
        # Test imports
        from ml.compliance import create_complete_compliance_system
        print('✅ Compliance system import successful')
        
        # Create system
        compliance_system = create_complete_compliance_system('RomAI-Test')
        print('✅ Compliance system creation successful')
        
        # Test GDPR detection
        from ml.compliance.gdpr_data_protection import create_gdpr_protection
        gdpr = create_gdpr_protection()
        result = gdpr.process_with_gdpr_compliance('Test input without personal data')
        print(f'✅ GDPR processing successful - Compliant: {result["gdpr_compliant"]}')
        
        # Test EU AI Act compliance
        from ml.compliance.eu_ai_act_compliance import create_compliance_framework
        eu_framework = create_compliance_framework()
        assessment = eu_framework.assess_compliance_status('Test input', 'Test output')
        print(f'✅ EU AI Act assessment successful - Status: {assessment["overall_status"]}')
        
        # Test personal data detection
        gdpr_result = gdpr.process_with_gdpr_compliance('My email is john@example.com and phone is 555-1234')
        print(f'✅ Personal data detection - Protection Required: {gdpr_result["data_detection"]["protection_required"]}')
        
        # Test bias detection
        bias_assessment = eu_framework.bias_detector.detect_bias_in_response(
            'Test input', 
            'Women are naturally better at nurturing roles'
        )
        print(f'✅ Bias detection - Fairness Score: {bias_assessment.fairness_score:.2f}')
        
        print('🎉 All compliance components working correctly!')
        return True
        
    except Exception as e:
        print(f'❌ Error: {e}')
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_compliance_system()