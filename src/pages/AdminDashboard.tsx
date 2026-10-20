import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../admin/AdminStore';
import { useStore } from '../store/AppStore';
import type { Submission, ArticleStatus } from '../types';
import { downloadArticlePdf } from '../utils/pdf';
import { sanitizeInput } from '../utils/security';

// Predefined comments for editorial decisions
const ACCEPT_COMMENTS = [
  'Scientifically suitable for publication',
  'Clear and well presented',
  'Relevant practical contribution',
  'Suitable after minor corrections',
  'Approved for publication'
];

const REJECT_COMMENTS = [
  'Outside journal scope',
  'Insufficient scientific information',
  'Significant experimental details missing',
  'Manuscript requires substantial revision',
  'Not suitable for publication'
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, isAdmin } = useAdminStore();
  const { submissions, setStatus, addComment, toast } = useStore();

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [decisionComment, setDecisionComment] = useState('');
  const [customComment, setCustomComment] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      navigate('/admin');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (!isAuthenticated || !isAdmin()) {
    return null;
  }

  // Filter submissions
  const filteredSubmissions = submissions.filter(sub => {
    // Status filter
    if (filterStatus !== 'all' && sub.status !== filterStatus) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableText = [
        sub.title,
        sub.submissionId,
        sub.articleId,
        ...sub.authors.map(a => a.fullName),
        ...sub.keywords
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) return false;
    }
    
    return true;
  });

  // Statistics
  const stats = {
    total: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    underReview: submissions.filter(s => s.status === 'editorial_review').length,
    accepted: submissions.filter(s => s.status === 'accepted').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    published: submissions.filter(s => s.status === 'published').length
  };

  const handleAccept = async () => {
    if (!selectedSubmission) return;

    const comment = customComment.trim() || decisionComment;
    if (!comment) {
      toast('Please select or enter a comment', 'warn');
      return;
    }

    try {
      // Change status to accepted
      setStatus(selectedSubmission.id, 'accepted', comment);
      
      // Add comment to submission
      addComment(selectedSubmission.id, 'Editorial Decision', `ACCEPTED: ${comment}`);
      
      // Auto-publish after 1 minute (simulated with setTimeout)
      setTimeout(() => {
        setStatus(selectedSubmission.id, 'published', 'Auto-published by admin system');
        addComment(selectedSubmission.id, 'Publication', 'Article automatically published');
        toast('Article has been published', 'ok');
      }, 60000); // 1 minute

      toast('Submission accepted. Will be published in 1 minute.', 'ok');
      setSelectedSubmission(null);
      setDecisionComment('');
      setCustomComment('');
    } catch (error) {
      toast('Failed to accept submission', 'bad');
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;

    const comment = customComment.trim() || decisionComment;
    if (!comment) {
      toast('Please select or enter a comment', 'warn');
      return;
    }

    try {
      setStatus(selectedSubmission.id, 'rejected', comment);
      addComment(selectedSubmission.id, 'Editorial Decision', `REJECTED: ${comment}`);
      
      toast('Submission rejected', 'warn');
      setSelectedSubmission(null);
      setDecisionComment('');
      setCustomComment('');
    } catch (error) {
      toast('Failed to reject submission', 'bad');
    }
  };

  const handleGeneratePdf = async () => {
    if (!selectedSubmission) return;

    setGeneratingPdf(true);
    try {
      await downloadArticlePdf(selectedSubmission);
      toast('PDF generated successfully', 'ok');
    } catch (error) {
      toast('Failed to generate PDF', 'bad');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-navy text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <span className="px-3 py-1 bg-navy/50 rounded-full text-sm">TLC Journal</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm hover:bg-navy/50 rounded transition"
            >
              View Journal
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard label="Total" value={stats.total} color="slate" />
          <StatCard label="Submitted" value={stats.submitted} color="blue" />
          <StatCard label="Under Review" value={stats.underReview} color="amber" />
          <StatCard label="Accepted" value={stats.accepted} color="green" />
          <StatCard label="Rejected" value={stats.rejected} color="red" />
          <StatCard label="Published" value={stats.published} color="navy" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by title, ID, author, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(sanitizeInput(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="editorial_review">Under Review</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Submission ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSubmissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-sm font-mono text-slate-900">
                      {sub.submissionId || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 max-w-xs truncate">
                      {sub.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {sub.authors[0]?.fullName || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {sub.submittedAt || sub.createdAt}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="px-3 py-1 bg-navy text-white text-sm rounded hover:bg-navy/90 transition"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No submissions found
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-navy text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Review Submission</h2>
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  setDecisionComment('');
                  setCustomComment('');
                }}
                className="text-white/80 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Submission Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-600">Submission ID:</span>
                  <p className="font-mono text-slate-900">{selectedSubmission.submissionId || '—'}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Status:</span>
                  <div className="mt-1">
                    <StatusBadge status={selectedSubmission.status} />
                  </div>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Submitted:</span>
                  <p className="text-slate-900">{selectedSubmission.submittedAt || selectedSubmission.createdAt}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Article Type:</span>
                  <p className="text-slate-900">{selectedSubmission.articleType}</p>
                </div>
              </div>

              {/* Title */}
              <div>
                <h3 className="font-medium text-slate-600 mb-2">Title</h3>
                <p className="text-lg font-semibold text-slate-900">{selectedSubmission.title}</p>
              </div>

              {/* Authors */}
              <div>
                <h3 className="font-medium text-slate-600 mb-2">Authors</h3>
                <div className="space-y-1">
                  {selectedSubmission.authors.map(author => (
                    <div key={author.id} className="text-sm text-slate-700">
                      <span className="font-medium">{author.fullName}</span>
                      {author.corresponding && <span className="ml-2 text-xs bg-navy/10 text-navy px-2 py-0.5 rounded">Corresponding</span>}
                      <span className="text-slate-500 ml-2">{author.affiliation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Abstract */}
              <div>
                <h3 className="font-medium text-slate-600 mb-2">Abstract</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedSubmission.reactionDescription}</p>
              </div>

              {/* Keywords */}
              <div>
                <h3 className="font-medium text-slate-600 mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSubmission.keywords.map((keyword, idx) => (
                    <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* TLC Image */}
              {selectedSubmission.tlcImage && (
                <div>
                  <h3 className="font-medium text-slate-600 mb-2">TLC Photograph</h3>
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <img
                      src={selectedSubmission.tlcImage}
                      alt="TLC Plate"
                      className="max-w-full h-auto mx-auto"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                </div>
              )}

              {/* Reaction Scheme */}
              {selectedSubmission.schemeImage && (
                <div>
                  <h3 className="font-medium text-slate-600 mb-2">Reaction Scheme</h3>
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <img
                      src={selectedSubmission.schemeImage}
                      alt="Reaction Scheme"
                      className="max-w-full h-auto mx-auto"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                </div>
              )}

              {/* Editorial Decision */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-medium text-slate-900 mb-4 text-lg">Editorial Decision</h3>
                
                {/* Predefined Comments */}
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Accept Comments
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {ACCEPT_COMMENTS.map((comment, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setDecisionComment(comment);
                            setCustomComment('');
                          }}
                          className={`px-3 py-2 text-sm text-left rounded border transition ${
                            decisionComment === comment
                              ? 'bg-green-50 border-green-500 text-green-900'
                              : 'bg-white border-slate-300 hover:border-green-300'
                          }`}
                        >
                          {comment}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Reject Comments
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {REJECT_COMMENTS.map((comment, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setDecisionComment(comment);
                            setCustomComment('');
                          }}
                          className={`px-3 py-2 text-sm text-left rounded border transition ${
                            decisionComment === comment
                              ? 'bg-red-50 border-red-500 text-red-900'
                              : 'bg-white border-slate-300 hover:border-red-300'
                          }`}
                        >
                          {comment}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Custom Comment (optional)
                    </label>
                    <textarea
                      value={customComment}
                      onChange={(e) => {
                        setCustomComment(e.target.value);
                        setDecisionComment('');
                      }}
                      placeholder="Enter custom comment..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAccept}
                    disabled={!decisionComment && !customComment.trim()}
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    ✓ Accept & Publish
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!decisionComment && !customComment.trim()}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    ✗ Reject
                  </button>
                  <button
                    onClick={handleGeneratePdf}
                    disabled={generatingPdf}
                    className="px-6 py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy/90 disabled:opacity-50 transition"
                  >
                    {generatingPdf ? 'Generating...' : '📄 Generate PDF'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSubmission(null);
                      setDecisionComment('');
                      setCustomComment('');
                    }}
                    className="px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    slate: 'bg-slate-100 text-slate-900',
    blue: 'bg-blue-100 text-blue-900',
    amber: 'bg-amber-100 text-amber-900',
    green: 'bg-green-100 text-green-900',
    red: 'bg-red-100 text-red-900',
    navy: 'bg-navy/10 text-navy'
  };

  return (
    <div className={`rounded-lg p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: ArticleStatus }) {
  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
    submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
    technical_check: { label: 'Technical Check', color: 'bg-purple-100 text-purple-700' },
    technical_revision: { label: 'Tech Revision', color: 'bg-orange-100 text-orange-700' },
    editorial_review: { label: 'Under Review', color: 'bg-amber-100 text-amber-700' },
    revision_required: { label: 'Revision Required', color: 'bg-yellow-100 text-yellow-700' },
    resubmitted: { label: 'Resubmitted', color: 'bg-blue-100 text-blue-700' },
    accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700' },
    production: { label: 'Production', color: 'bg-indigo-100 text-indigo-700' },
    proof_ready: { label: 'Proof Ready', color: 'bg-cyan-100 text-cyan-700' },
    published: { label: 'Published', color: 'bg-navy text-white' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
    withdrawn: { label: 'Withdrawn', color: 'bg-slate-200 text-slate-600' }
  };

  const config = statusConfig[status] || { label: status, color: 'bg-slate-100 text-slate-700' };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${config.color}`}>
      {config.label}
    </span>
  );
}
