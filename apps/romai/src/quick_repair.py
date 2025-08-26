"""
Quick RomAI File Repair
======================

Targeted repair for the multimodal trainer file to remove all orphaned neural inference code.
"""

import re

def repair_multimodal_trainer():
    """Repair the multimodal trainer file by removing all orphaned neural inference code"""
    file_path = "ml/training/multimodal_agi_trainer.py"
    
    try:
        # Read the file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"📖 Original file length: {len(content)} characters")
        
        # Remove all orphaned neural inference blocks using a more aggressive pattern
        patterns_to_remove = [
            # Pattern 1: Neural inference comment followed by try block
            r'\s*# RomAI General Expert - Authentic Neural Inference\s*\n\s*try:.*?(?=\n\s*(?:def |class |$))',
            
            # Pattern 2: Standalone try blocks with neural inference content
            r'\s*try:\s*\n\s*# Route to appropriate expert.*?return \{"error":.*?\}',
            
            # Pattern 3: Orphaned expert routing code
            r'\s*# Route to appropriate expert based on input analysis.*?(?=\n\s*(?:def |class |return|$))',
            
            # Pattern 4: Orphaned exception handling
            r'\s*except Exception as e:\s*\n\s*logger\.error.*?(?=\n\s*(?:def |class |return|$))',
        ]
        
        for i, pattern in enumerate(patterns_to_remove):
            before_len = len(content)
            content = re.sub(pattern, '', content, flags=re.MULTILINE | re.DOTALL)
            after_len = len(content)
            removed = before_len - after_len
            if removed > 0:
                print(f"🧹 Pattern {i+1}: Removed {removed} characters")
        
        # Remove excessive blank lines
        content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)
        
        # Fix specific indentation issues - remove lines that start with excessive indentation
        lines = content.split('\n')
        fixed_lines = []
        
        for line in lines:
            # Skip lines with excessive indentation that are likely orphaned
            if line.startswith('                    ') and line.strip() not in ['', 'try:', 'except:', 'except Exception as e:']:
                continue
            fixed_lines.append(line)
        
        content = '\n'.join(fixed_lines)
        
        # Write the repaired content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"📝 Repaired file length: {len(content)} characters")
        print(f"✅ {file_path} repaired successfully!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error repairing {file_path}: {str(e)}")
        return False

def test_syntax(file_path):
    """Test Python syntax of a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        compile(content, file_path, 'exec')
        print(f"✅ {file_path} - Syntax OK!")
        return True
        
    except SyntaxError as e:
        print(f"❌ {file_path} - Syntax Error at line {e.lineno}: {e.msg}")
        return False
    except Exception as e:
        print(f"⚠️ {file_path} - Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔧 Quick RomAI Multimodal Trainer Repair")
    print("=" * 45)
    
    # Repair the file
    if repair_multimodal_trainer():
        # Test syntax
        test_syntax("ml/training/multimodal_agi_trainer.py")
    else:
        print("❌ Repair failed!")