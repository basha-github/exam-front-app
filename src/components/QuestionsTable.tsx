import React, { useState, useEffect } from 'react';
import { CheckCircle2, Pencil, Trash2, X, Save, Loader2, Eye } from 'lucide-react';
import NavBar from './NavBar';

interface Question {
  ans: string;
  content: string;
  explaination: string;
  opt1: string;
  opt2: string;
  opt3: string;
  opt4: string;
  qno: string;
  topic: string;
}

interface EditFormData {
  content: string;
  opt1: string;
  opt2: string;
  opt3: string;
  opt4: string;
  ans: string;
  explaination: string;
  topic: string;
}

const API_BASE_URL = 'https://crt-exam-app.onrender.com/api/excel/all/questions';

const QuestionsTable: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}`);
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setQuestions([
        {
          "ans": "2.0",
          "content": "What will be the following statement return, If it is 5 minutes past noon on 15 Jan 2012? (Marks 2)\nSELECT ROUND(SYSDATE) - ROUND(SYSDATE,'Y') FROM dual;",
          "explaination": "to be filled later with large paragraph",
          "opt1": "15.5",
          "opt2": "15",
          "opt3": "0",
          "opt4": "16",
          "qno": "ea3df600-4a1f-46bf-911c-0e41684c1294",
          "topic": "SQL"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (qno: string) => {
    if (editingId === qno) return;
    setExpandedRow(expandedRow === qno ? null : qno);
  };

  const startEdit = (q: Question) => {
    setEditingId(q.qno);
    setEditForm({
      content: q.content,
      opt1: q.opt1,
      opt2: q.opt2,
      opt3: q.opt3,
      opt4: q.opt4,
      ans: q.ans,
      explaination: q.explaination,
      topic: q.topic
    });
    setExpandedRow(q.qno);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleEditChange = (field: keyof EditFormData, value: string) => {
    setEditForm(prev => prev ? { ...prev, [field]: value } : null);
  };

  const saveEdit = async (qno: string) => {
    if (!editForm) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${qno}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const updatedQuestion = await response.json();
        setQuestions(prev => prev.map(q => q.qno === qno ? updatedQuestion : q));
        setEditingId(null);
        setEditForm(null);
      } else {
        alert('Failed to update question');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Network error while updating');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (qno: string) => {
    setDeleteConfirm(qno);
  };

  const executeDelete = async (qno: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${qno}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setQuestions(prev => prev.filter(q => q.qno !== qno));
        setDeleteConfirm(null);
        setExpandedRow(null);
      } else {
        alert('Failed to delete question');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Network error while deleting');
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const getOptionLabel = (index: number): string => {
    return String.fromCharCode(65 + index);
  };

  const getCorrectOptionIndex = (q: Question): number => {
    const options = [q.opt1, q.opt2, q.opt3, q.opt4];
    return options.findIndex(opt => opt === q.ans);
  };

  const truncateText = (text: string, maxLength: number = 80): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div>
    <div>

      <NavBar />
    </div>
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Question Bank</h1>
            <p className="text-slate-500 mt-1 text-sm">{questions.length} questions</p>
          </div>
          <button 
            onClick={fetchQuestions}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all text-sm font-medium shadow-sm"
          >
            Refresh
          </button>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-200">
            {questions.map((q, index) => {
              const correctIdx = getCorrectOptionIndex(q);
              const isExpanded = expandedRow === q.qno;
              const isEditing = editingId === q.qno;
              const isDeleting = deleteConfirm === q.qno;
              
              return (
                <div key={q.qno} className="group">
                  {/* Single Line Header */}
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    {/* Question Number */}
                    <span className="flex-shrink-0 w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    
                    
                   
                      <p className="text-slate-800 text-sm truncate">
                        {truncateText(q.content, 90)}
                      </p>
                  
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(q.qno);
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium border transition-all ${
                          isExpanded 
                            ? 'bg-slate-100 text-slate-700 border-slate-300' 
                            : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50'
                        }`}
                      >
                        <Eye size={14} />
                        <span className="hidden sm:inline">View</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(q);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-white text-slate-600 border border-slate-300 hover:border-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-all"
                      >
                        <Pencil size={14} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(q.qno);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-white text-slate-600 border border-slate-300 hover:border-red-500 hover:text-red-700 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                                     </div>

                  {/* Delete Confirmation */}
                  {isDeleting && (
                    <div className="px-4 py-3 bg-red-50 border-y border-red-100 mx-4 mb-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-red-800">Confirm Deletion</p>
                          <p className="text-xs text-red-600 mt-0.5">This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => executeDelete(q.qno)}
                            disabled={loading}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            {loading ? 'Deleting...' : 'Confirm'}
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expanded Content */}
                  {isExpanded && !isDeleting && (
                    <div className="px-4 pb-4 bg-slate-50 border-t border-slate-200">
                      {isEditing && editForm ? (
                        /* Edit Form */
                        <div className="pt-4 space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Question Content</label>
                            <textarea
                              value={editForm.content}
                              onChange={(e) => handleEditChange('content', e.target.value)}
                              className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {['opt1', 'opt2', 'opt3', 'opt4'].map((opt, idx) => (
                              <div key={opt}>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                  Option {getOptionLabel(idx)}
                                  
                                </label>
                                <input
                                  type="text"
                                  value={editForm[opt as keyof EditFormData]}
                                  onChange={(e) => handleEditChange(opt as keyof EditFormData, e.target.value)}
                                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Correct Answer</label>
                              <input
                                type="text"
                                value={editForm.ans}
                                onChange={(e) => handleEditChange('ans', e.target.value)}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Topic</label>
                              <input
                                type="text"
                                value={editForm.topic}
                                onChange={(e) => handleEditChange('topic', e.target.value)}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Explanation</label>
                            <textarea
                              value={editForm.explaination}
                              onChange={(e) => handleEditChange('explaination', e.target.value)}
                              className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                              rows={2}
                            />
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => saveEdit(q.qno)}
                              disabled={loading}
                              className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 text-sm font-semibold shadow-sm"
                            >
                              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                              Save Changes
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-semibold"
                            >
                              <X size={16} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div className="pt-4">
                          {/* Full Question */}
                          <div className="mb-4 p-4 bg-white rounded-lg border border-slate-200">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Question</p>
                            <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line">
                              {q.content}
                            </p>
                          </div>

                          {/* Options */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            {[q.opt1, q.opt2, q.opt3, q.opt4].map((opt, idx) => {
                              const isCorrect = idx === correctIdx;
                              return (
                                <div 
                                  key={idx}
                                  className={`flex items-center gap-3 p-3.5 rounded-lg text-sm border ${
                                    isCorrect 
                                      ? 'bg-green-50 border-green-300 text-green-900' 
                                      : 'bg-white border-slate-200 text-slate-700'
                                  }`}
                                >
                                  <span className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold ${
                                    isCorrect ? 'bg-green-200 text-green-800' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {getOptionLabel(idx)}{")    "}
                                  </span>
                                  <span className="font-medium">{opt}</span>
                                  {isCorrect && <CheckCircle2 size={18} className="ml-auto text-green-600" />}
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation */}
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                              Explanation
                            </p>
                            <p className="text-sm text-amber-900 leading-relaxed">
                              {q.explaination === "to be filled later with large paragraph" 
                                ? "Explanation will be added soon." 
                                : q.explaination}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {questions.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No questions available
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default QuestionsTable;