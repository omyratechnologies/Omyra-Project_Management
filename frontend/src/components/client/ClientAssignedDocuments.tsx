import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Eye, 
  Clock, 
  User,
  BookOpen, 
  Target, 
  ClipboardList, 
  Calendar,
  ExternalLink
} from 'lucide-react';
import { apiClient, ConfluencePage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ClientAssignedDocumentsProps {
  limit?: number;
  showHeader?: boolean;
}

const getPageTypeIcon = (type: string) => {
  switch (type) {
    case 'documentation':
      return <BookOpen className="w-4 h-4 text-blue-500" />;
    case 'feature':
      return <Target className="w-4 h-4 text-green-500" />;
    case 'process':
      return <ClipboardList className="w-4 h-4 text-purple-500" />;
    case 'meeting_notes':
      return <Calendar className="w-4 h-4 text-orange-500" />;
    default:
      return <FileText className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'published':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Published</Badge>;
    case 'draft':
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Draft</Badge>;
    case 'archived':
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Archived</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const ClientAssignedDocuments: React.FC<ClientAssignedDocumentsProps> = ({ 
  limit = 5, 
  showHeader = true 
}) => {
  const [assignedPages, setAssignedPages] = useState<ConfluencePage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedPages = async () => {
      try {
        setLoading(true);
        // Fetch pages assigned to the current user
        const pages = await apiClient.getConfluencePages({ assignedToMe: 'true' });
        setAssignedPages(pages.slice(0, limit));
      } catch (error) {
        console.error('Error fetching assigned pages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load assigned documents.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAssignedPages();
    }
  }, [user, limit, toast]);

  const handleViewPage = (pageId: string) => {
    navigate(`/confluence?view=${pageId}`);
  };

  const handleViewAllDocuments = () => {
    navigate('/confluence?assignedToMe=true');
  };

  if (loading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Assigned Documents
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assignedPages.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Assigned Documents
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No documents assigned to you</p>
            <p className="text-xs text-gray-400 mt-1">
              Documents assigned to you will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Assigned Documents
          </CardTitle>
          {assignedPages.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleViewAllDocuments}
              className="text-blue-600 hover:text-blue-700"
            >
              View All
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          )}
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {assignedPages.map((page, index) => (
            <div 
              key={page._id}
              className={`flex items-start justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors ${
                index !== assignedPages.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {getPageTypeIcon(page.type)}
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {page.title}
                  </h4>
                  {getStatusBadge(page.status)}
                </div>
                
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                  {page.content?.replace(/<[^>]*>/g, '').substring(0, 100)}...
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>By {page.createdBy?.fullName || page.createdBy?.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{format(new Date(page.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  {page.tags && page.tags.length > 0 && (
                    <div className="flex gap-1">
                      {page.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {page.tags.length > 2 && (
                        <span className="text-xs text-gray-400">+{page.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleViewPage(page._id)}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                  title="View Document"
                >
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {assignedPages.length === limit && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleViewAllDocuments}
            >
              View All Assigned Documents
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientAssignedDocuments;
