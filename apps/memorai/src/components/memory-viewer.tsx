'use client';

import React from 'react';
import { Memory } from '@/types/memory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Edit, Trash2, Star, Calendar, Tag, User } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface MemoryViewerProps {
    memory: Memory;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export const MemoryViewer: React.FC<MemoryViewerProps> = ({
    memory,
    onClose,
    onEdit,
    onDelete,
}) => {
    const getCategoryColor = (category: string) => {
        const colors = {
            development: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            testing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            planning: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            general: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
            personal: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            work: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return colors[category as keyof typeof colors] || colors.general;
    };

    const getImportanceColor = (importance: number) => {
        if (importance >= 9) return 'text-red-500';
        if (importance >= 7) return 'text-yellow-500';
        if (importance >= 5) return 'text-blue-500';
        return 'text-gray-400';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <Badge className={getCategoryColor(memory.category)}>
                                {memory.category}
                            </Badge>
                            <div className="flex items-center space-x-1">
                                <Star 
                                    className={`h-5 w-5 ${getImportanceColor(memory.importance || 5)}`}
                                    fill={memory.importance && memory.importance >= 8 ? "currentColor" : "none"}
                                />
                                <span className="text-sm text-gray-500">
                                    {memory.importance || 5}/10
                                </span>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <CardTitle className="text-xl">Memory Details</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                    {/* Content */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Content
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                                {memory.content}
                            </p>
                        </div>
                    </div>

                    {/* Tags */}
                    {memory.tags && memory.tags.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                <Tag className="h-4 w-4 mr-1" />
                                Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {memory.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Created
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {format(new Date(memory.createdAt), 'PPP p')}
                            </p>
                            <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true })}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Last Updated
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {format(new Date(memory.updatedAt), 'PPP p')}
                            </p>
                            <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(memory.updatedAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>

                    {/* User Info */}
                    {memory.userId && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                Owner
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {memory.userId}
                            </p>
                        </div>
                    )}

                    {/* Privacy */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Privacy
                        </h3>
                        <Badge variant={memory.isPublic ? "default" : "secondary"}>
                            {memory.isPublic ? "Public" : "Private"}
                        </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex space-x-3">
                            <Button onClick={onEdit} variant="outline">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            <Button 
                                onClick={onDelete} 
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                        <Button onClick={onClose} variant="ghost">
                            Close
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MemoryViewer;
