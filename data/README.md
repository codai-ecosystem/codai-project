# 📊 Data Directory

Consolidated data management for the CODAI ecosystem.

## 📁 Directory Structure

### `/cbd/` - CBD (Core Business Data)

- Core business data and configurations
- Moved from root `cbd-data/` folder

### `/memorai/` - MemorAI Data

- MemorAI service data and memory storage
- Moved from root `memorai-cbd-data/` folder

### `/test/` - Test Data

- Test datasets and test-specific data files
- Moved from root `test-memorai-cbd-data/` folder

## 🔄 Data Organization Benefits

- **Centralized Management**: All data in one location
- **Clear Separation**: Production vs test data clearly separated
- **Better Security**: Easier to apply security policies
- **Simplified Backups**: Single data directory to backup

## 🛠️ Usage

Applications will need to update their data paths to reference the new locations:

- `cbd-data/` → `data/cbd/`
- `memorai-cbd-data/` → `data/memorai/`
- `test-memorai-cbd-data/` → `data/test/`
