import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  FileText, 
  Edit3, 
  Share2, 
  Clock, 
  User, 
  Tag, 
  ArrowLeft, 
  History,
  Eye,
  Lock,
  Globe
} from 'lucide-react';
import { apiClient, ConfluencePage } from '../../lib/api';
import { useRBAC } from '../../hooks/useRBAC';
import { useToast } from '../../hooks/use-toast';
import { format } from 'date-fns';

interface ConfluencePageViewerProps {
  pageId: string;
  onEdit?: (page: ConfluencePage) => void;
  onBack?: () => void;
}

export const ConfluencePageViewer: React.FC<ConfluencePageViewerProps> = ({
  pageId,
  onEdit,
  onBack
}) => {
  const [page, setPage] = useState<ConfluencePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<any[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const rbac = useRBAC();
  const { toast } = useToast();

  useEffect(() => {
    loadPage();
    loadVersionHistory();
  }, [pageId]);

  const loadPage = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getConfluencePage(pageId);
      setPage(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load page',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVersionHistory = async () => {
    try {
      // This would be implemented in the API
      // const versions = await apiClient.getPageVersions(pageId);
      // setVersions(versions);
    } catch (error) {
      console.error('Failed to load version history:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'published': return 'bg-green-100 text-green-800 border-green-300';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'documentation': return <FileText className="w-5 h-5" />;
      case 'process': return <User className="w-5 h-5" />;
      case 'meeting_notes': return <Clock className="w-5 h-5" />;
      case 'feature': return <Tag className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Success',
        description: 'Page URL copied to clipboard'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy URL',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Page not found</h3>
        <p className="text-gray-500">The page you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mt-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <div className="flex items-center space-x-3 mb-2">
              {getTypeIcon(page.type)}
              <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <Badge className={getStatusColor(page.status)}>
                {page.status}
              </Badge>
              <div className="flex items-center space-x-1">
                {page.isPublic ? (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Public</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Private</span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>Version {page.version}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          {versions.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
          )}
          {rbac.canManageProjects && onEdit && (
            <Button onClick={() => onEdit(page)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Page Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Created</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{page.createdBy?.fullName || page.createdBy?.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                <Clock className="w-4 h-4" />
                <span>{format(new Date(page.createdAt), 'PPp')}</span>
              </div>
            </div>

            {page.updatedAt !== page.createdAt && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Last Modified</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{page.lastModifiedBy?.fullName || page.lastModifiedBy?.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(page.updatedAt), 'PPp')}</span>
                </div>
              </div>
            )}

            {page.tags && page.tags.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {page.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Page Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none">
            {page.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Version History */}
      {showVersionHistory && versions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Version History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {versions.map((version, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Version {version.version}</div>
                    <div className="text-sm text-gray-500">
                      Modified by {version.lastModifiedBy?.fullName || version.lastModifiedBy?.email}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(version.updatedAt), 'PPp')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
