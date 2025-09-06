import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MessageCircle, Send, User } from 'lucide-react';

interface Comment {
  id: number;
  comment_text: string;
  user_name: string;
  created_at: string;
}

interface TaskCommentsProps {
  taskId: number;
  refreshTrigger?: number; // Add refresh trigger prop
}

export function TaskComments({ taskId, refreshTrigger }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { apiRequest } = useApi();
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    loadComments();
  }, [taskId, refreshTrigger]);

  const loadComments = async () => {
    try {
      const data = await apiRequest(`/comments/task/${taskId}`);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await apiRequest(`/comments/task/${taskId}`, {
        method: 'POST',
        body: JSON.stringify({ comment_text: newComment.trim() })
      });
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">{t('task.comments')}</h3>
        <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
          {comments.length}
        </span>
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('task.comment.placeholder')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={submitting}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Adding...' : t('task.add.comment')}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No comments yet. Be the first to add feedback!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{comment.user_name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.comment_text}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}