import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Plus, Search, Filter, FileText, Edit3, Trash2, Eye, Users, Calendar, BookOpen, Target, ClipboardList, Settings, Archive, Globe, Lock } from 'lucide-react';
import { apiClient, ConfluencePage } from '../../lib/api';
import { TeamMember } from '../../types/team';
import { useRBAC } from '../../hooks/useRBAC';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { format } from 'date-fns';
import { RichTextEditor } from './RichTextEditor';
import { PageTemplatesSelector, PageTemplate } from './PageTemplates';
import { ConfluencePageViewer } from './ConfluencePageViewer';

// Configuration types for dynamic behavior
export interface PageTypeConfig {
  value: ConfluencePage['type'];
  label: string;
  icon: React.ReactNode;
  description?: string;
  color?: string;
}

export interface StatusConfig {
  value: ConfluencePage['status'];
  label: string;
  color: string;
  description?: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  width?: string;
}

export interface ConfluencePagesConfig {
  title?: string;
  description?: string;
  pageTypes?: PageTypeConfig[];
  statuses?: StatusConfig[];
  filters?: FilterConfig[];
  showCreateButton?: boolean;
  showStats?: boolean;
  defaultView?: 'list' | 'grid' | 'table';
  enableSearch?: boolean;
  searchPlaceholder?: string;
  itemsPerPage?: number;
  sortOptions?: Array<{ value: string; label: string }>;
  customActions?: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
    action: (page: ConfluencePage) => void;
    condition?: (page: ConfluencePage) => boolean;
  }>;
  customFields?: Array<{
    key: string;
    label: string;
    type: 'text' | 'select' | 'textarea' | 'checkbox' | 'tags';
    options?: string[];
    required?: boolean;
  }>;
}

// Default configurations
const DEFAULT_PAGE_TYPES: PageTypeConfig[] = [
  {
    value: 'documentation',
    label: 'Documentation',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Technical documentation, guides, and references',
    color: 'blue'
  },
  {
    value: 'feature',
    label: 'Features',
    icon: <Target className="w-4 h-4" />,
    description: 'Feature specifications and requirements',
    color: 'green'
  },
  {
    value: 'process',
    label: 'Processes',
    icon: <ClipboardList className="w-4 h-4" />,
    description: 'Team processes and workflows',
    color: 'purple'
  },
  {
    value: 'meeting_notes',
    label: 'Meeting Notes',
    icon: <Calendar className="w-4 h-4" />,
    description: 'Meeting minutes and discussions',
    color: 'orange'
  }
];

const DEFAULT_STATUSES: StatusConfig[] = [
  {
    value: 'draft',
    label: 'Draft',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    description: 'Work in progress'
  },
  {
    value: 'published',
    label: 'Published',
    color: 'bg-green-100 text-green-800 border-green-300',
    description: 'Live and accessible'
  },
  {
    value: 'archived',
    label: 'Archived',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    description: 'No longer active'
  }
];

const DEFAULT_FILTERS: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    placeholder: 'All Status',
    width: 'w-40',
    options: [
      { value: 'all', label: 'All Status' },
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
      { value: 'archived', label: 'Archived' }
    ]
  },
  {
    key: 'type',
    label: 'Type',
    placeholder: 'All Types',
    width: 'w-40',
    options: [
      { value: 'all', label: 'All Types' },
      { value: 'documentation', label: 'Documentation' },
      { value: 'feature', label: 'Features' },
      { value: 'process', label: 'Processes' },
      { value: 'meeting_notes', label: 'Meeting Notes' }
    ]
  }
];

interface ConfluencePagesProps {
  projectId?: string;
  config?: ConfluencePagesConfig;
  onPageCreate?: (page: ConfluencePage) => void;
  onPageUpdate?: (page: ConfluencePage) => void;
  onPageDelete?: (pageId: string) => void;
}

export const ConfluencePages: React.FC<ConfluencePagesProps> = ({ 
  projectId, 
  config = {},
  onPageCreate,
  onPageUpdate,
  onPageDelete
}) => {
  // Merge default config with provided config
  const finalConfig: ConfluencePagesConfig = {
    title: 'Knowledge Base',
    description: 'Create, organize, and manage your team\'s knowledge',
    pageTypes: DEFAULT_PAGE_TYPES,
    statuses: DEFAULT_STATUSES,
    filters: DEFAULT_FILTERS,
    showCreateButton: true,
    showStats: true,
    defaultView: 'list',
    enableSearch: true,
    searchPlaceholder: 'Search pages...',
    itemsPerPage: 20,
    sortOptions: [
      { value: 'updatedAt', label: 'Recently Updated' },
      { value: 'createdAt', label: 'Recently Created' },
      { value: 'title', label: 'Title (A-Z)' },
      { value: 'type', label: 'Type' }
    ],
    customActions: [],
    customFields: [],
    ...config
  };

  const [searchParams] = useSearchParams();
  
  const [pages, setPages] = useState<ConfluencePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<ConfluencePage | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'view' | 'grid' | 'table'>(
    searchParams.get('view') ? 'view' : (finalConfig.defaultView || 'list')
  );
  const [viewPageId, setViewPageId] = useState<string | null>(searchParams.get('view'));
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAssignedToMe, setShowAssignedToMe] = useState(searchParams.get('assignedToMe') === 'true');

  // Dynamic filters state
  const [filters, setFilters] = useState<Record<string, string>>(
    finalConfig.filters?.reduce((acc, filter) => {
      acc[filter.key] = 'all';
      return acc;
    }, {} as Record<string, string>) || {}
  );

  const rbac = useRBAC();
  const { user } = useAuth();
  const { toast } = useToast();

  const loadPages = async () => {
    try {
      setLoading(true);
      const queryParams: any = {};
      if (projectId) queryParams.projectId = projectId;
      if (showAssignedToMe) queryParams.assignedToMe = 'true';
      
      // Apply dynamic filters
      finalConfig.filters?.forEach(filter => {
        const filterValue = filters[filter.key];
        if (filterValue && filterValue !== 'all') {
          queryParams[filter.key] = filterValue;
        }
      });
      
      const data = await apiClient.getConfluencePages(queryParams);
      setPages(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load pages',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, [projectId, filters, showAssignedToMe]);

  // Dynamic helper functions
  const getPageTypeConfig = (type: string): PageTypeConfig => {
    return finalConfig.pageTypes?.find(pt => pt.value === type) || {
      value: type as ConfluencePage['type'],
      label: type,
      icon: <FileText className="w-4 h-4" />
    };
  };

  const getStatusConfig = (status: string): StatusConfig => {
    return finalConfig.statuses?.find(s => s.value === status) || {
      value: status as ConfluencePage['status'],
      label: status,
      color: 'bg-gray-100 text-gray-800'
    };
  };

  const handleCreatePage = async (data: {
    title: string;
    content: string;
    type: ConfluencePage['type'];
    projectId?: string;
    tags: string[];
    isPublic: boolean;
    viewPermissions: string[];
    editPermissions: string[];
    [key: string]: any; // Support custom fields
  }) => {
    try {
      const newPage = await apiClient.createConfluencePage(data);
      toast({
        title: 'Success',
        description: 'Page created successfully'
      });
      setCreateDialogOpen(false);
      loadPages();
      onPageCreate?.(newPage);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create page',
        variant: 'destructive'
      });
    }
  };

  const handleUpdatePage = async (id: string, data: {
    title?: string;
    content?: string;
    status?: ConfluencePage['status'];
    [key: string]: any; // Support custom fields
  }) => {
    try {
      const updatedPage = await apiClient.updateConfluencePage(id, data);
      toast({
        title: 'Success',
        description: 'Page updated successfully'
      });
      setEditDialogOpen(false);
      setSelectedPage(null);
      loadPages();
      onPageUpdate?.(updatedPage);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update page',
        variant: 'destructive'
      });
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      await apiClient.deleteConfluencePage(id);
      toast({
        title: 'Success',
        description: 'Page deleted successfully'
      });
      loadPages();
      onPageDelete?.(id);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete page',
        variant: 'destructive'
      });
    }
  };

  const handleViewPage = (pageId: string) => {
    setViewPageId(pageId);
    setViewMode('view');
  };

  const handleEditFromViewer = (page: ConfluencePage) => {
    setSelectedPage(page);
    setEditDialogOpen(true);
    setViewMode(finalConfig.defaultView || 'list');
  };

  const handleBackToList = () => {
    setViewMode(finalConfig.defaultView || 'list');
    setViewPageId(null);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Filter and sort pages
  const filteredPages = pages
    .filter(page => {
      if (!finalConfig.enableSearch || !searchTerm) return true;
      return page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             page.content.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .filter(page => {
      if (showAssignedToMe && user) {
        return page.assignedTo?._id === user.id;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updatedAt':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredPages.length / (finalConfig.itemsPerPage || 20));
  const paginatedPages = filteredPages.slice(
    (currentPage - 1) * (finalConfig.itemsPerPage || 20),
    currentPage * (finalConfig.itemsPerPage || 20)
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Show page viewer if in view mode
  if (viewMode === 'view' && viewPageId) {
    return (
      <ConfluencePageViewer
        pageId={viewPageId}
        onEdit={handleEditFromViewer}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{finalConfig.title}</h2>
          {finalConfig.description && (
            <p className="text-sm text-gray-600 mt-1">{finalConfig.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-md border">
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="rounded-r-none"
            >
              List
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              Grid
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              onClick={() => setViewMode('table')}
              className="rounded-l-none"
            >
              Table
            </Button>
          </div>
          
          {finalConfig.showCreateButton && rbac.canCreateConfluencePages && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Page
                </Button>
              </DialogTrigger>
              <CreatePageDialog
                onCreatePage={handleCreatePage}
                projectId={projectId}
                config={finalConfig}
              />
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {finalConfig.showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pages</p>
                  <p className="text-2xl font-bold">{pages.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          {finalConfig.pageTypes?.map(type => {
            const count = pages.filter(p => p.type === type.value).length;
            return (
              <Card key={type.value}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{type.label}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                    {type.icon}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {finalConfig.enableSearch && (
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={finalConfig.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}
        
        {/* Dynamic Filters */}
        {finalConfig.filters?.map(filter => (
          <Select
            key={filter.key}
            value={filters[filter.key] || 'all'}
            onValueChange={(value) => handleFilterChange(filter.key, value)}
          >
            <SelectTrigger className={filter.width || 'w-40'}>
              <SelectValue placeholder={filter.placeholder || filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {/* Assignment Filter */}
        <Button
          variant={showAssignedToMe ? "default" : "outline"}
          onClick={() => setShowAssignedToMe(!showAssignedToMe)}
          className="flex items-center space-x-2"
        >
          <Users className="w-4 h-4" />
          <span>Assigned to Me</span>
        </Button>

        {/* Sort Options */}
        {finalConfig.sortOptions && finalConfig.sortOptions.length > 0 && (
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {finalConfig.sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Content based on view mode */}
      {viewMode === 'table' ? (
        <TableView
          pages={paginatedPages}
          config={finalConfig}
          onView={handleViewPage}
          onEdit={(page) => {
            setSelectedPage(page);
            setEditDialogOpen(true);
          }}
          onDelete={handleDeletePage}
          rbac={rbac}
        />
      ) : viewMode === 'grid' ? (
        <GridView
          pages={paginatedPages}
          config={finalConfig}
          onView={handleViewPage}
          onEdit={(page) => {
            setSelectedPage(page);
            setEditDialogOpen(true);
          }}
          onDelete={handleDeletePage}
          rbac={rbac}
        />
      ) : (
        <ListView
          pages={paginatedPages}
          config={finalConfig}
          onView={handleViewPage}
          onEdit={(page) => {
            setSelectedPage(page);
            setEditDialogOpen(true);
          }}
          onDelete={handleDeletePage}
          rbac={rbac}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {(currentPage - 1) * (finalConfig.itemsPerPage || 20) + 1} to{' '}
            {Math.min(currentPage * (finalConfig.itemsPerPage || 20), filteredPages.length)} of{' '}
            {filteredPages.length} results
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredPages.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first page'}
          </p>
          {finalConfig.showCreateButton && rbac.canCreateConfluencePages && !searchTerm && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Page
            </Button>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      {selectedPage && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <EditPageDialog
            page={selectedPage}
            onUpdatePage={handleUpdatePage}
            onClose={() => {
              setEditDialogOpen(false);
              setSelectedPage(null);
            }}
            config={finalConfig}
          />
        </Dialog>
      )}
    </div>
  );
};

// List View Component
const ListView: React.FC<{
  pages: ConfluencePage[];
  config: ConfluencePagesConfig;
  onView: (pageId: string) => void;
  onEdit: (page: ConfluencePage) => void;
  onDelete: (pageId: string) => void;
  rbac: any;
}> = ({ pages, config, onView, onEdit, onDelete, rbac }) => {
  const getPageTypeConfig = (type: string): PageTypeConfig => {
    return config.pageTypes?.find(pt => pt.value === type) || {
      value: type as ConfluencePage['type'],
      label: type,
      icon: <FileText className="w-4 h-4" />
    };
  };

  const getStatusConfig = (status: string): StatusConfig => {
    return config.statuses?.find(s => s.value === status) || {
      value: status as ConfluencePage['status'],
      label: status,
      color: 'bg-gray-100 text-gray-800'
    };
  };

  return (
    <div className="grid gap-4">
      {pages.map((page) => {
        const typeConfig = getPageTypeConfig(page.type);
        const statusConfig = getStatusConfig(page.status);
        
        return (
          <Card key={page._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {typeConfig.icon}
                  <CardTitle className="text-lg">{page.title}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={statusConfig.color}>
                    {statusConfig.label}
                  </Badge>
                  <div title={page.isPublic ? "Public" : "Private"}>
                    {page.isPublic ? (
                      <Globe className="w-4 h-4 text-green-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onView(page._id)}
                      title="View Page"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {rbac.canManageProjects && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(page)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(page._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {/* Custom Actions */}
                    {config.customActions?.map(action => {
                      if (action.condition && !action.condition(page)) return null;
                      return (
                        <Button
                          key={action.key}
                          size="sm"
                          variant="ghost"
                          onClick={() => action.action(page)}
                          title={action.label}
                        >
                          {action.icon}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-600 line-clamp-3">{page.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>Created by {page.createdBy.fullName || page.createdBy.email}</span>
                    <span>{format(new Date(page.createdAt), 'MMM d, yyyy')}</span>
                    {page.assignedTo && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Users className="w-3 h-3" />
                        <span>Assigned to {page.assignedTo.fullName || page.assignedTo.email}</span>
                      </div>
                    )}
                  </div>
                  {page.updatedAt !== page.createdAt && (
                    <span>Updated {format(new Date(page.updatedAt), 'MMM d, yyyy')}</span>
                  )}
                </div>
                {page.tags && page.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {page.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Grid View Component  
const GridView: React.FC<{
  pages: ConfluencePage[];
  config: ConfluencePagesConfig;
  onView: (pageId: string) => void;
  onEdit: (page: ConfluencePage) => void;
  onDelete: (pageId: string) => void;
  rbac: any;
}> = ({ pages, config, onView, onEdit, onDelete, rbac }) => {
  const getPageTypeConfig = (type: string): PageTypeConfig => {
    return config.pageTypes?.find(pt => pt.value === type) || {
      value: type as ConfluencePage['type'],
      label: type,
      icon: <FileText className="w-4 h-4" />
    };
  };

  const getStatusConfig = (status: string): StatusConfig => {
    return config.statuses?.find(s => s.value === status) || {
      value: status as ConfluencePage['status'],
      label: status,
      color: 'bg-gray-100 text-gray-800'
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pages.map((page) => {
        const typeConfig = getPageTypeConfig(page.type);
        const statusConfig = getStatusConfig(page.status);
        
        return (
          <Card key={page._id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onView(page._id)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  {typeConfig.icon}
                  <CardTitle className="text-sm font-medium line-clamp-2">{page.title}</CardTitle>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge className={statusConfig.color}>
                    {statusConfig.label}
                  </Badge>
                  {page.isPublic ? (
                    <Globe className="w-3 h-3 text-green-500" />
                  ) : (
                    <Lock className="w-3 h-3 text-gray-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 line-clamp-3 mb-3">{page.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>{format(new Date(page.updatedAt), 'MMM d')}</span>
                <span>v{page.version}</span>
              </div>
              {page.tags && page.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {page.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {page.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{page.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              <div className="flex justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                {rbac.canManageProjects && (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => onEdit(page)}>
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(page._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Table View Component
const TableView: React.FC<{
  pages: ConfluencePage[];
  config: ConfluencePagesConfig;
  onView: (pageId: string) => void;
  onEdit: (page: ConfluencePage) => void;
  onDelete: (pageId: string) => void;
  rbac: any;
}> = ({ pages, config, onView, onEdit, onDelete, rbac }) => {
  const getPageTypeConfig = (type: string): PageTypeConfig => {
    return config.pageTypes?.find(pt => pt.value === type) || {
      value: type as ConfluencePage['type'],
      label: type,
      icon: <FileText className="w-4 h-4" />
    };
  };

  const getStatusConfig = (status: string): StatusConfig => {
    return config.statuses?.find(s => s.value === status) || {
      value: status as ConfluencePage['status'],
      label: status,
      color: 'bg-gray-100 text-gray-800'
    };
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">Title</th>
                <th className="text-left p-4 font-medium text-gray-900">Type</th>
                <th className="text-left p-4 font-medium text-gray-900">Status</th>
                <th className="text-left p-4 font-medium text-gray-900">Created</th>
                <th className="text-left p-4 font-medium text-gray-900">Updated</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => {
                const typeConfig = getPageTypeConfig(page.type);
                const statusConfig = getStatusConfig(page.status);
                
                return (
                  <tr key={page._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {typeConfig.icon}
                        <div>
                          <div className="font-medium">{page.title}</div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <span>{page.createdBy.fullName || page.createdBy.email}</span>
                            {page.isPublic ? (
                              <Globe className="w-3 h-3 text-green-500" />
                            ) : (
                              <Lock className="w-3 h-3 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{typeConfig.label}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {format(new Date(page.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {format(new Date(page.updatedAt), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => onView(page._id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {rbac.canManageProjects && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => onEdit(page)}>
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDelete(page._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// Create Page Dialog with dynamic configuration
interface CreatePageDialogProps {
  onCreatePage: (data: any) => void;
  projectId?: string;
  config: ConfluencePagesConfig;
}

const CreatePageDialog: React.FC<CreatePageDialogProps> = ({ onCreatePage, projectId, config }) => {
  const [step, setStep] = useState<'template' | 'form'>('template');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: (config.pageTypes?.[0]?.value || 'documentation') as ConfluencePage['type'],
    projectId: projectId || '',
    assignedTo: 'none',
    tags: [] as string[],
    isPublic: false,
    viewPermissions: [] as string[],
    editPermissions: [] as string[],
    // Custom fields
    ...config.customFields?.reduce((acc, field) => {
      acc[field.key] = field.type === 'checkbox' ? false : field.type === 'tags' ? [] : '';
      return acc;
    }, {} as Record<string, any>)
  });

  // Fetch team members on component mount
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const members = await apiClient.getTeamMembers(projectId);
        setTeamMembers(members);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };
    fetchTeamMembers();
  }, [projectId]);

  const handleTemplateSelect = (template: PageTemplate) => {
    setFormData({
      ...formData,
      title: template.name,
      content: template.content,
      type: template.type,
      tags: template.tags
    });
    setStep('form');
  };

  const handleStartFromScratch = () => {
    setStep('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clean the form data before sending
    const cleanedFormData = {
      ...formData,
      assignedTo: formData.assignedTo === 'none' ? undefined : formData.assignedTo
    };
    onCreatePage(cleanedFormData);
  };

  const renderCustomField = (field: any) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={formData[field.key] || ''}
            onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md"
            value={formData[field.key] || ''}
            onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
            rows={3}
          />
        );
      case 'select':
        return (
          <Select 
            value={formData[field.key] || ''} 
            onValueChange={(value) => setFormData({...formData, [field.key]: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData[field.key] || false}
              onChange={(e) => setFormData({...formData, [field.key]: e.target.checked})}
              id={field.key}
            />
            <label htmlFor={field.key} className="text-sm">
              {field.label}
            </label>
          </div>
        );
      case 'tags':
        return (
          <Input
            value={(formData[field.key] || []).join(', ')}
            onChange={(e) => setFormData({
              ...formData, 
              [field.key]: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
            })}
            placeholder="Enter tags separated by commas"
          />
        );
      default:
        return null;
    }
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {step === 'template' ? 'Create New Page' : 'Page Details'}
        </DialogTitle>
        <DialogDescription>
          {step === 'template' 
            ? 'Choose a template to get started quickly, or create a blank page.'
            : 'Fill in the details for your new page.'
          }
        </DialogDescription>
      </DialogHeader>
      
      {step === 'template' ? (
        <PageTemplatesSelector
          onSelectTemplate={handleTemplateSelect}
          onClose={handleStartFromScratch}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter page title"
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value: ConfluencePage['type']) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {config.pageTypes?.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center space-x-2">
                      {type.icon}
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="assignedTo">Assign To</Label>
            <Select value={formData.assignedTo} onValueChange={(value) => setFormData({...formData, assignedTo: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignee (optional)" />
              </SelectTrigger>            <SelectContent>
              <SelectItem value="none">No Assignment</SelectItem>
              {teamMembers.map(member => (
                <SelectItem key={member.userId || member.id} value={member.userId || member.id}>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{member.fullName} ({member.email})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
            </Select>
          </div>

          {/* Custom Fields */}
          {config.customFields?.map(field => (
            <div key={field.key}>
              <Label htmlFor={field.key}>{field.label}</Label>
              {renderCustomField(field)}
            </div>
          ))}

          <div>
            <Label htmlFor="content">Content</Label>
            <RichTextEditor
              value={formData.content}
              onChange={(content) => setFormData({...formData, content})}
              placeholder="Enter page content"
              className="mt-2"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setStep('template')}>
              Back
            </Button>
            <Button type="submit">Create Page</Button>
          </div>
        </form>
      )}
    </DialogContent>
  );
};

// Edit Page Dialog with dynamic configuration
interface EditPageDialogProps {
  page: ConfluencePage;
  onUpdatePage: (id: string, data: any) => void;
  onClose: () => void;
  config: ConfluencePagesConfig;
}

const EditPageDialog: React.FC<EditPageDialogProps> = ({ page, onUpdatePage, onClose, config }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [formData, setFormData] = useState({
    title: page.title,
    content: page.content,
    status: page.status,
    assignedTo: page.assignedTo?._id || 'none',
    // Include custom fields from config
    ...config.customFields?.reduce((acc, field) => {
      // @ts-ignore - Access custom fields on page object
      acc[field.key] = page[field.key] || (field.type === 'checkbox' ? false : field.type === 'tags' ? [] : '');
      return acc;
    }, {} as Record<string, any>)
  });

  // Fetch team members on component mount
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const projectId = typeof page.project === 'string' ? page.project : page.project?._id;
        const members = await apiClient.getTeamMembers(projectId);
        setTeamMembers(members);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };
    fetchTeamMembers();
  }, [page.project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clean the form data before sending
    const cleanedFormData = {
      ...formData,
      assignedTo: formData.assignedTo === 'none' ? undefined : formData.assignedTo
    };
    onUpdatePage(page._id, cleanedFormData);
  };

  const renderCustomField = (field: any) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={formData[field.key] || ''}
            onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md"
            value={formData[field.key] || ''}
            onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
            rows={3}
          />
        );
      case 'select':
        return (
          <Select 
            value={formData[field.key] || ''} 
            onValueChange={(value) => setFormData({...formData, [field.key]: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData[field.key] || false}
              onChange={(e) => setFormData({...formData, [field.key]: e.target.checked})}
              id={field.key}
            />
            <label htmlFor={field.key} className="text-sm">
              {field.label}
            </label>
          </div>
        );
      case 'tags':
        return (
          <Input
            value={(formData[field.key] || []).join(', ')}
            onChange={(e) => setFormData({
              ...formData, 
              [field.key]: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
            })}
            placeholder="Enter tags separated by commas"
          />
        );
      default:
        return null;
    }
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Page</DialogTitle>
        <DialogDescription>
          Update the page content and properties.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: ConfluencePage['status']) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {config.statuses?.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="assignedTo">Assign To</Label>
          <Select value={formData.assignedTo} onValueChange={(value) => setFormData({...formData, assignedTo: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select assignee (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Assignment</SelectItem>
              {teamMembers.map(member => (
                <SelectItem key={member.userId || member.id} value={member.userId || member.id}>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{member.fullName} ({member.email})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Fields */}
        {config.customFields?.map(field => (
          <div key={field.key}>
            <Label htmlFor={field.key}>{field.label}</Label>
            {renderCustomField(field)}
          </div>
        ))}

        <div>
          <Label htmlFor="content">Content</Label>
          <RichTextEditor
            value={formData.content}
            onChange={(content) => setFormData({...formData, content})}
            placeholder="Enter page content"
            className="mt-2"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Update Page</Button>
        </div>
      </form>
    </DialogContent>
  );
};
