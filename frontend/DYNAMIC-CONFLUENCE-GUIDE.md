# Dynamic ConfluencePages Component Guide

## Overview

The ConfluencePages component has been completely redesigned to be fully dynamic and configurable. This allows you to customize every aspect of the component's behavior, appearance, and functionality through configuration objects.

## Key Features

### 🎯 **Fully Configurable**
- Custom page types with icons and colors
- Dynamic status configurations
- Flexible filtering options
- Customizable UI elements

### 🔧 **Multiple View Modes**
- **List View**: Traditional card-based layout
- **Grid View**: Compact grid layout for quick browsing
- **Table View**: Detailed tabular display

### 🚀 **Extensible Actions**
- Add custom actions to page cards
- Conditional action visibility
- Custom event handlers

### 📝 **Custom Fields**
- Add custom form fields for page creation/editing
- Support for text, textarea, select, checkbox, and tags
- Required field validation

### 🎨 **Dynamic Filters**
- Configure any number of filter dropdowns
- Custom filter options and labels
- Responsive filter layout

## Configuration Interface

```typescript
interface ConfluencePagesConfig {
  title?: string;                    // Component title
  description?: string;              // Component description
  pageTypes?: PageTypeConfig[];      // Custom page types
  statuses?: StatusConfig[];         // Custom status configurations
  filters?: FilterConfig[];          // Dynamic filter configurations
  showCreateButton?: boolean;        // Show/hide create button
  showStats?: boolean;              // Show/hide statistics cards
  defaultView?: 'list' | 'grid' | 'table'; // Default view mode
  enableSearch?: boolean;           // Enable/disable search
  searchPlaceholder?: string;       // Search input placeholder
  itemsPerPage?: number;           // Pagination size
  sortOptions?: Array<{ value: string; label: string }>; // Sort options
  customActions?: CustomAction[];   // Custom page actions
  customFields?: CustomField[];     // Custom form fields
}
```

## Usage Examples

### Basic Usage

```tsx
import { ConfluencePages } from '@/components/confluence/ConfluencePages';

export const MyKnowledgeBase = () => {
  return (
    <ConfluencePages />
  );
};
```

### Custom Configuration

```tsx
import { ConfluencePages, ConfluencePagesConfig } from '@/components/confluence/ConfluencePages';
import { BookOpen, Target, Settings } from 'lucide-react';

const config: ConfluencePagesConfig = {
  title: 'Project Documentation',
  description: 'Technical documentation for our projects',
  defaultView: 'grid',
  itemsPerPage: 12,
  pageTypes: [
    {
      value: 'documentation',
      label: 'Documentation',
      icon: <BookOpen className="w-4 h-4" />,
      description: 'Technical guides and references',
      color: 'blue'
    },
    {
      value: 'feature',
      label: 'Features',
      icon: <Target className="w-4 h-4" />,
      description: 'Feature specifications',
      color: 'green'
    }
  ],
  customActions: [
    {
      key: 'export',
      label: 'Export',
      icon: <Download className="w-4 h-4" />,
      action: (page) => {
        // Custom export logic
        console.log('Exporting:', page.title);
      }
    }
  ]
};

export const ProjectDocs = () => {
  return (
    <ConfluencePages 
      config={config}
      onPageCreate={(page) => console.log('Created:', page)}
      onPageUpdate={(page) => console.log('Updated:', page)}
      onPageDelete={(pageId) => console.log('Deleted:', pageId)}
    />
  );
};
```

### Context-Specific Configurations

```tsx
// Documentation-focused configuration
const docsConfig: ConfluencePagesConfig = {
  title: 'Technical Documentation',
  defaultView: 'table',
  pageTypes: [
    {
      value: 'documentation',
      label: 'Documentation',
      icon: <BookOpen className="w-4 h-4" />,
      color: 'blue'
    }
  ],
  filters: [
    {
      key: 'complexity',
      label: 'Complexity',
      placeholder: 'All Levels',
      options: [
        { value: 'all', label: 'All Levels' },
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' }
      ]
    }
  ],
  customFields: [
    {
      key: 'complexity',
      label: 'Complexity Level',
      type: 'select',
      options: ['Beginner', 'Intermediate', 'Advanced'],
      required: true
    }
  ]
};

// Meeting notes configuration
const meetingConfig: ConfluencePagesConfig = {
  title: 'Meeting Notes',
  defaultView: 'grid',
  pageTypes: [
    {
      value: 'meeting_notes',
      label: 'Meeting Notes',
      icon: <Calendar className="w-4 h-4" />,
      color: 'orange'
    }
  ],
  customFields: [
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
  ],
  sortOptions: [
    { value: 'meetingDate', label: 'Meeting Date' },
    { value: 'updatedAt', label: 'Recently Updated' }
  ]
};
```

## Configuration Options

### Page Type Configuration

```typescript
interface PageTypeConfig {
  value: ConfluencePage['type'];
  label: string;
  icon: React.ReactNode;
  description?: string;
  color?: string;
}
```

**Example:**
```tsx
pageTypes: [
  {
    value: 'documentation',
    label: 'Documentation',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Technical documentation and guides',
    color: 'blue'
  }
]
```

### Status Configuration

```typescript
interface StatusConfig {
  value: ConfluencePage['status'];
  label: string;
  color: string;
  description?: string;
}
```

**Example:**
```tsx
statuses: [
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
  }
]
```

### Filter Configuration

```typescript
interface FilterConfig {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  width?: string;
}
```

**Example:**
```tsx
filters: [
  {
    key: 'priority',
    label: 'Priority',
    placeholder: 'All Priorities',
    width: 'w-40',
    options: [
      { value: 'all', label: 'All Priorities' },
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' }
    ]
  }
]
```

### Custom Actions

```typescript
interface CustomAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  action: (page: ConfluencePage) => void;
  condition?: (page: ConfluencePage) => boolean;
}
```

**Example:**
```tsx
customActions: [
  {
    key: 'archive',
    label: 'Archive',
    icon: <Archive className="w-4 h-4" />,
    action: (page) => {
      // Archive logic
      archivePage(page._id);
    },
    condition: (page) => page.status !== 'archived'
  },
  {
    key: 'share',
    label: 'Share',
    icon: <Share2 className="w-4 h-4" />,
    action: (page) => {
      navigator.clipboard.writeText(
        `${window.location.origin}/confluence/page/${page._id}`
      );
    }
  }
]
```

### Custom Fields

```typescript
interface CustomField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'checkbox' | 'tags';
  options?: string[];
  required?: boolean;
}
```

**Example:**
```tsx
customFields: [
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    options: ['Low', 'Medium', 'High', 'Critical'],
    required: false
  },
  {
    key: 'isConfidential',
    label: 'Confidential',
    type: 'checkbox',
    required: false
  },
  {
    key: 'keywords',
    label: 'Keywords',
    type: 'tags',
    required: false
  }
]
```

## Event Handlers

```tsx
<ConfluencePages
  config={myConfig}
  onPageCreate={(page: ConfluencePage) => {
    // Handle page creation
    console.log('New page created:', page);
    // Custom logic: analytics, notifications, etc.
  }}
  onPageUpdate={(page: ConfluencePage) => {
    // Handle page updates
    console.log('Page updated:', page);
    // Custom logic: cache invalidation, notifications, etc.
  }}
  onPageDelete={(pageId: string) => {
    // Handle page deletion
    console.log('Page deleted:', pageId);
    // Custom logic: cleanup, notifications, etc.
  }}
/>
```

## Advanced Examples

### Multi-Context Application

```tsx
const useConfluenceConfig = (context: string) => {
  const baseConfig = {
    showStats: true,
    enableSearch: true,
    itemsPerPage: 15
  };

  switch (context) {
    case 'engineering':
      return {
        ...baseConfig,
        title: 'Engineering Documentation',
        pageTypes: [
          {
            value: 'documentation',
            label: 'Technical Docs',
            icon: <Code className="w-4 h-4" />,
            color: 'blue'
          },
          {
            value: 'process',
            label: 'Engineering Process',
            icon: <Cog className="w-4 h-4" />,
            color: 'purple'
          }
        ],
        customFields: [
          {
            key: 'techStack',
            label: 'Tech Stack',
            type: 'tags',
            required: false
          }
        ]
      };

    case 'product':
      return {
        ...baseConfig,
        title: 'Product Documentation',
        defaultView: 'grid',
        pageTypes: [
          {
            value: 'feature',
            label: 'Features',
            icon: <Target className="w-4 h-4" />,
            color: 'green'
          }
        ],
        customFields: [
          {
            key: 'priority',
            label: 'Priority',
            type: 'select',
            options: ['P0', 'P1', 'P2', 'P3'],
            required: true
          }
        ]
      };

    default:
      return baseConfig;
  }
};

// Usage
const EngineeringDocs = () => {
  const config = useConfluenceConfig('engineering');
  return <ConfluencePages config={config} />;
};

const ProductDocs = () => {
  const config = useConfluenceConfig('product');
  return <ConfluencePages config={config} />;
};
```

### Integration with External Systems

```tsx
const IntegratedConfluence = () => {
  const config: ConfluencePagesConfig = {
    title: 'Integrated Knowledge Base',
    customActions: [
      {
        key: 'slack',
        label: 'Share to Slack',
        icon: <MessageCircle className="w-4 h-4" />,
        action: async (page) => {
          // Integration with Slack API
          await shareToSlack(page);
        }
      },
      {
        key: 'jira',
        label: 'Create Jira Ticket',
        icon: <ExternalLink className="w-4 h-4" />,
        action: async (page) => {
          // Integration with Jira API
          await createJiraTicket(page);
        },
        condition: (page) => page.type === 'feature'
      }
    ],
    customFields: [
      {
        key: 'jiraTicket',
        label: 'Jira Ticket',
        type: 'text',
        required: false
      },
      {
        key: 'slackChannel',
        label: 'Slack Channel',
        type: 'select',
        options: ['#engineering', '#product', '#design'],
        required: false
      }
    ]
  };

  return (
    <ConfluencePages
      config={config}
      onPageCreate={async (page) => {
        // Auto-create integrations
        if (page.jiraTicket) {
          await linkToJira(page);
        }
        if (page.slackChannel) {
          await notifySlack(page);
        }
      }}
    />
  );
};
```

## Best Practices

### 1. **Configuration Management**
- Keep configurations in separate files for maintainability
- Use TypeScript for type safety
- Create reusable configuration builders

### 2. **Performance**
- Use pagination for large datasets
- Implement proper memoization for expensive operations
- Consider lazy loading for complex configurations

### 3. **User Experience**
- Provide meaningful icons and descriptions
- Use consistent color schemes
- Implement proper loading states

### 4. **Accessibility**
- Ensure proper ARIA labels
- Support keyboard navigation
- Provide alternative text for icons

### 5. **Testing**
- Test different configuration combinations
- Verify custom actions work correctly
- Validate form field behaviors

## Migration Guide

If you're migrating from the static ConfluencePages component:

### Before (Static)
```tsx
<ConfluencePages projectId="123" />
```

### After (Dynamic)
```tsx
<ConfluencePages 
  projectId="123"
  config={{
    title: 'Project Knowledge Base',
    showStats: true,
    defaultView: 'list'
  }}
/>
```

### Backward Compatibility
The component maintains backward compatibility. If no config is provided, it uses sensible defaults that match the previous behavior.

## Conclusion

The dynamic ConfluencePages component provides unprecedented flexibility while maintaining ease of use. You can start with the defaults and gradually add more customization as your needs evolve.

For more examples and advanced use cases, check the implementation in `/src/pages/Confluence.tsx`.
