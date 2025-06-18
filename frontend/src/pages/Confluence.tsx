import React, { useState } from 'react';
import { ConfluencePages, ConfluencePagesConfig } from '@/components/confluence/ConfluencePages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen, Target, ClipboardList, Calendar, TrendingUp, Archive, Share2, Download, Star } from 'lucide-react';

const Confluence = () => {
  const [activeTab, setActiveTab] = useState('all');

  // Dynamic configuration for different tab contexts
  const baseConfig: ConfluencePagesConfig = {
    title: 'Knowledge Base',
    description: 'Create, organize, and manage your team\'s knowledge',
    showStats: true,
    enableSearch: true,
    defaultView: 'list',
    itemsPerPage: 15,
    customActions: [
      {
        key: 'archive',
        label: 'Archive',
        icon: <Archive className="w-4 h-4" />,
        action: (page) => {
          console.log('Archiving page:', page.title);
          // Custom archive logic here
        },
        condition: (page) => page.status !== 'archived'
      },
      {
        key: 'share',
        label: 'Share',
        icon: <Share2 className="w-4 h-4" />,
        action: (page) => {
          navigator.clipboard.writeText(window.location.origin + `/confluence/page/${page._id}`);
          // Show toast notification
        }
      },
      {
        key: 'star',
        label: 'Star',
        icon: <Star className="w-4 h-4" />,
        action: (page) => {
          console.log('Starring page:', page.title);
          // Custom star logic here
        }
      }
    ],
    customFields: [
      {
        key: 'priority',
        label: 'Priority',
        type: 'select',
        options: ['Low', 'Medium', 'High', 'Critical'],
        required: false
      },
      {
        key: 'department',
        label: 'Department',
        type: 'select',
        options: ['Engineering', 'Product', 'Design', 'Marketing', 'Sales'],
        required: false
      }
    ]
  };

  const documentationConfig: ConfluencePagesConfig = {
    ...baseConfig,
    title: 'Documentation',
    description: 'Technical documentation, guides, and reference materials',
    filters: [
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
        key: 'complexity',
        label: 'Complexity',
        placeholder: 'All Levels',
        width: 'w-40',
        options: [
          { value: 'all', label: 'All Levels' },
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' }
        ]
      }
    ],
    pageTypes: [
      {
        value: 'documentation',
        label: 'Documentation',
        icon: <BookOpen className="w-4 h-4" />,
        description: 'Technical documentation and guides',
        color: 'blue'
      }
    ]
  };

  const featureConfig: ConfluencePagesConfig = {
    ...baseConfig,
    title: 'Feature Specifications',
    description: 'Feature requirements, specifications, and acceptance criteria',
    filters: [
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
        key: 'priority',
        label: 'Priority',
        placeholder: 'All Priorities',
        width: 'w-40',
        options: [
          { value: 'all', label: 'All Priorities' },
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
          { value: 'critical', label: 'Critical' }
        ]
      }
    ],
    pageTypes: [
      {
        value: 'feature',
        label: 'Features',
        icon: <Target className="w-4 h-4" />,
        description: 'Feature specifications and requirements',
        color: 'green'
      }
    ]
  };

  const processConfig: ConfluencePagesConfig = {
    ...baseConfig,
    title: 'Process Documentation',
    description: 'Team processes, workflows, and standard operating procedures',
    defaultView: 'table',
    pageTypes: [
      {
        value: 'process',
        label: 'Processes',
        icon: <ClipboardList className="w-4 h-4" />,
        description: 'Team processes and workflows',
        color: 'purple'
      }
    ]
  };

  const meetingConfig: ConfluencePagesConfig = {
    ...baseConfig,
    title: 'Meeting Notes',
    description: 'Meeting minutes, decisions, and action items',
    defaultView: 'grid',
    sortOptions: [
      { value: 'updatedAt', label: 'Recently Updated' },
      { value: 'createdAt', label: 'Recently Created' },
      { value: 'meetingDate', label: 'Meeting Date' }
    ],
    pageTypes: [
      {
        value: 'meeting_notes',
        label: 'Meeting Notes',
        icon: <Calendar className="w-4 h-4" />,
        description: 'Meeting minutes and discussions',
        color: 'orange'
      }
    ],
    customFields: [
      ...baseConfig.customFields || [],
      {
        key: 'meetingDate',
        label: 'Meeting Date',
        type: 'text',
        required: true
      },
      {
        key: 'attendees',
        label: 'Attendees',
        type: 'tags',
        required: false
      }
    ]
  };

  const stats = [
    {
      title: 'Total Pages',
      value: '24',
      icon: <FileText className="w-5 h-5" />,
      change: '+3 this week',
      changeType: 'positive'
    },
    {
      title: 'Documentation',
      value: '12',
      icon: <BookOpen className="w-5 h-5" />,
      change: '+2 this week',
      changeType: 'positive'
    },
    {
      title: 'Features',
      value: '8',
      icon: <Target className="w-5 h-5" />,
      change: '+1 this week',
      changeType: 'positive'
    },
    {
      title: 'Processes',
      value: '4',
      icon: <ClipboardList className="w-5 h-5" />,
      change: 'No change',
      changeType: 'neutral'
    }
  ];

  // Event handlers for page operations
  const handlePageCreate = (page: any) => {
    console.log('Page created:', page);
    // Custom logic after page creation
  };

  const handlePageUpdate = (page: any) => {
    console.log('Page updated:', page);
    // Custom logic after page update
  };

  const handlePageDelete = (pageId: string) => {
    console.log('Page deleted:', pageId);
    // Custom logic after page deletion
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          {/* <p className="text-lg text-muted-foreground">
            Centralized documentation, processes, and team knowledge
          </p> */}
        </div>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3" />
                <span>{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div> */}

      Quick Access Tabs
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            All Pages
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Docs
          </TabsTrigger>
          <TabsTrigger value="feature" className="flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Features
          </TabsTrigger>
          <TabsTrigger value="process" className="flex items-center">
            <ClipboardList className="w-4 h-4 mr-2" />
            Processes
          </TabsTrigger>
          <TabsTrigger value="meeting_notes" className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Meetings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ConfluencePages 
            config={baseConfig}
            onPageCreate={handlePageCreate}
            onPageUpdate={handlePageUpdate}
            onPageDelete={handlePageDelete}
          />
        </TabsContent>

        <TabsContent value="documentation">
          <ConfluencePages 
            config={documentationConfig}
            onPageCreate={handlePageCreate}
            onPageUpdate={handlePageUpdate}
            onPageDelete={handlePageDelete}
          />
        </TabsContent>

        <TabsContent value="feature">
          <ConfluencePages 
            config={featureConfig}
            onPageCreate={handlePageCreate}
            onPageUpdate={handlePageUpdate}
            onPageDelete={handlePageDelete}
          />
        </TabsContent>

        <TabsContent value="process">
          <ConfluencePages 
            config={processConfig}
            onPageCreate={handlePageCreate}
            onPageUpdate={handlePageUpdate}
            onPageDelete={handlePageDelete}
          />
        </TabsContent>

        <TabsContent value="meeting_notes">
          <ConfluencePages 
            config={meetingConfig}
            onPageCreate={handlePageCreate}
            onPageUpdate={handlePageUpdate}
            onPageDelete={handlePageDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Confluence;
