"""
RomAI Syntax Repair Tool
========================

Fixes syntax errors and corrupted code caused by the mock replacement process.
This tool systematically repairs Python files with indentation issues and orphaned code blocks.

Author: GitHub Copilot Agent
Date: August 26, 2025
"""

import os
import re
import ast
from pathlib import Path
from typing import List, Tuple, Dict

class SyntaxRepairTool:
    """Tool to repair syntax errors in Python files"""
    
    def __init__(self, root_dir: str):
        self.root_dir = Path(root_dir)
        self.repairs_made = []
    
    def find_python_files(self) -> List[Path]:
        """Find all Python files in the directory"""
        return list(self.root_dir.rglob("*.py"))
    
    def check_syntax(self, file_path: Path) -> Tuple[bool, str]:
        """Check if a Python file has syntax errors"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            ast.parse(content)
            return True, ""
        except SyntaxError as e:
            return False, f"Line {e.lineno}: {e.msg}"
        except Exception as e:
            return False, f"Error: {str(e)}"
    
    def fix_orphaned_neural_code(self, content: str) -> str:
        """Remove orphaned neural inference code blocks"""
        # Pattern to match orphaned neural inference blocks
        patterns_to_remove = [
            r'\s*# RomAI General Expert - Authentic Neural Inference\s*\n\s*try:\s*\n(?:\s*.*\n)*?\s*except.*?\n(?:\s*.*\n)*?\s*return.*?}',
            r'\s*try:\s*\n\s*# Route to appropriate expert.*?\n(?:\s*.*\n)*?\s*except.*?\n(?:\s*.*\n)*?',
            r'\s*# Route to appropriate expert based on input analysis.*?\n(?:\s*.*\n)*?\s*return {"error":.*?}',
        ]
        
        for pattern in patterns_to_remove:
            content = re.sub(pattern, '', content, flags=re.MULTILINE | re.DOTALL)
        
        return content
    
    def fix_indentation_errors(self, content: str) -> str:
        """Fix common indentation issues"""
        lines = content.split('\n')
        fixed_lines = []
        
        for i, line in enumerate(lines):
            # Skip empty lines
            if not line.strip():
                fixed_lines.append(line)
                continue
            
            # Check for lines that start with excessive indentation after return/continue/break
            if i > 0 and fixed_lines[-1].strip().endswith(('return', 'continue', 'break')) and line.startswith('                    '):
                # This line is likely orphaned code - skip it
                continue
            
            # Check for orphaned try blocks with excessive indentation
            if line.strip().startswith('try:') and line.startswith('                    '):
                # Skip orphaned try blocks
                continue
                
            fixed_lines.append(line)
        
        return '\n'.join(fixed_lines)
    
    def fix_extra_brackets(self, content: str) -> str:
        """Fix extra brackets and mismatched parentheses"""
        # Remove lines with just closing brackets
        lines = content.split('\n')
        fixed_lines = []
        
        for line in lines:
            stripped = line.strip()
            # Skip lines that are just extra closing brackets
            if stripped in [']', '}', ')'] and len(fixed_lines) > 0:
                # Check if the previous line already closes properly
                prev_line = fixed_lines[-1].strip() if fixed_lines else ''
                if prev_line.endswith((']', '}', ')')):
                    continue
            
            fixed_lines.append(line)
        
        return '\n'.join(fixed_lines)
    
    def repair_file(self, file_path: Path) -> bool:
        """Repair a single Python file"""
        try:
            # Read file content
            with open(file_path, 'r', encoding='utf-8') as f:
                original_content = f.read()
            
            # Apply fixes
            fixed_content = original_content
            fixed_content = self.fix_orphaned_neural_code(fixed_content)
            fixed_content = self.fix_indentation_errors(fixed_content)
            fixed_content = self.fix_extra_brackets(fixed_content)
            
            # Remove excessive blank lines
            fixed_content = re.sub(r'\n\s*\n\s*\n', '\n\n', fixed_content)
            
            # Check if changes were made
            if fixed_content != original_content:
                # Verify the fix doesn't break syntax
                try:
                    ast.parse(fixed_content)
                    # Write the fixed content
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(fixed_content)
                    
                    self.repairs_made.append(str(file_path))
                    print(f"✅ Repaired: {file_path}")
                    return True
                except SyntaxError as e:
                    print(f"❌ Fix created new syntax error in {file_path}: {e}")
                    return False
            
            return True
            
        except Exception as e:
            print(f"❌ Error repairing {file_path}: {str(e)}")
            return False
    
    def repair_all(self) -> Dict[str, int]:
        """Repair all Python files in the directory"""
        python_files = self.find_python_files()
        results = {
            'total': len(python_files),
            'syntax_errors': 0,
            'repaired': 0,
            'failed': 0
        }
        
        print(f"🔧 Found {len(python_files)} Python files to check...")
        
        for file_path in python_files:
            # Check if file has syntax errors
            is_valid, error_msg = self.check_syntax(file_path)
            
            if not is_valid:
                results['syntax_errors'] += 1
                print(f"🔍 Syntax error in {file_path}: {error_msg}")
                
                # Try to repair
                if self.repair_file(file_path):
                    # Verify the repair worked
                    is_valid_after, _ = self.check_syntax(file_path)
                    if is_valid_after:
                        results['repaired'] += 1
                    else:
                        results['failed'] += 1
                        print(f"❌ Repair failed for {file_path}")
                else:
                    results['failed'] += 1
        
        return results

def main():
    """Main repair function"""
    print("🚀 RomAI Syntax Repair Tool")
    print("=" * 40)
    
    # Set up repair tool for RomAI source directory  
    romai_src = Path("e:/GitHub/codai-project/apps/romai/src")
    repair_tool = SyntaxRepairTool(romai_src)
    
    # Run repairs
    results = repair_tool.repair_all()
    
    # Print summary
    print("\n📊 REPAIR SUMMARY:")
    print(f"Total files checked: {results['total']}")
    print(f"Files with syntax errors: {results['syntax_errors']}")
    print(f"Successfully repaired: {results['repaired']}")
    print(f"Failed to repair: {results['failed']}")
    
    if results['repaired'] > 0:
        print(f"\n✅ Successfully repaired {results['repaired']} files!")
        print("🚀 You can now try starting the RomAI server.")
    else:
        print("\n✅ No repairs needed or no files could be automatically repaired.")

if __name__ == "__main__":
    main()