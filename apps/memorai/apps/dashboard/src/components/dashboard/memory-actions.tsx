import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMemoryStore } from '../../stores/memory-store';

interface MemoryActionsProps {
  onToggleNewMemory?: () => void;
}

export function MemoryActions({ onToggleNewMemory }: MemoryActionsProps) {
  const [showNewMemoryModal, setShowNewMemoryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMemory, setNewMemory] = useState({
    content: '',
    type: 'note' as 'note' | 'reminder' | 'task',
    tags: '',
    category: '',
  });

  const { addMemory } = useMemoryStore();

  const handleToggle = () => {
    const newState = !showNewMemoryModal;
    setShowNewMemoryModal(newState);
    onToggleNewMemory?.();
  };

  const handleClose = () => {
    setShowNewMemoryModal(false);
    setNewMemory({
      content: '',
      type: 'note' as 'note' | 'reminder' | 'task',
      tags: '',
      category: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMemory.content.trim()) {
      toast.error('Content is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedTags = newMemory.tags.split(',').map(tag => tag.trim()).filter(Boolean);

      await addMemory(newMemory.content, {
        tags: parsedTags,
        source: 'dashboard',
        importance: 0.5,
      });

      toast.success('Memory added successfully!');
      handleClose();
    } catch (error) {
      console.error('Error adding memory:', error);
      toast.error('Failed to add memory');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        type="button"
        data-testid="add-memory-button"
      >
        <Plus size={20} />
        Add Memory
      </button>

      {showNewMemoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add New Memory</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
                data-testid="close-modal"
                type="button"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  data-testid="content-input"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter memory content..."
                  value={newMemory.content}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  data-testid="type-select"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={newMemory.type}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, type: e.target.value as 'note' | 'reminder' | 'task' }))}
                >
                  <option value="note">Note</option>
                  <option value="reminder">Reminder</option>
                  <option value="task">Task</option>
                </select>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  data-testid="tags-input"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="tag1, tag2, tag3"
                  value={newMemory.tags}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  data-testid="category-input"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="general"
                  value={newMemory.category}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  data-testid="cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  data-testid="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Memory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
